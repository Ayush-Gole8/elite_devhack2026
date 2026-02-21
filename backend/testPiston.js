const { executeCode, getSupportedLanguages } = require('./services/executionService');

async function testExecution() {
  console.log('Testing Piston API execution...\n');
  console.log('Supported languages:', getSupportedLanguages());
  console.log('');

  // Test 1: JavaScript - Add two numbers
  console.log('Test 1: JavaScript - Add two numbers');
  const jsCode = `
const [a, b] = INPUT.split(' ').map(Number);
console.log(a + b);
  `;
  const jsResult = await executeCode('javascript', jsCode, '5 10');
  console.log('Input: "5 10"');
  console.log('Output:', jsResult.stdout.trim());
  console.log('Expected: "15"');
  console.log('Status:', jsResult.stderr ? 'Error: ' + jsResult.stderr : 'Success');
  console.log('');

  // Test 2: Python - Add two numbers
  console.log('Test 2: Python - Add two numbers');
  const pyCode = `
a, b = map(int, input().split())
print(a + b)
  `;
  const pyResult = await executeCode('python', pyCode, '3 7');
  console.log('Input: "3 7"');
  console.log('Output:', pyResult.stdout.trim());
  console.log('Expected: "10"');
  console.log('Status:', pyResult.stderr ? 'Error' : 'Success');
  console.log('');

  // Test 3: C++ - Add two numbers
  console.log('Test 3: C++ - Add two numbers');
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
  const cppResult = await executeCode('cpp', cppCode, '8 12');
  console.log('Input: "8 12"');
  console.log('Output:', cppResult.stdout.trim());
  console.log('Expected: "20"');
  console.log('Status:', cppResult.stderr ? 'Error' : 'Success');
  console.log('');

  // Test 4: Runtime Error Test
  console.log('Test 4: Runtime Error - Division by zero');
  const errorCode = `
a = int(input())
print(10 / a)
  `;
  const errorResult = await executeCode('python', errorCode, '0');
  console.log('Input: "0"');
  console.log('Error:', errorResult.stderr ? 'Yes (as expected)' : 'No');
  console.log('');

  console.log('All tests completed!');
}

testExecution().catch(console.error);
