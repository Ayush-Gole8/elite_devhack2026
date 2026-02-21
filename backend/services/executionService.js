const axios = require('axios');
const { NodeVM } = require('vm2');

// Piston API endpoint
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

// Language mapping for Piston API
const languageMap = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'c++',
};

/**
 * Execute JavaScript code locally using vm2 (fallback)
 * @param {string} sourceCode - JavaScript source code
 * @param {string} input - stdin input
 * @returns {Object} Execution result { stdout, stderr, code }
 */
function executeJavaScriptLocally(sourceCode, input) {
  let output = '';
  let error = '';

  try {
    // Create a simple readline interface mock
    const lines = input.trim().split('\n');
    let lineIndex = 0;

    const vm = new NodeVM({
      timeout: 5000,
      console: 'off',
      require: {
        external: false,
        builtin: ['*'],
        root: './',
        mock: {
          fs: {
            readFileSync: (fd) => {
              if (fd === 0 || fd === '/dev/stdin') {
                return input.trim();
              }
              throw new Error('File system access not allowed');
            },
          },
          readline: {
            createInterface: () => ({
              question: (query, callback) => {
                if (lineIndex < lines.length) {
                  callback(lines[lineIndex++]);
                } else {
                  callback('');
                }
              },
              close: () => {},
            }),
          },
        },
      },
      sandbox: {
        INPUT: input.trim(),
        console: {
          log: (...args) => {
            output += args.join(' ') + '\n';
          },
        },
        print: (...args) => {
          output += args.join(' ') + '\n';
        },
        readInput: () => input.trim(),
        readline: () => {
          if (lineIndex < lines.length) {
            return lines[lineIndex++];
          }
          return '';
        },
      },
    });

    const wrappedCode = `
      (function() {
        ${sourceCode}
      })();
    `;

    vm.run(wrappedCode);

    return {
      stdout: output,
      stderr: error,
      code: 0,
    };

  } catch (err) {
    return {
      stdout: output,
      stderr: err.message,
      code: 1,
    };
  }
}

/**
 * Execute code using Piston API
 * @param {string} language - Programming language (javascript, python, cpp)
 * @param {string} sourceCode - User's source code
 * @param {string} input - stdin input for the program
 * @returns {Object} Execution result { stdout, stderr, code }
 */
async function executeCode(language, sourceCode, input) {
  // For JavaScript, use local vm2 as fallback (Piston is whitelist-only)
  if (language === 'javascript') {
    console.log('Using local vm2 for JavaScript execution');
    return executeJavaScriptLocally(sourceCode, input);
  }

  // For other languages, try Piston API
  try {
    // Map language to Piston format
    const pistonLanguage = languageMap[language];
    
    if (!pistonLanguage) {
      return {
        stdout: '',
        stderr: `Unsupported language: ${language}`,
        code: 1,
      };
    }

    // Prepare request payload
    const payload = {
      language: pistonLanguage,
      version: '*',
      files: [
        {
          content: sourceCode,
        },
      ],
      stdin: input || '',
    };

    // Call Piston API
    const response = await axios.post(PISTON_API_URL, payload, {
      timeout: 10000, // 10 second timeout
    });

    // Return execution result
    return response.data.run;

  } catch (error) {
    console.error('Piston API Error:', error.message);
    
    // Log more details for debugging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Return helpful error message
    const errorMessage = error.response?.data?.message || error.message;
    
    if (errorMessage.includes('whitelist')) {
      return {
        stdout: '',
        stderr: 'Piston API requires whitelisting. Python/C++ currently unavailable. Use JavaScript or see PISTON_API_ISSUE.md for alternatives.',
        code: 1,
      };
    }
    
    // Return error object
    return {
      stdout: '',
      stderr: errorMessage || 'Execution failed',
      code: 1,
    };
  }
}

/**
 * Get supported languages
 * @returns {Array<string>} List of supported languages
 */
function getSupportedLanguages() {
  // JavaScript always supported via vm2
  // Python and C++ require Piston whitelist or Judge0
  return ['javascript']; // Temporarily only JavaScript until Piston issue resolved
}

module.exports = {
  executeCode,
  getSupportedLanguages,
};

