const Contest = require('../models/Contest');
const Problem = require('../models/Problem');

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
const getContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'name username')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: contests.length,
      data: contests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single contest
// @route   GET /api/contests/:id
// @access  Public
const getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems')
      .populate('createdBy', 'name username')
      .populate('participants.user', 'name username profilePicture');

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create contest
// @route   POST /api/contests
// @access  Private/Admin
const createContest = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const contest = await Contest.create(req.body);

    res.status(201).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
const registerForContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }

    // Check if already registered
    const alreadyRegistered = contest.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this contest',
      });
    }

    contest.participants.push({
      user: req.user.id,
      score: 0,
    });

    await contest.save();

    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
};
