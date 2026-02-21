# Multi-Language Support Implementation Guide

## 🎯 Overview

Your coding platform now supports **5 programming languages** with Judge0:
- ✅ **JavaScript** (Node.js)
- ✅ **Python** 3
- ✅ **C++** (GCC)
- ✅ **Java** (OpenJDK)
- ✅ **C** (GCC)

## 🔧 Backend Implementation

### 1. Judge0 Service (`services/judgeService.js`)

Simple, clean service that connects to self-hosted Judge0:

```javascript
const { runCode } = require('./services/judgeService');

const result = await runCode({
  source_code: 'print("Hello")',
  language_id: 71,  // Python
  stdin: 'input data'
});

console.log(result.stdout);  // Output
console.log(result.status.description);  // "Accepted"
```

**Features:**
- Synchronous execution with `wait=true` (no polling)
- Connects to `http://localhost:2358`
- 30-second timeout
- Comprehensive error handling

### 2. Submission Controller (`controllers/submissionController.js`)

Updated to handle Judge0 submissions:

**Request Format:**
```json
{
  "problemId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "source_code": "print('Hello World')",
  "language_id": 71
}
```

**Execution Flow:**
1. Validates inputs (problemId, source_code, language_id)
2. Fetches problem with test cases
3. Loops through `problem.visibleTests`
4. For each test:
   - Calls Judge0 via `runCode()`
   - Checks compilation errors
   - Checks runtime errors
   - Compares output with expected
   - **Early break** on first failure
5. Saves submission with status
6. Updates user's solved problems if Accepted

**Response Statuses:**
- ✅ `Accepted` - All tests pass
- ❌ `Wrong Answer` - Output mismatch
- 🔴 `Runtime Error` - stderr or status error
- ⏱️ `Time Limit Exceeded` - TLE from Judge0
- 🛠️ `Compilation Error` - Compilation failed

### 3. Submission Model (`models/Submission.js`)

Updated to accept Judge0 language IDs:

```javascript
language: {
  type: String,
  required: true,
  // Accepts "63", "71", "54", "62", "50" (Judge0 IDs)
  default: '63'
}
```

## 🎨 Frontend Implementation

### 1. Language Selector

Added dropdown with 5 languages in the code editor:

```tsx
const languages = [
  { id: '63', name: 'JavaScript', monaco: 'javascript', ... },
  { id: '71', name: 'Python', monaco: 'python', ... },
  { id: '54', name: 'C++', monaco: 'cpp', ... },
  { id: '62', name: 'Java', monaco: 'java', ... },
  { id: '50', name: 'C', monaco: 'c', ... },
];
```

**Features:**
- Dropdown in editor header
- Automatically loads starter template when language changes
- Monaco editor syntax highlighting updates automatically

### 2. Starter Templates

Each language has a proper starter template:

**JavaScript:**
```javascript
// Write your solution here
console.log("Hello World");
```

**Python:**
```python
# Write your solution here
print("Hello World")
```

**C++:**
```cpp
#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    cout << "Hello World" << endl;
    return 0;
}
```

**Java:**
```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
        System.out.println("Hello World");
    }
}
```

**C:**
```c
#include <stdio.h>

int main() {
    // Write your solution here
    printf("Hello World\n");
    return 0;
}
```

### 3. API Update (`lib/api.ts`)

Updated submission API to send Judge0 format:

```typescript
submitSolution: async (problemId: string, source_code: string, language_id: number) => {
  const response = await axiosInstance.post('/submissions', { 
    problemId, 
    source_code,  // Changed from 'code'
    language_id   // Changed from 'language' (now number)
  });
  return response.data;
}
```

## 🧪 Testing

### 1. Test Judge0 Service (Backend Only)

```bash
cd backend
node testJudge0Integration.js
```

Expected output:
```
🧪 Testing Judge0 Integration
============================================================

📝 Test 1: Python - Add two numbers
✅ Output: 15
   Status: Accepted
   Expected: 15
   Match: ✅ PASS

📝 Test 2: JavaScript - Print "Hello World"
✅ Output: Hello World
   Status: Accepted
   Expected: Hello World
   Match: ✅ PASS

📝 Test 3: C++ - Add two numbers
✅ Output: 20
   Status: Accepted
   Expected: 20
   Match: ✅ PASS

📝 Test 4: Python - Runtime error (division by zero)
   Status: Runtime Error (NZEC)
   Stderr: ZeroDivisionError: division by zero
   Expected: Runtime Error
   Match: ✅ PASS

📝 Test 5: C++ - Compilation error
   Status: Compilation Error
   Compile Output: error: 'this_is_invalid_syntax' was not declared...
   Expected: Compilation Error
   Match: ✅ PASS

============================================================
✅ All tests completed!
```

