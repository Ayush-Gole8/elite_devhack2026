const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { executeCode, getSupportedLanguages } = require('../services/executionService');

// @desc    Submit solution
// @route   POST /api/submissions
// @access  Private
const submitSolution = async (req, res) => {
  try {
    const { problemId, code, language = 'javascript' } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide problem ID and code',
      });
    }

    // Validate language
    const validLanguages = getSupportedLanguages();
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language. Supported languages: ${validLanguages.join(', ')}`,
      });
    }

    // Fetch problem with test cases
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Create submission with Pending status
    const submission = await Submission.create({
      user: req.user,
      problem: problemId,
      code,
      language,
      status: 'Pending',
    });

    // Get all test cases (visible + hidden)
    const allTestCases = [
      ...problem.visibleTests,
      ...problem.hiddenTests,
    ];

    if (allTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No test cases found for this problem',
      });
    }

    // Execute code against each test case
    let status = 'Accepted';
    let passedCount = 0;
    const testResults = [];
    let errorMessage = null;

    for (const testCase of allTestCases) {
      const result = await executeCode(language, code, testCase.input);

      // Check for runtime errors
      if (result.stderr && result.stderr.trim() !== '') {
        status = 'Runtime Error';
        errorMessage = result.stderr.substring(0, 500); // Limit error message length
        
        testResults.push({
          passed: false,
          input: testCase.input.substring(0, 100),
          expected: testCase.output.substring(0, 100),
          actual: result.stdout.substring(0, 100),
          error: result.stderr.substring(0, 200),
        });
        
        break; // Stop on first runtime error
      }

      // Compare outputs
      const actualOutput = result.stdout.trim();
      const expectedOutput = testCase.output.trim();
      const passed = actualOutput === expectedOutput;

      testResults.push({
        passed,
        input: testCase.input.substring(0, 100),
        expected: expectedOutput.substring(0, 100),
        actual: actualOutput.substring(0, 100),
        error: null,
      });

      if (passed) {
        passedCount++;
      } else {
        status = 'Wrong Answer';
      }
    }

    // Update submission with results
    submission.status = status;
    submission.testCasesPassed = passedCount;
    submission.totalTestCases = allTestCases.length;
    submission.error = errorMessage;
    submission.testResults = testResults.slice(0, 5); // Store first 5 results
    await submission.save();

    // If accepted, update user's solved count
    if (status === 'Accepted') {
      const user = await User.findById(req.user);
      
      if (user && !user.solvedProblems.includes(problemId)) {
        user.solvedProblems.push(problemId);
        user.solvedCount = user.solvedProblems.length;
        await user.save();
      }
    }

    // Populate the submission before returning
    const populatedSubmission = await Submission.findById(submission._id)
      .populate('user', 'name username')
      .populate('problem', 'title difficulty');

    // Return submission with results
    res.status(201).json({
      success: true,
      data: populatedSubmission,
      message: status === 'Accepted' ? 'All test cases passed!' : 'Submission evaluated',
    });
    
  } catch (error) {
    console.error('Submit solution error:', error);
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
    console.log('=== GET SUBMISSION DEBUG ===');
    console.log('Submission ID:', req.params.id);
    console.log('Request User ID:', req.user);
    console.log('Request User Type:', typeof req.user);
    
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID format',
      });
    }
    
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'name username')
      .populate('problem', 'title difficulty');

    console.log('Submission found:', !!submission);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    console.log('Submission.user:', submission.user);
    console.log('Submission.user type:', typeof submission.user);
    console.log('Submission.user._id:', submission.user?._id);
    console.log('Submission.user._id type:', typeof submission.user?._id);

    // Get the user ID from submission
    let submissionUserId;
    if (submission.user?._id) {
      submissionUserId = submission.user._id.toString();
    } else if (submission.user) {
      submissionUserId = submission.user.toString();
    }
    
    console.log('Submission User ID (extracted):', submissionUserId);
    console.log('Match:', submissionUserId === req.user);
    console.log('=== END DEBUG ===\n');
    
    // Only owner can view
    if (submissionUserId && submissionUserId !== req.user) {
      console.log('Authorization failed: User mismatch');
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
    console.error('Get submission error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  submitSolution,
  getUserSubmissions,
  getProblemSubmissions,
  getSubmission,
};
