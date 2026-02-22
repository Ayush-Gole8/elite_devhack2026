const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const ProblemTests = require('../models/ProblemTests');
const User = require('../models/User');
const Contest = require('../models/Contest');
const { runCode } = require('../services/judgeService');

/**
 * Load the test cases to judge against for a problem.
 * Priority: hiddenTests (inline) > ProblemTests (overflow) > visibleTests (fallback).
 * Returns an array of { input, output } objects.
 */
async function loadJudgeTests(problem) {
  // 1. Inline hidden tests
  if (problem.hiddenTests && problem.hiddenTests.length > 0) {
    return problem.hiddenTests;
  }

  // 2. Overflow ProblemTests collection
  if (problem.meta && problem.meta.hiddenTestsRef) {
    const pt = await ProblemTests.findById(problem.meta.hiddenTestsRef);
    if (pt && pt.tests && pt.tests.length > 0) return pt.tests;
  }

  // 3. Fallback to visible tests (samples)
  return problem.visibleTests || [];
}

// @desc    Submit solution
// @route   POST /api/submissions
// @access  Private
const submitSolution = async (req, res) => {
  try {
    const { problemId, source_code, language_id, contestId } = req.body;

    // Validate required fields
    if (!problemId || !source_code || !language_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide problemId, source_code, and language_id',
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

    // Load test cases for judging (hidden first, fallback to visible)
    const judgeTests = await loadJudgeTests(problem);

    if (!judgeTests || judgeTests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No test cases found for this problem',
      });
    }

    // Initialize submission tracking variables
    let status = 'Accepted';
    let passedCount = 0;
    const testResults = [];
    let errorMessage = null;
    const totalTests = judgeTests.length;

    // Run code against each judge test case (stop on first failure)
    for (const testCase of judgeTests) {
      try {
        // Execute code — judgeService handles backend selection automatically
        const result = await runCode({
          source_code,
          language_id,
          stdin: testCase.input,
        });

        // result shape: { stdout, stderr, status }
        // status is one of: 'Accepted' | 'Compilation Error' | 'Runtime Error'
        //                   | 'Time Limit Exceeded' | 'Wrong Answer'

        const nonAccepted = result.status && result.status !== 'Accepted';

        if (nonAccepted) {
          // Normalise any variant of runtime error descriptions
          if (/runtime error/i.test(result.status) ||
              /nzec/i.test(result.status) ||
              /sigsegv/i.test(result.status) ||
              /sigabrt/i.test(result.status)) {
            status = 'Runtime Error';
          } else {
            status = result.status;
          }
          errorMessage = result.stderr
            ? result.stderr.substring(0, 500)
            : `Execution status: ${result.status}`;

          testResults.push({
            passed: false,
            input: testCase.input.substring(0, 100),
            expected: testCase.output.substring(0, 100),
            actual: result.stdout ? result.stdout.substring(0, 100) : '',
            error: result.stderr ? result.stderr.substring(0, 200) : result.status,
          });
          break;
        }

        // Compare outputs (trim whitespace)
        // Normalise: strip \r (Windows CRLF), collapse trailing spaces per line, then trim
        const normalise = (s) =>
          (s || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
                   .split('\n').map(l => l.trimEnd()).join('\n').trim();

        const actualOutput   = normalise(result.stdout);
        const expectedOutput = normalise(testCase.output);
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
          break;
        }

      } catch (error) {
        status       = 'Runtime Error';
        errorMessage = error.message;

        testResults.push({
          passed: false,
          input: testCase.input.substring(0, 100),
          expected: testCase.output.substring(0, 100),
          actual: '',
          error: error.message.substring(0, 200),
        });
        break;
      }
    }

    // Create and save submission
    const submission = await Submission.create({
      user: req.user,
      problem: problemId,
      code: source_code,
      language: String(language_id),
      status,
      testCasesPassed: passedCount,
      totalTestCases: totalTests,
      error: errorMessage,
      // Store up to 5 failed test results (never expose hidden test I/O for accepted)
      testResults: status === 'Accepted' ? [] : testResults.slice(0, 5),
      contestId: contestId || null, // Add contestId if provided
    });

    // Update problem submission counters
    problem.totalSubmissions = (problem.totalSubmissions || 0) + 1;
    if (status === 'Accepted') {
      problem.acceptedSubmissions = (problem.acceptedSubmissions || 0) + 1;
    }
    await problem.save();

    // If accepted, update user's solved problems
    if (status === 'Accepted') {
      const user = await User.findById(req.user);

      if (user && !user.solvedProblems.includes(problemId)) {
        user.solvedProblems.push(problemId);
        user.solvedCount = user.solvedProblems.length;
        await user.save();
      }

     // Update contest score if this is a contest submission (ACM-ICPC style)
      if (contestId) {
        const contest = await Contest.findById(contestId);
        
        if (contest) {
          // Calculate time from contest start in minutes
          const timeFromStart = Math.floor((Date.now() - new Date(contest.startTime).getTime()) / (1000 * 60));
          
          // Find participant
          const participantIndex = contest.participants.findIndex(
            p => p.user.toString() === req.user
          );
          
          if (participantIndex !== -1) {
            const participant = contest.participants[participantIndex];
            
            // Initialize problemStatus array if not exists
            if (!participant.problemStatus) {
              participant.problemStatus = [];
            }
            
            // Find or create problemStatus entry for this problem
            let problemStatusIndex = participant.problemStatus.findIndex(
              ps => ps.problem.toString() === problemId
            );
            
            if (problemStatusIndex === -1) {
              // Create new problem status entry
              participant.problemStatus.push({
                problem: problemId,
                solved: false,
                attempts: 0,
                wrongAttempts: 0,
                solveTime: 0,
                penalty: 0,
              });
              problemStatusIndex = participant.problemStatus.length - 1;
            }
            
            const problemStatus = participant.problemStatus[problemStatusIndex];
            
            // Increment total attempts
            problemStatus.attempts = (problemStatus.attempts || 0) + 1;
            
            // Process based on submission status
            if (status === 'Accepted' && !problemStatus.solved) {
              // First AC for this problem
              problemStatus.solved = true;
              problemStatus.solveTime = timeFromStart;
              
              // Calculate penalty for this problem (wrongAttempts * penaltyPerWrongAttempt)
              const penaltyMinutes = (problemStatus.wrongAttempts || 0) * (contest.penaltyPerWrongAttempt || 5);
              problemStatus.penalty = penaltyMinutes;
              
              // Update participant score (count of problems solved)
              participant.score = (participant.score || 0) + 1;
              
              // Update total penalty and total time
              participant.penalty = (participant.penalty || 0) + penaltyMinutes;
              participant.totalTime = (participant.totalTime || 0) + timeFromStart + penaltyMinutes;
              
              // Add submission to participant's submissions array
              if (!participant.submissions) {
                participant.submissions = [];
              }
              participant.submissions.push(submission._id);
              
            } else if (status !== 'Accepted' && !problemStatus.solved) {
              // Wrong submission (only count if problem not already solved)
              problemStatus.wrongAttempts = (problemStatus.wrongAttempts || 0) + 1;
            }
            
            // Recalculate ranks using ACM-ICPC logic
            // Primary: problems solved (DESC), Tiebreaker: total time (ASC)
            contest.participants.sort((a, b) => {
              const scoreA = a.score || 0;
              const scoreB = b.score || 0;
              
              if (scoreA !== scoreB) {
                return scoreB - scoreA; // Higher score first
              }
              
              // If scores are equal, sort by total time (lower is better)
              return (a.totalTime || 0) - (b.totalTime || 0);
            });
            
            contest.participants.forEach((p, idx) => {
              p.rank = idx + 1;
            });
            
            await contest.save();
            
            // Emit socket event for real-time leaderboard update
            const io = req.app.get('io');
            if (io) {
              // Populate participants for the socket event
              const populatedContest = await Contest.findById(contestId)
                .populate('participants.user', 'name username profilePhoto')
                .populate('participants.problemStatus.problem', 'title slug');
              
              io.to(`contest_${contestId}`).emit('leaderboardUpdate', populatedContest.participants);
              console.log(`Emitted leaderboard update for contest: ${contestId}`);
            }
          }
        }
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

// @desc    Get all submissions for a problem (optionally filtered to current user)
// @route   GET /api/submissions/problem/:problemId?mine=true
// @access  Private
const getProblemSubmissions = async (req, res) => {
  try {
    const query = { problem: req.params.problemId };
    // ?mine=true → return only the authenticated user's submissions for this problem
    if (req.query.mine === 'true') {
      query.user = req.user;
    }

    const submissions = await Submission.find(query)
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

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Get the user ID from submission
    let submissionUserId;
    if (submission.user?._id) {
      submissionUserId = submission.user._id.toString();
    } else if (submission.user) {
      submissionUserId = submission.user.toString();
    }
    
    // Only owner can view
    if (submissionUserId && submissionUserId !== req.user) {
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
