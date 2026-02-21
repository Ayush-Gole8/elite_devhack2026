const fs = require('fs');
const path = require('path');

const problemsDir = path.join(__dirname, '..', 'data', 'problems');

/**
 * Clean up malformed math notation in problem descriptions
 * Fixes patterns like: \n𝑛\n𝑛\n → n, \n0\n0\n → 0
 */
function cleanMathNotation(text) {
  if (!text) return text;
  
  let cleaned = text;
  
  // Handle both actual newlines and \n escape sequences
  cleaned = cleaned.replace(/\\n/g, '\n');
  
  // Pass 1: Remove duplicate patterns: \nX\nX\n → X
  for (let i = 0; i < 5; i++) {
    cleaned = cleaned.replace(/\n(.{1,30})\n\1(?=\n| |,|\.|\))/g, ' $1 ');
    cleaned = cleaned.replace(/\n(.{1,30})\n\1$/g, ' $1');
  }
  
  // Pass 2: Remove isolated newline-wrapped text: \nX\n → X
  for (let i = 0; i < 3; i++) {
    cleaned = cleaned.replace(/\n([^\n]{1,25})\n/g, ' $1 ');
  }
  
  // Pass 3: Remove duplicates with space separation (for short tokens)
  // Handle common math duplicates like "𝑎 𝑎" or "10 10"
  for (let i = 0; i < 3; i++) {
    // Match short tokens (1-4 chars) followed by space and the same token
    cleaned = cleaned.replace(/\b(\S{1,4}) \1\b/g, '$1');
  }
  
  // Pass 4: Fix exponent patterns "10 4" → "10^4" when in constraint contexts
  cleaned = cleaned.replace(/(\d+) (\d+) (\d+) (≤|≥|<|>) (.+?) (≤|≥|<|>) \1 \2/g, '$1^$2 $4 $5 $6 $1^$2');
  
  // Fix special characters and HTML entities
  cleaned = cleaned.replace(/→/g, ' → ');
  cleaned = cleaned.replace(/−/g, '-');
  cleaned = cleaned.replace(/≤/g, ' ≤ ');
  cleaned = cleaned.replace(/≥/g, ' ≥ ');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/⋅/g, '·');
  
  // Fix operators
  cleaned = cleaned.replace(/:=/g, ' := ');
  cleaned = cleaned.replace(/\(rollback\)\s*-/g, '(rollback) -');
  
  // Clean up whitespace
  cleaned = cleaned.replace(/ {2,}/g, ' ');
  cleaned = cleaned.replace(/ ,/g, ',');
  cleaned = cleaned.replace(/ \./g, '.');
  cleaned = cleaned.replace(/ :/g, ':');
  cleaned = cleaned.replace(/\( /g, '(');
  cleaned = cleaned.replace(/ \)/g, ')');
  cleaned = cleaned.replace(/\[ /g, '[');
  cleaned = cleaned.replace(/ \]/g, ']');
  
  // Preserve paragraph breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Final cleanup
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Format test cases properly
 */
function formatTestCases(testCases) {
  if (!Array.isArray(testCases)) return testCases;
  
  return testCases.map(tc => ({
    ...tc,
    input: tc.input ? tc.input.trim() : '',
    output: tc.output ? tc.output.trim() : '',
    is_sample: tc.is_sample !== undefined ? tc.is_sample : true
  }));
}

/**
 * Process a single problem file
 */
function processProblemFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const problem = JSON.parse(content);
    
    // Clean up all text fields
    const cleaned = {
      ...problem,
      title: problem.title || '',
      slug: problem.slug || '',
      difficulty: problem.difficulty || 'Medium',
      tags: Array.isArray(problem.tags) ? problem.tags : [],
      time_limit_ms: problem.time_limit_ms || 2000,
      memory_limit_kb: problem.memory_limit_kb || 256000,
      description: cleanMathNotation(problem.description || ''),
      input_format: cleanMathNotation(problem.input_format || ''),
      output_format: cleanMathNotation(problem.output_format || ''),
      constraints: cleanMathNotation(problem.constraints || ''),
      test_cases: formatTestCases(problem.test_cases || [])
    };
    
    // Write back formatted JSON
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf8');
    
    return { file: path.basename(filePath), status: 'success' };
  } catch (error) {
    return { file: path.basename(filePath), status: 'error', error: error.message };
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🧹 Formatting problem files...\n');
  
  if (!fs.existsSync(problemsDir)) {
    console.error(`❌ Problems directory not found: ${problemsDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(problemsDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} problem files\n`);
  
  const results = files.map(file => processProblemFile(path.join(problemsDir, file)));
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error');
  
  console.log(`\n✅ Successfully formatted: ${successful} files`);
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length} files`);
    failed.forEach(f => console.log(`   - ${f.file}: ${f.error}`));
  }
  
  console.log('\n✨ Done!');
}

main();
