const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

// @desc    Submit solution
// @route   POST /api/submissions
// @access  Private
const submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide problem ID, code, and language',
      });
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Create submission
    const submission = await Submission.create({
      user: req.user.id,
      problem: problemId,
      code,
      language,
      totalTestCases: problem.testCases.length,
    });

    // TODO: Run code against test cases (implement code execution logic)
    // For now, we'll simulate the evaluation
    const evaluation = await evaluateSubmission(submission, problem);

    // Update submission with results
    submission.status = evaluation.status;
    submission.testCasesPassed = evaluation.testCasesPassed;
    submission.executionTime = evaluation.executionTime;
    submission.memoryUsed = evaluation.memoryUsed;
    submission.error = evaluation.error;
    await submission.save();

    // Update problem statistics
    problem.totalSubmissions += 1;
    if (evaluation.status === 'Accepted') {
      problem.acceptedSubmissions += 1;
    }
    await problem.save();

    // Update user's solved problems if accepted
    if (evaluation.status === 'Accepted') {
      const user = await User.findById(req.user.id);
      if (!user.solvedProblems.includes(problemId)) {
        user.solvedProblems.push(problemId);
        user.rating += 10; // Simple rating increase
        await user.save();
      }
    }

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all submissions for a user
// @route   GET /api/submissions/user/:userId
// @access  Private
const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.params.userId })
      .populate('problem', 'title difficulty')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all submissions for a problem
// @route   GET /api/submissions/problem/:problemId
// @access  Private
const getProblemSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ problem: req.params.problemId })
      .populate('user', 'name username')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'name username')
      .populate('problem', 'title difficulty');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Only owner or admin can view
    if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission',
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to evaluate submission
const evaluateSubmission = async (submission, problem) => {
  // This is a placeholder implementation
  // In a real application, you would:
  // 1. Set up a sandboxed environment
  // 2. Run the code against test cases
  // 3. Check time and memory limits
  // 4. Return the results

  // Simulate evaluation
  const passed = Math.random() > 0.3; // 70% pass rate for simulation

  return {
    status: passed ? 'Accepted' : 'Wrong Answer',
    testCasesPassed: passed ? problem.testCases.length : Math.floor(Math.random() * problem.testCases.length),
    executionTime: Math.floor(Math.random() * 1000) + 100, // 100-1100ms
    memoryUsed: Math.floor(Math.random() * 50) + 10, // 10-60MB
    error: passed ? null : 'Expected output does not match actual output',
  };
};

module.exports = {
  submitSolution,
  getUserSubmissions,
  getProblemSubmissions,
  getSubmission,
};
