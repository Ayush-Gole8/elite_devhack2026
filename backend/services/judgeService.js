const axios  = require('axios');
const { spawn } = require('child_process');
const fs    = require('fs');
const os    = require('os');
const path  = require('path');

// ── Configuration ────────────────────────────────────────────────────────────
const JUDGE0_SELF_URL  = process.env.JUDGE0_URL      || 'http://localhost:2358';
const JUDGE0_RAPID_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY   = process.env.JUDGE0_API_KEY  || '';
const PISTON_API_KEY   = process.env.PISTON_API_KEY  || '';  // optional — token from emkc.org
const PISTON_URL       = 'https://emkc.org/api/v2/piston/execute';

// Judge0 language_id → Piston language name
const PISTON_LANG_MAP = {
  63: { language: 'javascript', version: '18.15.0' },
  71: { language: 'python',     version: '3.10.0'  },
  54: { language: 'c++',        version: '10.2.0'  },
  62: { language: 'java',       version: '15.0.2'  },
  50: { language: 'c',          version: '10.2.0'  },
};

// ── Internal helpers ─────────────────────────────────────────────────────────

async function _judge0Self(source_code, language_id, stdin) {
  const response = await axios.post(
    `${JUDGE0_SELF_URL}/submissions?base64_encoded=false&wait=true`,
    { source_code, language_id, stdin },
    { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
  );
  return _normaliseJudge0(response.data, source_code);
}

async function _judge0Rapid(source_code, language_id, stdin) {
  if (!JUDGE0_API_KEY) throw new Error('No RapidAPI key configured');
  const response = await axios.post(
    `${JUDGE0_RAPID_URL}/submissions?base64_encoded=false&wait=true`,
    { source_code, language_id, stdin },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      timeout: 15000,
    }
  );
  return _normaliseJudge0(response.data, source_code);
}

function _normaliseJudge0(data) {
  const statusId = data.status?.id ?? 0;
  let status = 'Accepted';
  let stderr  = data.stderr || data.compile_output || '';
  let stdout  = data.stdout || '';

  if      (statusId === 3)                         status = 'Accepted';
  else if (statusId === 4)                         status = 'Wrong Answer';
  else if (statusId === 5)                         status = 'Time Limit Exceeded';
  else if (statusId === 6)                         status = 'Compilation Error';
  else if (statusId >= 7 && statusId <= 12)        status = 'Runtime Error';
  else if (statusId > 2)                           status = data.status?.description || 'Runtime Error';

  return { stdout, stderr, status, time: data.time, memory: data.memory };
}

async function _piston(source_code, language_id, stdin) {
  const lang = PISTON_LANG_MAP[language_id];
  if (!lang) throw new Error(`Unsupported language ID for Piston: ${language_id}`);

  const pistonHeaders = { 'Content-Type': 'application/json' };
  if (PISTON_API_KEY) pistonHeaders['Authorization'] = `Bearer ${PISTON_API_KEY}`;

  const response = await axios.post(
    PISTON_URL,
    {
      language: lang.language,
      version:  lang.version,
      files: [{ content: source_code }],
      stdin: stdin || '',
    },
    { headers: pistonHeaders, timeout: 15000 }
  );

  const run    = response.data.run    || {};
  const compile = response.data.compile || {};

  if (compile.code !== undefined && compile.code !== 0) {
    return {
      stdout: '',
      stderr: compile.stderr || compile.output || 'Compilation failed',
      status: 'Compilation Error',
    };
  }

  const stderr = run.stderr || '';
  let   status = 'Accepted';

  if (run.code !== 0 || (stderr && stderr.trim())) {
    status = 'Runtime Error';
  }

  return { stdout: run.stdout || run.output || '', stderr, status };
}

// ── Local subprocess executor (no API key, uses installed runtimes) ──────────

const LOCAL_LANG_MAP = {
  63: { ext: 'js',   run: (f)        => ['node',    [f]]                             },
  71: { ext: 'py',   run: (f)        => ['python',  [f]]                             },
  54: { ext: 'cpp',  run: (f, out)   => ({ compile: ['g++', ['-O2', '-o', out, f]], exec: [out, []] }) },
  50: { ext: 'c',    run: (f, out)   => ({ compile: ['gcc',  ['-O2', '-o', out, f]], exec: [out, []] }) },
  62: { ext: 'java', run: (f, _out, dir) => ({ compile: ['javac', [f]], exec: ['java', ['-cp', dir, 'Main']] }) },
};

