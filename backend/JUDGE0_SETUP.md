# Judge0 Setup Guide - Multi-Language Support

## Overview
The platform now supports multiple programming languages using Judge0 API:
- **JavaScript** (Node.js)
- **Python** 3
- **C++** (GCC)
- **Java** (OpenJDK)
- **C** (GCC)

## Getting Your Free Judge0 API Key

### Step 1: Create RapidAPI Account
1. Go to [RapidAPI](https://rapidapi.com/)
2. Click "Sign Up" (top right)
3. Create an account using email or social login

### Step 2: Subscribe to Judge0 CE
1. Visit [Judge0 CE on RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click "Subscribe to Test" button
3. Choose the **FREE Basic Plan**:
   - **50 requests/day** (sufficient for testing)
   - **0.5 requests/second** rate limit
   - **100% FREE** - no credit card required
4. Click "Subscribe"

### Step 3: Get Your API Key
1. After subscribing, you'll be on the Judge0 CE API page
2. Look for the **"Code Snippets"** section (middle of page)
3. Find the header: `X-RapidAPI-Key: YOUR_KEY_HERE`
4. Copy the long alphanumeric key (50-60 characters)

### Step 4: Configure Your Backend
1. Open `backend/.env` file
2. Find the line: `JUDGE0_API_KEY=your_rapidapi_key_here`
3. Replace `your_rapidapi_key_here` with your copied key
4. Save the file

**Example:**
```env
JUDGE0_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Step 5: Restart Backend Server
```bash
cd backend
npm run dev
```

### Step 6: Verify Setup
Check console logs when backend starts. You should see:
```
Judge0 configured: Supported languages: javascript, python, cpp, java, c
```

If you see just `javascript`, the API key is not configured properly.

## Testing Multi-Language Support

### Test Python Submission
```python
# Problem: Add two numbers
a, b = map(int, input().split())
print(a + b)
```

### Test C++ Submission
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

### Test Java Submission
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

## Rate Limits & Best Practices

### Free Tier Limits
- **50 submissions per day**
- **0.5 requests per second** (2 seconds between requests)
- For hackathon demo: This is sufficient
- For production: Upgrade to paid plan ($10/month for 10,000 requests)

### Handling Rate Limits
The system automatically:
- Polls submission status every 1 second
- Times out after 10 seconds
- Returns error if rate limit exceeded

### Fallback Mode
**Without Judge0 API Key:**
- System falls back to **JavaScript-only** mode
- Uses local `vm2` sandbox (no external API)
- Instant execution, no rate limits
- Limited to JavaScript submissions only

## Troubleshooting

### "Only JavaScript is supported" error
- Judge0 API key not configured
- Check `.env` file has correct key
- Restart backend server

### "Rate limit exceeded" error
- Free tier: 50 requests/day used
- Wait 24 hours or upgrade plan
- Test with JavaScript (uses vm2, no limits)

### "Compilation Error" for valid code
- Check language syntax
- Judge0 uses: Python 3.8, GCC 9.2, Java 11
- Review error message in submission details

### Submissions stuck in "Pending"
- Judge0 API might be down
- Check RapidAPI status: https://status.rapidapi.com/
- System will timeout after 10 seconds

## API Key Security

### Important Notes
- **Never commit `.env` file** to Git (already in `.gitignore`)
- Don't share your API key publicly
- Each team member should use their own key
- Free tier resets daily at midnight UTC

### For Hackathon Demo
1. **Option 1:** Use Judge0 (recommended)
   - Shows multi-language capability
   - Professional solution
   - Limited to 50 tests before demo

2. **Option 2:** JavaScript-only fallback
   - Unlimited local testing
   - No external dependencies
   - Limited to JavaScript

## Language-Specific Notes

### Python
- Uses Python 3.8.5
- Standard input: `input()` or `sys.stdin`
- Output: `print()`

### C++
- Compiler: GCC 9.2.0
- Standard: C++17
- Use `#include <bits/stdc++.h>` for competitive programming

### Java
- JDK: OpenJDK 13.0.1
- Main class must be named `Main`
- Use `Scanner` for input

### C
- Compiler: GCC 9.2.0
- Standard: C11
- Use `scanf()` and `printf()`

## Support & Resources

- **Judge0 Documentation:** https://ce.judge0.com/
- **RapidAPI Dashboard:** https://rapidapi.com/developer/dashboard
- **Judge0 Language IDs:** https://github.com/judge0/judge0/blob/master/CHANGELOG.md

---

**Setup Complete!** Your platform now supports 5 programming languages. 🎉
