const fs = require('fs');
const path = require('path');

const problemsDir = path.join(__dirname, '..', 'data', 'problems');

/**
 * Clean problem descriptions by rewriting them in plain text
 */
const cleanDescriptions = {
  'cf-2197-A': {
    description: 'For an integer x, we call another integer y "friendly" if the following condition holds: y - d(y) = x, where d(y) is the sum of the digits of y.\n\nFor a given integer x, determine how many friendly numbers it has.',
    input_format: 'The first line contains the number of test cases t (1 ≤ t ≤ 500).\n\nEach test case consists of a single line containing one integer x (1 ≤ x ≤ 10^9).',
    output_format: 'For each test case, output one integer — the number of friendly numbers for x.',
    constraints: 'Examples:\n- The number 1 does not have any friendly numbers.\n- The number 18 has 10 friendly numbers: 20, 21, 22, ..., 29. For example, 20 - d(20) = 20 - 2 = 18.\n- The number 998244360 has 10 friendly numbers: 998244400 through 998244409.'
  },
  'cf-2197-B': {
    description: 'Given a permutation p of length n and an array a of length n.\n\nWe call the permutation p "generating" for the array a if the array a can be obtained from the permutation p by applying some number of operations (possibly zero) of the following type:\n\nChoose an index i (1 ≤ i < n) and perform one of two replacements:\n- p[i] := p[i+1]\n- p[i+1] := p[i]\n\nIn other words, in one operation, you can choose two adjacent elements of the array and copy the value of one into the other.\n\nYou need to determine whether the permutation p is generating for the array a.\n\n* A permutation of length n is an array consisting of n distinct integers from 1 to n in arbitrary order. For example, [2,3,1,5,4] is a permutation, but [1,2,2] is not (2 appears twice), and [1,3,4] is not (n=3 but there is 4 in the array).',
    input_format: 'The first line contains the number of test cases t (1 ≤ t ≤ 10^4).\n\nFor each test case:\n- The first line contains a single integer n (2 ≤ n ≤ 2·10^5) — the length of the array and permutation.\n- The second line contains n integers p[1], p[2], ..., p[n] (1 ≤ p[i] ≤ n) — the permutation.\n- The third line contains n integers a[1], a[2], ..., a[n] (1 ≤ a[i] ≤ n) — the array.\n\nThe sum of n across all test cases does not exceed 2·10^5.',
    output_format: 'For each test case, output "YES" if the permutation p is generating for the array a, otherwise output "NO".\n\nYou may output each letter in any case (lowercase or uppercase). For example, "yEs", "yes", "Yes", and "YES" will all be accepted.',
    constraints: 'Examples from test cases:\n- In the first test case, the array is generated using one operation: i=2 and p[i+1] := p[i].\n- In the second test case, it is impossible to obtain a from p.\n- In the third test case, 2 operations are needed: i=1 and p[i] := p[i+1], then i=2 and p[i+1] := p[i].'
  },
  'cf-2189-B': {
    description: 'On an infinite number line at point 0, sits a frog. After many years of meditation, the frog has mastered n unique types of magical jumps. The i-th type of jump allows it to jump forward by no more than a[i] units. In other words, if it was at integer point k, after the jump it can land at any integer point from k to k + a[i].\n\nBut magic always comes with a price; it has been cursed. Before each b[i]-th attempt (before the b[i]-th, 2·b[i]-th, 3·b[i]-th, etc. attempt among the jumps of type i) to use the i-th type of jump, the frog rolls back c[i] units! In other words, if it was at point k, it will first find itself at point k - c[i], and after the jump, it can land at any integer point from k - c[i] to k - c[i] + a[i].\n\nThe frog\'s goal is to reach the point with the number x, using jumps while minimizing the number of rollbacks. Help the frog — find the minimum number of rollbacks it will have to endure on its way to the goal, or determine that it cannot reach point x.',
    input_format: 'The first line contains the number of test cases t (1 ≤ t ≤ 10^4).\n\nFor each test case:\n- The first line contains 2 integers n and x (1 ≤ n ≤ 10^5, 1 ≤ x ≤ 10^18) — the number of types of jumps the frog can make and its final target.\n- The next n lines describe the jump types; the i-th line contains 3 integers a[i], b[i], and c[i] (1 ≤ a[i], b[i], c[i] ≤ 10^6).\n\nThe sum of n across all test cases does not exceed 10^5.',
    output_format: 'For each test case, if the frog can reach point x, output the smallest number of rollbacks it must endure. If it cannot reach point x, output -1.',
    constraints: 'Examples from test cases:\n- In the first test case, the frog can jump forward by 1 unit and reach point 1. Answer is 0.\n- In the third test case, the frog cannot reach point 4.\n- In the fourth test case, the frog can reach point 8, for example: jump using type 1 by 12, type 4 by 1, and type 2 by 10. Sequence: 0 → (rollback) -11 → 1 → 2 → (rollback) -2 → 8.\n- In the sixth test case, the frog reaches point 10 by jumping 6 times by 2 and 1 time by 1. Sequence: 0 → 2 → (rollback) 1 → 3 → 5 → (rollback) 4 → 6 → 8 → (rollback) 7 → 9 → 10.'
  }
};

/**
 * Process and clean problem files
 */
function cleanProblemFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const problem = JSON.parse(content);
    const slug = problem.slug;
    
    // Check if we have a custom clean description for this problem
    if (cleanDescriptions[slug]) {
      const clean = cleanDescriptions[slug];
      problem.description = clean.description;
      problem.input_format = clean.input_format;
      problem.output_format = clean.output_format;
      problem.constraints = clean.constraints;
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(problem, null, 2), 'utf8');
      return { file: path.basename(filePath), status: 'cleaned' };
    }
    
    return { file: path.basename(filePath), status: 'skipped' };
  } catch (error) {
    return { file: path.basename(filePath), status: 'error', error: error.message };
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🧹 Cleaning problem descriptions...\n');
  
  const files = fs.readdirSync(problemsDir).filter(f => f.endsWith('.json'));
  
  const results = files.map(file => cleanProblemFile(path.join(problemsDir, file)));
  
  const cleaned = results.filter(r => r.status === 'cleaned').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const failed = results.filter(r => r.status === 'error');
  
  console.log(`✅ Cleaned: ${cleaned} files`);
  console.log(`⏭️  Skipped: ${skipped} files`);
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length} files`);
    failed.forEach(f => console.log(`   - ${f.file}: ${f.error}`));
  }
  
  console.log('\n✨ Done!');
  console.log(`\n💡 To clean more problems, add them to the cleanDescriptions object in this script.`);
}

main();
