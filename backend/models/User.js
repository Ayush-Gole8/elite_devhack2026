const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  name: {
    type: String,
    trim: true,
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  provider: {
    type: String,
    default: 'google',
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  social: {
    portfolio: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
  },
  skills: [{
    type: String,
  }],
  experience: {
    type: String,
    default: '',
  },
  education: {
    type: String,
    default: '',
  },
  solvedCount: {
    type: Number,
    default: 0,
  },
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
