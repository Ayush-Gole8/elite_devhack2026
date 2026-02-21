/**
 * seedProblems.js
 *
 * Usage:
 *   node seedProblems.js <path-or-folder> [options]
 *   node seedProblems.js file1.json file2.json [options]   # pair mode
 *
 * Options:
 *   --allow-overwrite          Allow updating problems even if slug already exists
 *   --archive-dir=<path>       Directory to move processed files into (default: ./scraped/archive)
 *   --no-archive               Skip archiving processed files
 *
 * Exit codes:
 *   0 — completed (even if some files had errors)
 *   1 — fatal startup error (bad args, connection failure, etc.)
 */

require('dotenv').config();
// .env.local overrides .env — used for local seeding outside Docker
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local'), override: true });

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Problem = require('../models/Problem');
const ProblemTests = require('../models/ProblemTests');
const { sanitizeDescription, normalizeIO, computeSha256 } = require('../utils/sanitize');

// ── Constants ─────────────────────────────────────────────────────────────────

const HIDDEN_INLINE_THRESHOLD = 50_000;   // 50 KB — embed inline if below this
const MAX_TEST_IO_BYTES        = 100_000; // 100 KB per individual input or output
const MAX_DESCRIPTION_BYTES    = 200_000; // 200 KB

// ── CLI Parsing ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const flags = {
    allowOverwrite: false,
    archiveDir: path.resolve('./scraped/archive'),
    noArchive: false,
  };

  const positional = [];

  for (const arg of args) {
    if (arg === '--allow-overwrite') {
      flags.allowOverwrite = true;
    } else if (arg.startsWith('--archive-dir=')) {
      flags.archiveDir = path.resolve(arg.split('=')[1]);
    } else if (arg === '--no-archive') {
      flags.noArchive = true;
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

function printUsage() {
  console.log(`
seedProblems.js — Import problem JSON files into MongoDB

Usage:
  node seedProblems.js <path-or-folder> [options]
  node seedProblems.js <meta.json> <tests.json> [options]   # pair mode

Options:
  --allow-overwrite          Overwrite existing problems (default: skip if hash matches)
  --archive-dir=<path>       Destination for processed files (default: ./scraped/archive)
  --no-archive               Do not move processed files after import
  --help                     Show this help

Examples:
  node seedProblems.js ./scraped/
  node seedProblems.js ./scraped/cf-2189-B.json
  node seedProblems.js cf-2189-B-meta.json cf-2189-B-tests.json --allow-overwrite
`);
}

// ── File collection ───────────────────────────────────────────────────────────

/**
 * Returns an array of "job" descriptors: { metaFile, testsFile|null }
 */
function collectJobs(positional) {
  const jobs = [];

  // Pair mode: exactly two JSON files passed
  if (
    positional.length === 2 &&
    positional.every((p) => p.endsWith('.json') && fs.existsSync(p) && fs.statSync(p).isFile())
  ) {
    jobs.push({ metaFile: positional[0], testsFile: positional[1] });
    return jobs;
  }

  for (const target of positional) {
    const resolved = path.resolve(target);

    if (!fs.existsSync(resolved)) {
      console.warn(`[warn] Path not found: ${resolved}`);
      continue;
    }

    const stat = fs.statSync(resolved);

    if (stat.isFile()) {
      if (!resolved.endsWith('.json')) {
        console.warn(`[warn] Skipping non-JSON file: ${resolved}`);
        continue;
      }
      jobs.push({ metaFile: resolved, testsFile: null });
    } else if (stat.isDirectory()) {
      const files = fs
        .readdirSync(resolved)
        .filter((f) => f.endsWith('.json'))
        .sort();

      // Build a map to detect companion *-tests.json files
      const testsMap = {};
      for (const f of files) {
        const m = f.match(/^(.+)-tests\.json$/);
        if (m) testsMap[m[1]] = path.join(resolved, f);
      }

      for (const f of files) {
        if (f.match(/-tests\.json$/)) continue; // handled as companion
        const fullPath = path.join(resolved, f);
        const slug = f.replace(/\.json$/, '');
        const companionTests = testsMap[slug] || null;
        jobs.push({ metaFile: fullPath, testsFile: companionTests });
      }
    }
  }

  return jobs;
}

// ── JSON loading & merging ────────────────────────────────────────────────────

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return { data: JSON.parse(raw), raw };
}

/**
 * Merge metadata file + optional companion tests file into a unified problem object.
 */
function mergeFiles(metaFile, testsFile) {
  const { data: meta, raw: metaRaw } = loadJson(metaFile);
  let testsRaw = metaRaw;

  if (testsFile) {
    const { data: tests, raw } = loadJson(testsFile);
    testsRaw = metaRaw + raw; // combine for hashing
    // Companion file may just be { test_cases: [...] } or a flat array
    const testArray = Array.isArray(tests) ? tests : tests.test_cases || [];
    meta.test_cases = [...(meta.test_cases || []), ...testArray];
  }

  return { problem: meta, rawForHash: testsRaw };
}

// ── Slug generation ───────────────────────────────────────────────────────────

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// ── Test splitting ────────────────────────────────────────────────────────────

/**
 * Returns { visibleTests, hiddenTests } from the raw test_cases array.
 * Enforces the MAX_TEST_IO_BYTES limit per test.
 */
function splitTests(rawTests, slug, errors) {
  const visible = [];
  const hidden = [];

  if (!Array.isArray(rawTests) || rawTests.length === 0) {
    return { visibleTests: visible, hiddenTests: hidden };
  }

  const normalized = rawTests
    .map((tc, idx) => {
      const input  = normalizeIO(tc.input  || '');
      const output = normalizeIO(tc.output || '');

      const inputBytes  = Buffer.byteLength(input,  'utf8');
      const outputBytes = Buffer.byteLength(output, 'utf8');

      if (inputBytes > MAX_TEST_IO_BYTES || outputBytes > MAX_TEST_IO_BYTES) {
        errors.push(
          `[${slug}] test #${idx} skipped — input ${inputBytes}B or output ${outputBytes}B exceeds ${MAX_TEST_IO_BYTES}B limit`
        );
        return null;
      }

      return {
        id: tc.id ? String(tc.id) : String(idx),
        input,
        output,
        is_sample: tc.is_sample === true,
      };
    })
    .filter(Boolean);

  const hasSample = normalized.some((t) => t.is_sample);

  normalized.forEach((tc, idx) => {
    const isSample = hasSample ? tc.is_sample : idx === 0;

    if (isSample) {
      visible.push({ ...tc, is_sample: true });
    } else {
      // hidden tests don't need the is_sample field
      hidden.push({ id: tc.id, input: tc.input, output: tc.output });
    }
  });

  return { visibleTests: visible, hiddenTests: hidden };
}

// ── Size helpers ──────────────────────────────────────────────────────────────

function calcHiddenBytes(hiddenTests) {
  return hiddenTests.reduce(
    (sum, t) =>
      sum + Buffer.byteLength(t.input || '', 'utf8') + Buffer.byteLength(t.output || '', 'utf8'),
    0
  );
}

// ── Archive helper ────────────────────────────────────────────────────────────

function archiveFile(filePath, archiveDir) {
  try {
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    const ts   = new Date().toISOString().replace(/[:.]/g, '-');
    const base = path.basename(filePath, '.json');
    const dest = path.join(archiveDir, `${base}__${ts}.json`);
    fs.renameSync(filePath, dest);
  } catch (err) {
    console.warn(`[warn] Could not archive ${filePath}: ${err.message}`);
  }
}

function moveTooLarge(filePath, tooLargeDir) {
  try {
    if (!fs.existsSync(tooLargeDir)) {
      fs.mkdirSync(tooLargeDir, { recursive: true });
    }
    const dest = path.join(tooLargeDir, path.basename(filePath));
    fs.renameSync(filePath, dest);
  } catch (err) {
    console.warn(`[warn] Could not move too-large file ${filePath}: ${err.message}`);
  }
}

// ── Core upsert ───────────────────────────────────────────────────────────────

async function upsertProblem(problemData, fileHash, flags) {
  const {
    slug,
    title,
    description,
    input_format,
    output_format,
    constraints,
    difficulty,
    tags,
    time_limit_ms,
    memory_limit_kb,
    visibleTests,
    hiddenTests,
    descriptionHash,
    sourceFile,
    rawForHash,
  } = problemData;

  const existing = await Problem.findOne({ slug });

  // ── Skip if hash unchanged ────────────────────────────────────────────────
  if (existing && existing.meta && existing.meta.fileHash === fileHash) {
    return { action: 'skipped', reason: 'identical hash' };
  }

  // ── Build sample from first visible test ──────────────────────────────────
  const sampleTest = visibleTests.find((t) => t.is_sample) || visibleTests[0] || null;
  const sample = sampleTest
    ? { input: sampleTest.input, output: sampleTest.output }
    : { input: '', output: '' };

  // ── Hidden tests size policy ──────────────────────────────────────────────
  const hiddenBytes = calcHiddenBytes(hiddenTests);
  let inlineHidden  = hiddenTests;
  let hiddenTestsRef = null;

  if (hiddenBytes > HIDDEN_INLINE_THRESHOLD) {
    // Save to ProblemTests overflow collection
    const ptDoc = await ProblemTests.findOneAndUpdate(
      { problemSlug: slug },
      {
        $set: {
          problemSlug: slug,
          tests: hiddenTests,
          totalBytes: hiddenBytes,
        },
      },
      { upsert: true, new: true }
    );
    hiddenTestsRef = ptDoc._id;
    inlineHidden   = []; // don't embed inline
  }

  // ── Meta ──────────────────────────────────────────────────────────────────
  const meta = {
    sourceFile:      sourceFile || '',
    fileHash,
    descriptionHash,
    importedAt:      new Date(),
    ...(hiddenTestsRef ? { hiddenTestsRef } : {}),
  };

  // ── Difficulty normalisation ──────────────────────────────────────────────
  const normDifficulty =
    difficulty
      ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
      : 'Medium';

  if (existing) {
    // Update — preserve published flag
    existing.title           = title;
    existing.description     = description;
    existing.input_format    = input_format  || '';
    existing.output_format   = output_format || '';
    existing.constraints     = constraints   || '';
    existing.difficulty      = normDifficulty;
    existing.tags            = Array.isArray(tags) ? tags : [];
    existing.time_limit_ms   = time_limit_ms   || 2000;
    existing.memory_limit_kb = memory_limit_kb || 256000;
    existing.sample          = sample;
    existing.visibleTests    = visibleTests;
    existing.hiddenTests     = inlineHidden;
    existing.meta            = meta;
    existing.version         = (existing.version || 1) + 1;
    // published is intentionally NOT changed
    await existing.save();
    return { action: 'updated', version: existing.version };
  } else {
    await Problem.create({
      slug,
      title,
      description,
      input_format:    input_format  || '',
      output_format:   output_format || '',
      constraints:     constraints   || '',
      difficulty:      normDifficulty,
      tags:            Array.isArray(tags) ? tags : [],
      time_limit_ms:   time_limit_ms   || 2000,
      memory_limit_kb: memory_limit_kb || 256000,
      sample,
      visibleTests,
      hiddenTests:     inlineHidden,
      meta,
      version:         1,
      published:       false,
    });
    return { action: 'created' };
  }
}

// ── Process a single job ──────────────────────────────────────────────────────

async function processJob(job, flags, summary) {
  const { metaFile, testsFile } = job;

  let problem, rawForHash;

  try {
    ({ problem, rawForHash } = mergeFiles(metaFile, testsFile));
  } catch (err) {
    summary.errors.push(`[${metaFile}] JSON parse error: ${err.message}`);
    return;
  }

  // Derive / validate slug
  if (!problem.slug && !problem.title) {
    summary.errors.push(`[${metaFile}] Missing both slug and title — skipping`);
    return;
  }
  if (!problem.slug) {
    problem.slug = generateSlug(problem.title);
    console.log(`[info] Generated slug "${problem.slug}" from title "${problem.title}"`);
  }

  const slug = problem.slug;

  // Description size check
  const descBytes = Buffer.byteLength(problem.description || '', 'utf8');
  if (descBytes > MAX_DESCRIPTION_BYTES) {
    const tooLargeDir = path.resolve('./scraped/too-large');
    summary.errors.push(
      `[${slug}] description too large (${descBytes}B > ${MAX_DESCRIPTION_BYTES}B) — moved to ${tooLargeDir}`
    );
    moveTooLarge(metaFile, tooLargeDir);
    if (testsFile) moveTooLarge(testsFile, tooLargeDir);
    return;
  }

  // Sanitize & hash
  const sanitizedDesc   = sanitizeDescription(problem.description || '');
  const descriptionHash = computeSha256(sanitizedDesc);
  const fileHash        = computeSha256(rawForHash);

  // Split tests
  const perFileErrors = [];
  const { visibleTests, hiddenTests } = splitTests(
    problem.test_cases || [],
    slug,
    perFileErrors
  );
  perFileErrors.forEach((e) => console.warn(`[warn] ${e}`));
  summary.errors.push(...perFileErrors);

  // Upsert
  let result;
  try {
    result = await upsertProblem(
      {
        slug,
        title:           problem.title || slug,
        description:     sanitizedDesc,
        input_format:    problem.input_format  || '',
        output_format:   problem.output_format || '',
        constraints:     problem.constraints   || '',
        difficulty:      problem.difficulty,
        tags:            problem.tags,
        time_limit_ms:   problem.time_limit_ms,
        memory_limit_kb: problem.memory_limit_kb,
        visibleTests,
        hiddenTests,
        descriptionHash,
        sourceFile: path.basename(metaFile),
        rawForHash,
      },
      fileHash,
      flags
    );
  } catch (err) {
    summary.errors.push(`[${slug}] DB error: ${err.message}`);
    return;
  }

  if (result.action === 'skipped') {
    console.log(`[skip]    ${slug} — ${result.reason}`);
    summary.skipped++;
  } else if (result.action === 'created') {
    console.log(`[created] ${slug}`);
    summary.created++;
  } else if (result.action === 'updated') {
    console.log(`[updated] ${slug} (version ${result.version})`);
    summary.updated++;
  }

  // Archive
  if (!flags.noArchive) {
    archiveFile(metaFile, flags.archiveDir);
    if (testsFile) archiveFile(testsFile, flags.archiveDir);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { positional, flags } = parseArgs(process.argv);

  if (positional.length === 0) {
    printUsage();
    process.exit(1);
  }

  // Connect to MongoDB
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('[fatal] MONGO_URI not set in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('[db] Connected to MongoDB');
  } catch (err) {
    console.error(`[fatal] MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  const jobs = collectJobs(positional);

  if (jobs.length === 0) {
    console.warn('[warn] No JSON files found to process');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`[info] ${jobs.length} file(s) to process`);

  const summary = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (const job of jobs) {
    try {
      await processJob(job, flags, summary);
    } catch (err) {
      summary.errors.push(`[${job.metaFile}] Unexpected error: ${err.message}`);
      console.error(`[error] ${job.metaFile}: ${err.message}`);
    }
  }

  // Print summary
  console.log('\n─── Seed Summary ───────────────────────────────');
  console.log(`  Created : ${summary.created}`);
  console.log(`  Updated : ${summary.updated}`);
  console.log(`  Skipped : ${summary.skipped}`);
  console.log(`  Errors  : ${summary.errors.length}`);
  if (summary.errors.length > 0) {
    console.log('\nError details:');
    summary.errors.forEach((e) => console.log(`  • ${e}`));
  }
  console.log('────────────────────────────────────────────────\n');

  await mongoose.disconnect();

  process.exit(summary.errors.some((e) => e.includes('[fatal]')) ? 1 : 0);
}

main().catch((err) => {
  console.error('[fatal] Unhandled error:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
