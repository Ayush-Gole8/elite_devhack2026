const { executeCode } = require('./services/executionService');

async function testRealCase() {
  console.log('Testing with real problem input...\n');

  const input = `6 3
1 2 3
1 2
2 4
3 1 2
4 3 4
2 2 5
1 3
2 5 4
3 3 3
5 4 7
3 7 4
2 1 6
5 3 3 4 4 5
6 5 7
1 2 3 4 5 6`;

  // Test 1: Reading with fs.readFileSync
  console.log('Test 1: Using fs.readFileSync(0)');
  const code1 = `
const input = require('fs').readFileSync(0, 'utf-8').trim().split('\\n');
let idx = 0;
const [t, k] = input[idx++].split(' ').map(Number);

for (let i = 0; i < t; i++) {
  const n = parseInt(input[idx++]);
  const a = input[idx++].split(' ').map(Number);
  
  const freq = {};
  for (const num of a) {
    freq[num] = (freq[num] || 0) + 1;
  }
  
  let canWin = false;
  for (const count of Object.values(freq)) {
    if (count >= k) {
      canWin = true;
      break;
    }
  }
  
  console.log(canWin ? 'YES' : 'NO');
}
  `;

  const result1 = await executeCode('javascript', code1, input);
  console.log('Output:', result1.stdout);
  console.log('Expected: YES NO YES NO YES YES');
  console.log('Match:', result1.stdout.trim() === 'YES NO YES NO YES YES' ? '✅ PASS' : '❌ FAIL');
  console.log('');

  // Test 2: Using INPUT global
  console.log('Test 2: Using INPUT global variable');
  const code2 = `
const lines = INPUT.split('\\n');
let idx = 0;
const [t, k] = lines[idx++].split(' ').map(Number);

for (let i = 0; i < t; i++) {
  const n = parseInt(lines[idx++]);
  const a = lines[idx++].split(' ').map(Number);
  
  const freq = {};
  for (const num of a) {
    freq[num] = (freq[num] || 0) + 1;
  }
  
  let canWin = false;
  for (const count of Object.values(freq)) {
    if (count >= k) {
      canWin = true;
      break;
    }
  }
  
  console.log(canWin ? 'YES' : 'NO');
}
  `;

  const result2 = await executeCode('javascript', code2, input);
  console.log('Output:', result2.stdout);
  console.log('Expected: YES NO YES NO YES YES');
  console.log('Match:', result2.stdout.trim() === 'YES NO YES NO YES YES' ? '✅ PASS' : '❌ FAIL');
  console.log('');

  // Test 3: Simple test
  console.log('Test 3: Simple addition test');
  const code3 = `
const [a, b] = INPUT.split(' ').map(Number);
console.log(a + b);
  `;

  const result3 = await executeCode('javascript', code3, '5 10');
  console.log('Output:', result3.stdout.trim());
  console.log('Expected: 15');
  console.log('Match:', result3.stdout.trim() === '15' ? '✅ PASS' : '❌ FAIL');
  console.log('');
}

testRealCase().catch(console.error);
