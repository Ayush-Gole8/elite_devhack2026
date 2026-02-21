# Judge Service Documentation

## Overview

Simple vm2-based JavaScript code judge for hackathon scope.

## Features

- ✅ JavaScript-only execution
- ✅ 1-second timeout per test case
- ✅ No `require()` or external modules
- ✅ Safe sandboxed environment
- ✅ Captures console.log output
- ✅ Compares with expected output (whitespace-trimmed)
- ✅ Updates user.solvedCount on first AC

## How It Works

### 1. User Submits Code

```javascript
POST /api/submissions
{
  "problemId": "65f1234567890abcdef12345",
  "code": "const input = INPUT; console.log(input * 2);",
  "language": "javascript"
}
```

### 2. System Creates Submission

- Status: "Pending"
- Returns immediately

### 3. Judge Evaluates Asynchronously

- Fetches problem with test cases
- Runs code against each test in vm2
- Updates submission with results

### 4. Frontend Polls for Results

```javascript
GET /api/submissions/:id
// Check submission.status
```

## Code Execution Example

### Problem: Add Two Numbers

**Input:** `5 3`  
**Output:** `8`

### User Code:

```javascript
// Read input
const input = INPUT.split(' ').map(Number);
const a = input[0];
const b = input[1];

// Output result
console.log(a + b);
```

### How VM Executes:

```javascript
const vm = new NodeVM({
  timeout: 1000,
  console: 'off',
  require: false,
  sandbox: {
    INPUT: "5 3",
    console: {
      log: (...args) => { /* captures output */ }
    }
  }
});

vm.run(userCode);
// Captured output: "8"
// Expected: "8"
// Result: ✅ ACCEPTED
```

## Status Values

| Status | Meaning |
|--------|---------|
| `Pending` | Evaluation in progress |
| `Accepted` | All test cases passed |
| `Wrong Answer` | Output doesn't match |
| `Runtime Error` | Code threw exception or timed out |

## Submission Model

```javascript
{
  user: ObjectId,
  problem: ObjectId,
  code: String,
  language: "javascript",
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Pending",
  testCasesPassed: Number,
  totalTestCases: Number,
  executionTime: Number, // milliseconds
  error: String,
  testResults: [
    {
      passed: Boolean,
      input: String,
      expected: String,
      actual: String,
      error: String
    }
  ]
}
```

## Security

### Disabled:
- ❌ require()
- ❌ File system access
- ❌ Network access
- ❌ Child processes
- ❌ External modules

### Enabled:
- ✅ Basic JavaScript (ES6+)
- ✅ Math operations
- ✅ String manipulation
- ✅ Array/Object methods
- ✅ console.log (mocked)

### Limits:
- ⏱️ Timeout: 1000ms per test
- 💾 Memory: Managed by Node.js (no explicit limit)

## Testing the Judge

### Example Problem Setup:

```javascript
{
  "slug": "add-two-numbers",
  "title": "Add Two Numbers",
  "visibleTests": [
    { "input": "5 3", "output": "8", "is_sample": true }
  ],
  "hiddenTests": [
    { "input": "10 20", "output": "30" },
    { "input": "0 0", "output": "0" }
  ]
}
```

### Test Submission:

```bash
curl -X POST http://localhost:5000/api/submissions \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "problemId": "PROBLEM_ID",
    "code": "const nums = INPUT.split(' ').map(Number); console.log(nums[0] + nums[1]);",
    "language": "javascript"
  }'
```

### Check Result:

```bash
curl http://localhost:5000/api/submissions/SUBMISSION_ID \\
  -H "Authorization: Bearer YOUR_JWT"
```

## Common Input Patterns

### Single Number
```javascript
const n = parseInt(INPUT);
console.log(n * 2);
```

### Multiple Numbers (Space-separated)
```javascript
const nums = INPUT.split(' ').map(Number);
console.log(nums.reduce((a, b) => a + b, 0));
```

### Multiple Lines
```javascript
const lines = INPUT.trim().split('\\n');
const n = parseInt(lines[0]);
const arr = lines[1].split(' ').map(Number);
console.log(Math.max(...arr));
```

### Array Output
```javascript
const result = [1, 2, 3];
console.log(result.join(' '));
```

## Troubleshooting

### "Time Limit Exceeded"
- Infinite loop
- O(n²) algorithm on large input
- Heavy recursion

### "Runtime Error"
- Syntax error in code
- Trying to use require()
- Accessing undefined variables
- Array/string index out of bounds

### "Wrong Answer"
- Output format mismatch
- Extra spaces or newlines
- Wrong algorithm logic
- Not handling edge cases

## Limitations (Hackathon Scope)

⚠️ **NOT PRODUCTION-READY:**

1. No memory tracking (vm2 doesn't provide this)
2. No multi-language support
3. No compilation errors (JS is interpreted)
4. No plagiarism detection
5. No test case streaming
6. Limited error messages

## Future Improvements (Post-Hackathon)

- [ ] Add memory usage tracking
- [ ] Support Python, C++, Java
- [ ] Implement queue system (Bull/Redis)
- [ ] Add detailed error stack traces
- [ ] Implement test case batching
- [ ] Add execution visual feedback
- [ ] Support custom checker functions
- [ ] Implement partial scoring

## API Integration Example (Frontend)

```javascript
// Submit code
const submitCode = async (problemId, code) => {
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ problemId, code, language: 'javascript' })
  });
  
  const { data } = await response.json();
  return data._id; // submission ID
};

// Poll for results
const checkSubmission = async (submissionId) => {
  const response = await fetch(`/api/submissions/${submissionId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  return data.status; // "Pending" | "Accepted" | etc.
};

// Usage
const submissionId = await submitCode(problemId, userCode);

const poll = setInterval(async () => {
  const status = await checkSubmission(submissionId);
  
  if (status !== 'Pending') {
    clearInterval(poll);
    console.log('Final status:', status);
  }
}, 1000); // Check every second
```

---

**Built for Elite DevHack 2026 Hackathon** 🚀
