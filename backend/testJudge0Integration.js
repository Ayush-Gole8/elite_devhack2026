/**
 * Test Judge0 Integration
 * 
 * Before running:
 * 1. Ensure Judge0 is running: docker ps | grep judge0
 * 2. Ensure MongoDB is running
 * 3. Run: node testJudge0Integration.js
 */

const { runCode } = require('./services/judgeService');

async function testJudge0() {
  console.log('🧪 Testing Judge0 Integration\n');
  console.log('=' .repeat(60));

  // Test 1: Python - Simple addition
  console.log('\n📝 Test 1: Python - Add two numbers');
  console.log('Code: print(int(input()) + int(input()))');
  console.log('Input: 5\\n10');
  
  try {
    const result1 = await runCode({
      source_code: 'print(int(input()) + int(input()))',
      language_id: 71, // Python
      stdin: '5\n10',
    });

    console.log('✅ Output:', result1.stdout?.trim());
    console.log('   Status:', result1.status?.description);
    console.log('   Expected: 15');
    console.log('   Match:', result1.stdout?.trim() === '15' ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: JavaScript - String reversal
  console.log('\n📝 Test 2: JavaScript - Print "Hello World"');
  console.log('Code: console.log("Hello World")');
  
  try {
    const result2 = await runCode({
      source_code: 'console.log("Hello World")',
      language_id: 63, // JavaScript
      stdin: '',
    });

    console.log('✅ Output:', result2.stdout?.trim());
    console.log('   Status:', result2.status?.description);
    console.log('   Expected: Hello World');
    console.log('   Match:', result2.stdout?.trim() === 'Hello World' ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: C++ - Simple addition
  console.log('\n📝 Test 3: C++ - Add two numbers');
  const cppCode = `
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
  `;
  console.log('Input: 8 12');
  
  try {
    const result3 = await runCode({
      source_code: cppCode,
      language_id: 54, // C++
      stdin: '8 12',
    });

    console.log('✅ Output:', result3.stdout?.trim());
    console.log('   Status:', result3.status?.description);
    console.log('   Expected: 20');
    console.log('   Match:', result3.stdout?.trim() === '20' ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: Runtime Error - Division by zero
  console.log('\n📝 Test 4: Python - Runtime error (division by zero)');
  console.log('Code: print(10 / 0)');
  
  try {
    const result4 = await runCode({
      source_code: 'print(10 / 0)',
      language_id: 71, // Python
      stdin: '',
    });

    console.log('   Output:', result4.stdout?.trim() || '(none)');
    console.log('   Status:', result4.status?.description);
    console.log('   Stderr:', result4.stderr?.substring(0, 100) || '(none)');
    console.log('   Expected: Runtime Error');
    console.log('   Match:', result4.stderr ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 5: Compilation Error
  console.log('\n📝 Test 5: C++ - Compilation error');
  const invalidCpp = `
#include <iostream>
int main() {
    this_is_invalid_syntax;
    return 0;
}
  `;
  
  try {
    const result5 = await runCode({
      source_code: invalidCpp,
      language_id: 54, // C++
      stdin: '',
    });

    console.log('   Status:', result5.status?.description);
    console.log('   Compile Output:', result5.compile_output?.substring(0, 100) || '(none)');
    console.log('   Expected: Compilation Error');
    console.log('   Match:', result5.compile_output ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run tests
testJudge0().catch(console.error);