### 2. Test Full Stack

**Step 1:** Start Backend
```bash
cd backend
npm run dev
```

**Step 2:** Start Frontend
```bash
cd frontend
npm run dev
```

**Step 3:** Test in Browser
1. Go to `http://localhost:3000`
2. Login/Register
3. Navigate to a problem
4. **Select a language** from dropdown (JavaScript, Python, C++, Java, or C)
5. Write code or use the starter template
6. Click "Submit Code"
7. View results

### 3. Test with cURL

```bash
# Login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
# Copy the token from response

# Submit Python solution
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "problemId": "YOUR_PROBLEM_ID",
    "source_code": "print(\"Hello World\")",
    "language_id": 71
  }'

# Submit C++ solution
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "problemId": "YOUR_PROBLEM_ID",
    "source_code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}",
    "language_id": 54
  }'

# Submit Java solution
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "problemId": "YOUR_PROBLEM_ID",
    "source_code": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}",
    "language_id": 62
  }'
```

## 📋 Judge0 Language IDs Reference

| Language   | ID  | Monaco Editor | File Extension |
|------------|-----|---------------|----------------|
| JavaScript | 63  | javascript    | .js            |
| Python     | 71  | python        | .py            |
| C++        | 54  | cpp           | .cpp           |
| Java       | 62  | java          | .java          |
| C          | 50  | c             | .c             |

## 🔧 Prerequisites

### 1. Judge0 Running

Ensure Judge0 is running on `http://localhost:2358`:

```bash
# Check if running
docker ps | grep judge0

# If not running, start it
cd judge0  # Your Judge0 directory
docker-compose up -d

# Check logs
docker-compose logs judge0
```

### 2. MongoDB Running

```bash
# Check if running
mongosh --eval "db.version()"

# Or start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
net start MongoDB  # Windows
```

## 🎯 Key Features

### ✅ What's Working

1. **Multi-language support** - 5 languages fully supported
2. **Language selection** - Dropdown in editor
3. **Starter templates** - Auto-loads when changing language
4. **Syntax highlighting** - Monaco editor updates automatically
5. **Judge0 execution** - Real code execution with Judge0
6. **Error handling** - Compilation, runtime, TLE errors
7. **Early break** - Stops on first failed test
8. **Status tracking** - Accepted, Wrong Answer, Runtime Error, etc.

### 🚀 What's New

1. **Frontend**: Language dropdown with 5 options
2. **Frontend**: Auto-loading starter templates
3. **Frontend**: Monaco editor language switching
4. **Backend**: Judge0 integration service
5. **Backend**: Support for all Judge0 language IDs
6. **Backend**: Proper error handling for all languages
7. **API**: New format with `source_code` and `language_id`

## 🐛 Troubleshooting

### Judge0 Not Responding

```bash
# Restart Judge0
docker-compose restart judge0

# Check logs
docker-compose logs -f judge0
```

### Frontend Language Not Changing

Clear browser cache and refresh:
```bash
# Chrome
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (macOS)
```

### Submission Failing

Check backend logs:
```bash
cd backend
npm run dev
# Look for error messages in console
```

### Wrong Output Format

Ensure Judge0 is configured correctly:
```bash
# Test Judge0 directly
curl -X POST http://localhost:2358/submissions?wait=true&base64_encoded=false \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "print(\"test\")",
    "language_id": 71,
    "stdin": ""
  }'
```

## 📝 Example Problem Solutions

### Python Example (Two Sum)
```python
a, b = map(int, input().split())
print(a + b)
```

### C++ Example (Two Sum)
```cpp
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
```

### Java Example (Two Sum)
```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}
```

## 🎉 Success!

Your platform now supports **5 programming languages** with Judge0 integration. Users can:
- Select any language from dropdown
- Get starter templates automatically
- Submit code in their preferred language
- See real execution results from Judge0

Happy coding! 🚀
