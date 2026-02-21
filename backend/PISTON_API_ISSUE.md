# ⚠️ IMPORTANT: Piston API Status Update

## Issue
The public Piston API at `https://emkc.org/api/v2/piston/execute` was made **whitelist-only on February 15, 2026**.

Error message:
```
Public Piston API is now whitelist only as of 2/15/2026. 
Please contact EngineerMan on Discord with use case justification 
or consider hosting your own Piston instance.
```

## Solutions for Your Hackathon

You have **3 options** to get multi-language code execution working:

---

### Option 1: Use Judge0 (RECOMMENDED - 5 minutes setup)

**Why?** Free, battle-tested, no self-hosting needed.

The system already has Judge0 integration! Just enable it:

1. **Get free API key** (2 minutes):
   - Go to https://rapidapi.com/judge0-official/api/judge0-ce
   - Sign up (free)
   - Subscribe to "Basic FREE" plan (50 requests/day)
   - Copy your `X-RapidAPI-Key`

2. **Configure backend** (1 minute):
   ```bash
   # Edit backend/.env
   JUDGE0_API_KEY=your_rapidapi_key_here
   ```

3. **Switch execution service** (2 minutes):
   - Update `submissionController.js` to use Judge0 instead of Piston
   - Change: `const { executeCode } = require('./executionService');`
   - To: `const { runTestCaseWithJudge0 } = require('./services/judge0Service');`

4. **Restart backend**:
   ```bash
   npm run dev
   ```

**Languages supported**: JavaScript, Python, C++, Java, C (5 languages)  
**Free tier**: 50 submissions/day (enough for hackathon demo)  
**Setup time**: 5 minutes  
**Status**: Working now ✅

See `backend/JUDGE0_SETUP.md` for detailed instructions.

---

### Option 2: Self-Host Piston (45-60 minutes setup)

**Why?** Unlimited free executions, full control.

**Steps**:
1. Install Docker Desktop
2. Clone Piston repo:
   ```bash
   git clone https://github.com/engineer-man/piston.git
   cd piston
   docker-compose up -d
   ```
3. Change `PISTON_API_URL` in execution service:
   ```javascript
   const PISTON_API_URL = 'http://localhost:2000/api/v2/execute';
   ```
4. Restart backend

**Languages supported**: 50+ languages  
**Free tier**: Unlimited (local)  
**Setup time**: 45-60 minutes  
**Status**: Requires Docker setup ⚙️

---

### Option 3: Request Piston Whitelist (Unknown timeline)

**Why?** Official public API access.

**Steps**:
1. Join Engineer Man's Discord: https://discord.gg/engineerman
2. Contact @EngineerMan with your use case
3. Wait for whitelist approval
4. Continue using current Piston implementation

**Languages supported**: JavaScript, Python, C++  
**Free tier**: Public API (rate limited)  
**Setup time**: Unknown (depends on approval)  
**Status**: Waiting for approval ⏳

---

## My Recommendation

**For your hackathon, use Judge0 (Option 1)** because:
- ✅ Works immediately (5 min setup)
- ✅ Professionally maintained
- ✅ 50 free requests/day (enough for demo)
- ✅ Already integrated in your codebase
- ✅ No Docker/infrastructure needed

Self-hosting Piston is great for production but takes too much time during a hackathon.

---

## Quick Comparison

| Solution | Setup Time | Languages | Cost | Availability |
|----------|-----------|-----------|------|--------------|
| **Judge0** | 5 min | 5 | Free (50/day) | ✅ Now |
| Self-host Piston | 60 min | 50+ | Free | ⚙️ Setup needed |
| Whitelist Piston | Unknown | 3 | Free | ⏳ Waiting |
| vm2 (JavaScript only) | 0 min | 1 | Free | ✅ Already working |

---

## Already Implemented: Judge0 Service

Your codebase already has a complete Judge0 integration:

**File**: `backend/services/judge0Service.js`

**Functions**:
- `runTestCaseWithJudge0(code, language, input, expectedOutput, timeLimit)`
- `isJudge0Configured()` - check if API key is set
- `getSupportedLanguages()` - returns available languages

**To use it**: Just add the API key to `.env` and modify the controller to import it.

---

## Decision Time

What do you want to do?

1. **Judge0** → Follow `JUDGE0_SETUP.md`, takes 5 minutes
2. **Self-host Piston** → Requires Docker setup, takes 60 minutes  
3. **Wait for whitelist** → Unknown timeline
4. **JavaScript only** → Already working with vm2

**Recommended**: Option 1 (Judge0) for hackathon deadline.

Let me know which option you choose and I'll help you implement it!
