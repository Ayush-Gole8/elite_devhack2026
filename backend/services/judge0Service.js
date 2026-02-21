const axios = require('axios');

// Judge0 API Configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  cpp: 54,         // C++ (GCC 9.2.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  c: 50,           // C (GCC 9.2.0)
};

/**
 * Submit code to Judge0 for execution
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {string} stdin - Input for the program
 * @param {number} timeLimit - Time limit in seconds
 * @returns {Promise<Object>} Submission token
 */
async function submitToJudge0(code, language, stdin = '', timeLimit = 2) {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const options = {
    method: 'POST',
    url: `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    data: {
      language_id: languageId,
      source_code: code,
      stdin: stdin,
      cpu_time_limit: timeLimit,
      wall_time_limit: timeLimit + 1,
      memory_limit: 256000, // 256 MB
      enable_network: false,
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Judge0 submission error:', error.response?.data || error.message);
    throw new Error('Failed to submit to Judge0');
  }
}

/**
 * Get submission result from Judge0
 * @param {string} token - Submission token
 * @returns {Promise<Object>} Submission result
 */
async function getSubmissionResult(token) {
  const options = {
    method: 'GET',
    url: `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
    headers: {
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Judge0 get result error:', error.response?.data || error.message);
    throw new Error('Failed to get result from Judge0');
  }
}

/**
 * Wait for submission to complete and return result
 * @param {string} token - Submission token
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Polling interval in ms
 * @returns {Promise<Object>} Final submission result
 */
async function waitForResult(token, maxAttempts = 10, interval = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));
    
    const result = await getSubmissionResult(token);
    
    // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, etc.
    if (result.status.id > 2) {
      return result;
    }
  }
  
  throw new Error('Submission timed out');
}

/**
 * Execute code against a single test case using Judge0
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {string} input - Test input
 * @param {string} expectedOutput - Expected output
 * @param {number} timeLimit - Time limit in seconds
 * @returns {Promise<Object>} Test result
 */
async function runTestCaseWithJudge0(code, language, input, expectedOutput, timeLimit = 2) {
  try {
    // Submit to Judge0
    const submission = await submitToJudge0(code, language, input, timeLimit);
    
    // Wait for result
    const result = await waitForResult(submission.token);
    
    // Parse result
    const output = (result.stdout || '').trim();
    const expected = expectedOutput.trim();
    const passed = output === expected;
    
    // Map Judge0 status to our status
    let status = 'Accepted';
    let error = null;
    
    if (result.status.id === 3) {
      // Accepted
      status = passed ? 'Accepted' : 'Wrong Answer';
    } else if (result.status.id === 4) {
      status = 'Wrong Answer';
    } else if (result.status.id === 5) {
      status = 'Time Limit Exceeded';
      error = 'Time limit exceeded';
    } else if (result.status.id === 6) {
      status = 'Compilation Error';
      error = result.compile_output || 'Compilation failed';
    } else if (result.status.id >= 7 && result.status.id <= 12) {
      status = 'Runtime Error';
      error = result.stderr || result.message || 'Runtime error occurred';
    } else {
      status = 'Runtime Error';
      error = result.status.description;
    }
    
    return {
      passed,
      status,
      input,
      expectedOutput: expected,
      actualOutput: output,
      error,
      executionTime: parseFloat(result.time || 0) * 1000, // Convert to ms
      memory: result.memory || 0,
    };
  } catch (error) {
    return {
      passed: false,
      status: 'Runtime Error',
      input,
      expectedOutput: expectedOutput.trim(),
      actualOutput: '',
      error: error.message || 'Execution failed',
      executionTime: 0,
      memory: 0,
    };
  }
}

/**
 * Check if Judge0 API is configured
 * @returns {boolean}
 */
function isJudge0Configured() {
  return !!JUDGE0_API_KEY && JUDGE0_API_KEY !== '';
}

/**
 * Get supported languages
 * @returns {Array<string>}
 */
function getSupportedLanguages() {
  if (isJudge0Configured()) {
    return ['javascript', 'python', 'cpp', 'java', 'c'];
  }
  return ['javascript']; // Fallback to vm2
}

module.exports = {
  submitToJudge0,
  getSubmissionResult,
  waitForResult,
  runTestCaseWithJudge0,
  isJudge0Configured,
  getSupportedLanguages,
  LANGUAGE_IDS,
};
