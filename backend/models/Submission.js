const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  code: {
    type: String,
    required: [true, 'Please provide code'],
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript'], // Temporarily JavaScript-only until Piston whitelist or Judge0 configured
    default: 'javascript',
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'],
    default: 'Pending',
  },
  testCasesPassed: {
    type: Number,
    default: 0,
  },
  totalTestCases: {
    type: Number,
    default: 0,
  },
  executionTime: {
    type: Number, // in milliseconds
  },
  memoryUsed: {
    type: Number, // in MB
  },
  error: {
    type: String,
  },
  testResults: [{
    passed: Boolean,
    input: String,
    expected: String,
    actual: String,
    error: String,
  }],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
  },
});

module.exports = mongoose.model('Submission', submissionSchema);
