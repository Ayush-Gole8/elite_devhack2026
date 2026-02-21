const mongoose = require('mongoose');

const { Schema } = mongoose;

/** Sub-schema for a single visible test case */
const testCaseSchema = new Schema(
  {
    /** Raw input string for the test */
    input: { type: String, default: '' },
    /** Expected output string */
    output: { type: String, default: '' },
    /** Original id from the import source */
    id: { type: String, default: '' },
    /** Whether this test is shown to users as a sample */
    is_sample: { type: Boolean, default: false },
  },
  { _id: false }
);

/** Sub-schema for hidden / private test cases — NEVER exposed in public APIs */
const hiddenTestSchema = new Schema(
  {
    /** Raw input string */
    input: { type: String, default: '' },
    /** Expected output string */
    output: { type: String, default: '' },
    /** Original id from the import source */
    id: { type: String, default: '' },
  },
  { _id: false }
);

/** Representative sample displayed prominently on the problem page */
const sampleSchema = new Schema(
  {
    /** Sample input text */
    input: { type: String, default: '' },
    /** Sample expected output text */
    output: { type: String, default: '' },
  },
  { _id: false }
);

/** Import / deduplication metadata */
const metaSchema = new Schema(
  {
    /** Original filename that was imported (e.g. "cf-2189-B.json") */
    sourceFile: { type: String, default: '' },
    /** SHA-256 hash of the raw source file for dedup / change detection */
    fileHash: { type: String, default: '' },
    /** SHA-256 hash of the description string alone (detect silent edits) */
    descriptionHash: { type: String, default: '' },
    /** UTC timestamp when the problem was first imported */
    importedAt: { type: Date, default: null },
    /**
     * Reference to a ProblemTests document when hidden tests exceed the
     * inline threshold (50 KB). Null when tests are stored inline.
     */
    hiddenTestsRef: { type: Schema.Types.ObjectId, ref: 'ProblemTests', default: null },
  },
  { _id: false }
);

const problemSchema = new Schema(
  {
    /**
     * URL-safe unique identifier (e.g. "cf-2189-B").
     * Primary lookup key in routes — keep lowercase and hyphenated.
     */
    slug: {
      type: String,
      required: [true, 'slug is required'],
      unique: true,
      trim: true,
      index: true,
    },

    /** Display title shown to users */
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
    },

    /**
     * Full problem statement.
     * May contain sanitized HTML (rendered in the UI) or plain text.
     */
    description: {
      type: String,
      default: '',
    },

    /** Human-readable input specification */
    input_format: {
      type: String,
      default: '',
    },

    /** Human-readable output specification */
    output_format: {
      type: String,
      default: '',
    },

    /** Notes / constraints section (may include examples and edge cases) */
    constraints: {
      type: String,
      default: '',
    },

    /**
     * Problem difficulty tier.
     * Normalised to title-case on save so "easy" / "EASY" → "Easy".
     */
    difficulty: {
      type: String,
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'difficulty must be Easy, Medium, or Hard',
      },
      default: 'Medium',
    },

    /** Algorithmic / topic tags (e.g. ["greedy", "math"]) */
    tags: {
      type: [String],
      default: [],
    },

    /** Maximum allowed runtime per test case in milliseconds */
    time_limit_ms: {
      type: Number,
      default: 2000,
      min: [100, 'time_limit_ms must be at least 100 ms'],
    },

    /** Maximum allowed memory per test case in kilobytes */
    memory_limit_kb: {
      type: Number,
      default: 256000,
      min: [1024, 'memory_limit_kb must be at least 1024 KB'],
    },

    /**
     * Representative sample test shown prominently on the problem page.
     * Derived at import time from the first test_case where is_sample=true,
     * or the first test overall when none is explicitly marked as a sample.
     */
    sample: {
      type: sampleSchema,
      default: () => ({ input: '', output: '' }),
    },

    /**
     * Tests that are visible to users (samples + any unlocked tests).
     * Returned in public problem-detail API responses.
     */
    visibleTests: {
      type: [testCaseSchema],
      default: [],
    },

    /**
     * Private judge tests used for automated judging only.
     * MUST NOT be included in any public API response.
     */
    hiddenTests: {
      type: [hiddenTestSchema],
      default: [],
    },

    /** Import metadata for deduplication and audit trails */
    meta: {
      type: metaSchema,
      default: () => ({}),
    },

    /**
     * Schema version number.  Increment when making breaking structural
     * changes so migration scripts can target specific versions.
     */
    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    /**
     * Controls visibility in public listings.
     * Only published problems appear in browse/search and can be submitted.
     */
    published: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── Submission statistics ─────────────────────────────────────────────

    /** Total number of submissions ever made against this problem */
    totalSubmissions: {
      type: Number,
      default: 0,
    },

    /** Number of submissions that were judged Accepted */
    acceptedSubmissions: {
      type: Number,
      default: 0,
    },

    /**
     * Acceptance rate as a percentage (0-100).
     * Recomputed automatically in the pre-save hook.
     */
    successRate: {
      type: Number,
      default: 0,
    },

    /** User who created / imported this problem */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    /** Automatically manage createdAt and updatedAt fields */
    timestamps: true,
    collection: 'problems',
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

/** Full-text search across title and description */
problemSchema.index({ title: 'text', description: 'text' });

/** Fast filtering by difficulty (often combined with published) */
problemSchema.index({ difficulty: 1, published: 1 });

/** Tag-based browsing */
problemSchema.index({ tags: 1 });

// ── Pre-save hook ─────────────────────────────────────────────────────────────

problemSchema.pre('save', async function () {
  // Normalise difficulty to title-case so callers can pass "easy" / "EASY"
  if (this.isModified('difficulty') && this.difficulty) {
    const d = this.difficulty.trim();
    this.difficulty = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
  }

  // Recompute acceptance rate whenever submission counts change
  if (this.isModified('totalSubmissions') || this.isModified('acceptedSubmissions')) {
    this.successRate =
      this.totalSubmissions > 0
        ? (this.acceptedSubmissions / this.totalSubmissions) * 100
        : 0;
  }
});

// ── Virtual ───────────────────────────────────────────────────────────────────

/** Total number of test cases (visible + hidden) */
problemSchema.virtual('totalTests').get(function () {
  return this.visibleTests.length + this.hiddenTests.length;
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;

