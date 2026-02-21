const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * ProblemTests — overflow store for hidden test cases.
 *
 * Used when the hiddenTests array on a Problem document exceeds the inline
 * threshold (e.g. would push the document past MongoDB's 16 MB BSON limit).
 * In that case hiddenTests is left empty on the Problem and the full test
 * suite is stored here, keyed by problemSlug.
 */

const testEntrySchema = new Schema(
  {
    /** Raw input string for the test case */
    input: { type: String, default: '' },
    /** Expected output string for the test case */
    output: { type: String, default: '' },
    /** Original id from the import source */
    id: { type: String, default: '' },
  },
  { _id: false }
);

const problemTestsSchema = new Schema(
  {
    /**
     * Matches Problem.slug — the logical foreign key.
     * Indexed for fast lookup during judging.
     */
    problemSlug: {
      type: String,
      required: [true, 'problemSlug is required'],
      index: true,
    },

    /** Array of hidden test cases for this problem */
    tests: {
      type: [testEntrySchema],
      default: [],
    },

    /**
     * Total byte size of all input + output strings combined.
     * Stored to help decide whether to keep tests inline or in this
     * overflow collection, and to surface storage metrics.
     */
    totalBytes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    /** Only createdAt is needed; updatedAt is not required for this store */
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'problem_tests',
  }
);

const ProblemTests = mongoose.model('ProblemTests', problemTestsSchema);

module.exports = ProblemTests;
