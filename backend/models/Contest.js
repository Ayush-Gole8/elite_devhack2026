const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a contest title'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  penaltyPerWrongAttempt: {
    type: Number,
    default: 5, // minutes per wrong attempt (ACM-ICPC style)
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    score: {
      type: Number,
      default: 0, // count of problems solved
    },
    penalty: {
      type: Number,
      default: 0, // total penalty in minutes
    },
    totalTime: {
      type: Number,
      default: 0, // solve time + penalty (for tiebreaker)
    },
    rank: {
      type: Number,
    },
    submissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
    }],
    problemStatus: [{
      problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
      },
      solved: {
        type: Boolean,
        default: false,
      },
      attempts: {
        type: Number,
        default: 0, // total submission attempts
      },
      wrongAttempts: {
        type: Number,
        default: 0, // wrong attempts before AC
      },
      solveTime: {
        type: Number,
        default: 0, // minutes from contest start to first AC
      },
      penalty: {
        type: Number,
        default: 0, // wrongAttempts * penaltyPerWrongAttempt
      },
    }],
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  isFrozen: {
    type: Boolean,
    default: false, // freeze leaderboard after contest ends
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to freeze leaderboard
contestSchema.methods.freezeLeaderboard = function() {
  this.isFrozen = true;
  return this.save();
};

module.exports = mongoose.model('Contest', contestSchema);
