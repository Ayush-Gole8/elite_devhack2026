const axios = require('axios');

// Self-hosted Judge0 endpoint
const JUDGE0_URL = 'http://localhost:2358';

/**
 * Execute code using self-hosted Judge0
 * @param {Object} params - Execution parameters
 * @param {string} params.source_code - Source code to execute
 * @param {number} params.language_id - Judge0 language ID
 * @param {string} params.stdin - Standard input for the program
 * @returns {Promise<Object>} Execution result from Judge0
 */
async function runCode({ source_code, language_id, stdin }) {
  try {
    // Send POST request to Judge0 with wait=true for synchronous execution
    const response = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code,
        language_id,
        stdin,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data;
  } catch (error) {
    // Handle network errors or Judge0 service errors
    if (error.response) {
      // Judge0 returned an error response
      throw new Error(
        `Judge0 error: ${error.response.status} - ${
          error.response.data?.message || error.response.statusText
        }`
      );
    } else if (error.request) {
      // No response received (Judge0 service down?)
      throw new Error(
        'Cannot connect to Judge0 service. Make sure it is running at ' + JUDGE0_URL
      );
    } else {
      // Other errors
      throw new Error(`Judge0 request failed: ${error.message}`);
    }
  }
}

module.exports = {
  runCode,
};