function _spawnWithStdin(cmd, args, stdin, timeoutMs) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { timeout: timeoutMs });
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('error', err => reject(err));
    proc.on('close', code => resolve({ stdout, stderr, code }));
    if (stdin) { proc.stdin.write(stdin); }
    proc.stdin.end();
  });
}

async function _localExec(source_code, language_id, stdin) {
  const lang = LOCAL_LANG_MAP[language_id];
  if (!lang) throw new Error(`Language ${language_id} not supported for local execution`);

  const tmpDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-'));
  const srcFile = path.join(tmpDir, lang.ext === 'java' ? 'Main.' + lang.ext : `sol.${lang.ext}`);
  const outFile = path.join(tmpDir, process.platform === 'win32' ? 'sol.exe' : 'sol');

  try {
    fs.writeFileSync(srcFile, source_code);

    const langDef = lang.run(srcFile, outFile, tmpDir);
    const TIMEOUT = 10000;

    // Languages that need compilation first
    if (langDef.compile) {
      const comp = await _spawnWithStdin(langDef.compile[0], langDef.compile[1], '', TIMEOUT);
      if (comp.code !== 0) {
        return { stdout: '', stderr: comp.stderr || comp.stdout, status: 'Compilation Error' };
      }
      const run = await _spawnWithStdin(langDef.exec[0], langDef.exec[1], stdin || '', TIMEOUT);
      const status = run.code === 0 ? 'Accepted' : 'Runtime Error';
      return { stdout: run.stdout, stderr: run.stderr, status };
    }

    // Interpreted languages
    const [cmd, args] = langDef;
    const run = await _spawnWithStdin(cmd, args, stdin || '', TIMEOUT);

    // Python/Node: non-zero exit = runtime error
    if (run.code !== 0) {
      return { stdout: run.stdout, stderr: run.stderr || `Process exited with code ${run.code}`, status: 'Runtime Error' };
    }
    return { stdout: run.stdout, stderr: run.stderr, status: 'Accepted' };

  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Execute code against a single stdin, returning { stdout, stderr, status }.
 * Tries (in order):
 *   1. Self-hosted Judge0  (localhost or JUDGE0_URL env var)
 *   2. RapidAPI Judge0     (if JUDGE0_API_KEY is set)
 *   3. Piston public API   (no key required)
 */
async function runCode({ source_code, language_id, stdin }) {
  // 1) Self-hosted Judge0
  try {
    const result = await _judge0Self(source_code, language_id, stdin);
    console.log('[judgeService] Used: self-hosted Judge0');
    return result;
  } catch (err) {
    const isConnErr = !err.response; // network/timeout = no response
    if (isConnErr) {
      console.warn('[judgeService] Self-hosted Judge0 unreachable, trying next…');
    } else {
      // Got an HTTP error back from local Judge0 — still try next
      console.warn('[judgeService] Self-hosted Judge0 error:', err.response?.status, err.message);
    }
  }

  // 2) RapidAPI Judge0
  if (JUDGE0_API_KEY) {
    try {
      const result = await _judge0Rapid(source_code, language_id, stdin);
      console.log('[judgeService] Used: RapidAPI Judge0');
      return result;
    } catch (err) {
      console.warn('[judgeService] RapidAPI Judge0 failed:', err.message);
    }
  }

  // 3) Piston (with optional API key)
  try {
    const result = await _piston(source_code, language_id, stdin);
    console.log('[judgeService] Used: Piston API');
    return result;
  } catch (err) {
    const is401 = err.response?.status === 401;
    console.warn(
      is401
        ? '[judgeService] Piston requires an API token (401), trying local execution…'
        : `[judgeService] Piston failed (${err.message}), trying local execution…`
    );
  }

  // 4) Local subprocess — uses whatever runtimes are installed on the server (no API key needed)
  try {
    const result = await _localExec(source_code, language_id, stdin);
    console.log('[judgeService] Used: local execution');
    return result;
  } catch (err) {
    console.error('[judgeService] Local execution failed:', err.message);
    throw new Error(
      `All execution backends failed. Local error: ${err.message}. ` +
      'To use a remote backend, set JUDGE0_API_KEY (free at rapidapi.com/judge0-official) or PISTON_API_KEY in your .env file.'
    );
  }
}

module.exports = { runCode };

