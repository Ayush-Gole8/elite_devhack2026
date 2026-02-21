const { NodeVM } = require('vm2');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const judge0Service = require('./judge0Service');

/**
 * Evaluate a submission by running user code against test cases
 * @param {string} submissionId - MongoDB ObjectId of the submission
 * @returns {Promise<Object>} Updated submission object
 */
async function evaluateSubmission(submissionId) {
  try {
    // Fetch submission with populated problem
    const submission = await Submission.findById(submissionId).populate('problem');
    
    if (!submission) {
      throw new Error('Submission not found');
    }

    const problem = submission.problem;
    
    if (!problem) {
      throw new Error('Problem not found');
    }

    // Combine visible and hidden tests
    const allTests = [
      ...problem.visibleTests.map(t => ({ input: t.input, output: t.output })),
      ...problem.hiddenTests.map(t => ({ input: t.input, output: t.output })),
    ];

    if (allTests.length === 0) {
      throw new Error('No test cases found for this problem');
    }

    // Check if using Judge0 or vm2
    const useJudge0 = (submission.language !== 'javascript') || 
                      (submission.language === 'javascript' && judge0Service.isJudge0Configured());
    
    console.log(`Evaluating ${submission.language} submission with ${useJudge0 ? 'Judge0' : 'vm2'}`);

    // Run code against each test case
    const testResults = [];
    let passedCount = 0;
    let firstError = null;
    const startTime = Date.now();

    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      
      let result;
      if (useJudge0) {
        result = await judge0Service.runTestCaseWithJudge0(
          submission.code,
          submission.language,
          test.input,
          test.output,
          problem.time_limit_ms || 2000
        );
      } else {
        result = await runTestCase(submission.code, test.input, test.output, problem.time_limit_ms || 1000);
      }
      
      testResults.push(result);
      
      if (result.passed) {
        passedCount++;
      } else if (!firstError && result.error) {
        firstError = result.error;
      }
    }

    const executionTime = Date.now() - startTime;

    // Determine final status
    let finalStatus = 'Accepted';
    let errorMessage = null;

    if (passedCount === 0 && testResults.some(t => t.error)) {
      // Check if it's a compilation error or runtime error
      const hasCompilationError = testResults.some(t => 
        t.error && (t.error.includes('Compilation') || t.error.includes('compilation'))
      );
      
      if (hasCompilationError) {
        finalStatus = 'Compilation Error';
      } else {
        finalStatus = 'Runtime Error';
      }
      
      errorMessage = firstError;
    } else if (passedCount < allTests.length) {
      finalStatus = 'Wrong Answer';
    }

    // Update submission
    submission.status = finalStatus;
    submission.testCasesPassed = passedCount;
    submission.totalTestCases = allTests.length;
    submission.executionTime = executionTime;
    submission.error = errorMessage;
    submission.testResults = testResults.slice(0, 5); // Store first 5 results only
    await submission.save();

    // Update user's solved count if accepted for first time
    if (finalStatus === 'Accepted') {
      const user = await User.findById(submission.user);
      
      if (user && !user.solvedProblems.includes(problem._id)) {
        user.solvedProblems.push(problem._id);
        user.solvedCount = user.solvedProblems.length;
        await user.save();
      }
    }

    return submission;

  } catch (error) {
    console.error('Judge error:', error);
    
    // Update submission with error
    try {
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'Runtime Error',
        error: error.message,
      });
    } catch (updateError) {
      console.error('Failed to update submission with error:', updateError);
    }
    
    throw error;
  }
}

/**
 * Run user code against a single test case
 * @param {string} code - User's JavaScript code
 * @param {string} input - Test input
 * @param {string} expectedOutput - Expected output
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Object} Test result { passed, input, expected, actual, error }
 */
async function runTestCase(code, input, expectedOutput, timeout = 1000) {
  let output = '';
  let error = null;

  try {
    // Create VM with restricted access
    const vm = new NodeVM({
      timeout,
      console: 'off',
      require: false,
      sandbox: {
        // Provide input as a global variable
        INPUT: input.trim(),
        
        // Mock console.log to capture output
        console: {
          log: (...args) => {
            output += args.join(' ') + '\n';
          },
        },
        
        // Provide input reading function (common in CP)
        readInput: () => input.trim(),
      },
    });

    // Wrap user code to ensure it executes
    const wrappedCode = `
      (function() {
        ${code}
      })();
    `;

    // Run the code
    vm.run(wrappedCode);

    // Compare outputs (trim whitespace)
    const actualOutput = output.trim();
    const expected = expectedOutput.trim();
    const passed = actualOutput === expected;

    return {
      passed,
      input: input.substring(0, 100), // Truncate for storage
      expected: expected.substring(0, 100),
      actual: actualOutput.substring(0, 100),
      error: null,
    };

  } catch (err) {
    // Handle runtime errors and timeouts
    let errorMessage = err.message;
    
    if (err.message.includes('Script execution timed out')) {
      errorMessage = 'Time Limit Exceeded';
    } else if (err.message.includes('Script execution was interrupted')) {
      errorMessage = 'Execution Interrupted';
    }

    return {
      passed: false,
      input: input.substring(0, 100),
      expected: expectedOutput.substring(0, 100),
      actual: output.trim().substring(0, 100),
      error: errorMessage,
    };
  }
}

module.exports = {
  evaluateSubmission,
  runTestCase,
  getSupportedLanguages: judge0Service.getSupportedLanguages,
};
