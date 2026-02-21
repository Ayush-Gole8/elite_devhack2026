const Problem = require('../models/Problem');
const User    = require('../models/User');

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public (solved flag added when authenticated)
const getProblems = async (req, res) => {
  try {
    const { difficulty, tags, search } = req.query;

    let query = {};

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const problems = await Problem.find(query)
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 });

    // Attach solved flag per-problem when the request is authenticated
    let solvedSet = new Set();
    if (req.user) {
      const userDoc = await User.findById(req.user).select('solvedProblems').lean();
      if (userDoc?.solvedProblems) {
        userDoc.solvedProblems.forEach(id => solvedSet.add(String(id)));
      }
    }

    const data = problems.map(p => {
      const obj = p.toObject();
      obj.solved = solvedSet.has(String(p._id));
      return obj;
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'name username');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Don't send hidden test cases to users
    const problemData = problem.toObject();
    problemData.hiddenTests = [];

    res.status(200).json({
      success: true,
      data: problemData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create problem
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = async (req, res) => {
  try {
    req.body.createdBy = req.user;

    // Create slug from title
    req.body.slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const problem = await Problem.create(req.body);

    res.status(201).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
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

module.exports = {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
};
