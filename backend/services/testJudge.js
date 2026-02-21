/**
 * Quick test script for the judge service
 * Run with: node services/testJudge.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { runTestCase } = require('./judgeService');

async function testJudge() {
  console.log('🧪 Testing vm2 Judge Service\n');

  // Test 1: Simple addition
  console.log('Test 1: Add two numbers');
  const code1 = `
    const nums = INPUT.split(' ').map(Number);
    console.log(nums[0] + nums[1]);
  `;
  const result1 = await runTestCase(code1, '5 3', '8', 1000);
  console.log(result1.passed ? '✅ PASSED' : '❌ FAILED');
  console.log('Expected:', JSON.stringify(result1.expected));
  console.log('Actual:', JSON.stringify(result1.actual));
  console.log('');

  // Test 2: Wrong answer
  console.log('Test 2: Wrong answer');
  const code2 = `
    console.log('wrong');
  `;
  const result2 = await runTestCase(code2, '1 2', '3', 1000);
  console.log(result2.passed ? '✅ PASSED' : '❌ FAILED (Expected)');
  console.log('Expected:', JSON.stringify(result2.expected));
  console.log('Actual:', JSON.stringify(result2.actual));
  console.log('');

  // Test 3: Runtime error
  console.log('Test 3: Runtime error');
  const code3 = `
    throw new Error('Oops!');
  `;
  const result3 = await runTestCase(code3, '1', '1', 1000);
  console.log(result3.error ? '✅ ERROR CAUGHT' : '❌ NO ERROR');
  console.log('Error:', result3.error);
  console.log('');

  // Test 4: Timeout
  console.log('Test 4: Timeout (infinite loop)');
  const code4 = `
    while(true) {}
  `;
  const result4 = await runTestCase(code4, '1', '1', 500);
  console.log(result4.error ? '✅ TIMEOUT CAUGHT' : '❌ NO TIMEOUT');
  console.log('Error:', result4.error);
  console.log('');

  // Test 5: Array processing
  console.log('Test 5: Array max value');
  const code5 = `
    const nums = INPUT.split(' ').map(Number);
    console.log(Math.max(...nums));
  `;
  const result5 = await runTestCase(code5, '1 5 3 9 2', '9', 1000);
  console.log(result5.passed ? '✅ PASSED' : '❌ FAILED');
  console.log('Expected:', JSON.stringify(result5.expected));
  console.log('Actual:', JSON.stringify(result5.actual));
  console.log('');

  console.log('\n🎉 Judge tests complete!');
}

testJudge().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
