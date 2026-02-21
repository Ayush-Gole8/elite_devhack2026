const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a problem title'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a problem description'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  tags: [{
    type: String,
  }],
  inputFormat: {
    type: String,
    required: true,
  },
  outputFormat: {
    type: String,
    required: true,
  },
  constraints: {
    type: String,
  },
  sampleTestCases: [{
    input: String,
    output: String,
    explanation: String,
  }],
  testCases: [{
    input: String,
    output: String,
    isHidden: {
      type: Boolean,
      default: true,
    },
  }],
  timeLimit: {
    type: Number,
    default: 2000, // in milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 256, // in MB
  },
  points: {
    type: Number,
    default: 100,
  },
  successRate: {
    type: Number,
    default: 0,
  },
  totalSubmissions: {
    type: Number,
    default: 0,
  },
  acceptedSubmissions: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update success rate before saving
problemSchema.pre('save', function(next) {
  if (this.totalSubmissions > 0) {
    this.successRate = (this.acceptedSubmissions / this.totalSubmissions) * 100;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Problem', problemSchema);
