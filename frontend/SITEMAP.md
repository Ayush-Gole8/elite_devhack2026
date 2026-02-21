# 🗺️ Complete Sitemap & Features

## Pages Created

### Public Pages (No Authentication Required)

#### 1. **Landing Page** (`/`)
- **File:** `app/page.tsx` → `app/landing/Landing.tsx`
- **Features:**
  - Hero section with animated code
  - Stats showcase
  - Features overview
  - Journey timeline
  - Contest highlights
  - CTA sections
- **Navigation:**
  - "Sign Up" button → `/signup`
  - "Login" button → `/login`
  - "Start Improving Today" → `/signup`

---

#### 2. **Login Page** (`/login`)
- **File:** `app/login/page.tsx`
- **Features:**
  - Google Sign-In button
  - Firebase authentication integration
  - Auto-redirect if already logged in
  - Link to signup page
  - Back to home link
- **Logic:**
  - If user exists → Redirect to `/dashboard` or `/onboarding`
  - If new user → Create account & redirect to `/onboarding`
- **Backend API:** `POST /api/auth/google`

---

#### 3. **Signup Page** (`/signup`)
- **File:** `app/signup/page.tsx`
- **Features:**
  - Google Sign-Up button (same as login)
  - Info card explaining Google Sign-In benefits
  - Terms & Privacy policy links
  - Link to login page
  - Back to home link
- **Logic:**
  - Same authentication flow as login
  - First-time users created in database
- **Backend API:** `POST /api/auth/google`

---

### Protected Pages (Authentication Required)

#### 4. **Onboarding Page** (`/onboarding`)
- **File:** `app/onboarding/page.tsx`
- **Auth Required:** ✅ Yes
- **Features:**
  - Profile completion form
  - Username input (required)
  - Social links (portfolio, GitHub, LinkedIn, Twitter)
  - Skills input (comma-separated)
  - Experience textarea
  - Education textarea
  - Skip option
- **Logic:**
  - Only accessible for users with `isOnboarded: false`
  - On submit: Updates user profile & sets `isOnboarded: true`
  - Redirects to `/dashboard` after completion
- **Backend API:** `PUT /api/users/:id`

---

#### 5. **Dashboard Page** (`/dashboard`)
- **File:** `app/dashboard/page.tsx`
- **Auth Required:** ✅ Yes
- **Features:**
  - Navigation bar with user profile
  - Welcome message
  - Onboarding reminder (if incomplete)
  - Quick action cards:
    - Problems (browse challenges)
    - Contests (compete with others)
    - Leaderboard (see rankings)
  - Stats overview:
    - Problems Solved: 0
    - Submissions: 0
    - Contests Joined: 0
    - Rating: 1200
  - Recent Activity section
  - Sign Out button
- **Logic:**
  - Requires valid JWT token
  - Auto-redirects to `/login` if not authenticated
  - Shows onboarding prompt if profile incomplete

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         LANDING PAGE (/)                     │
│                                                              │
│  [Sign Up Button]  [Login Button]  [Start Improving Button] │
└────────┬────────────────────┬──────────────────────────────┘
         │                    │
         ▼                    ▼
    ┌────────┐          ┌────────┐
    │ SIGNUP │          │ LOGIN  │
    │  PAGE  │          │  PAGE  │
    └────┬───┘          └───┬────┘
         │                  │
         └──────┬───────────┘
                │
         [Click "Sign in with Google"]
                │
                ▼
        ┌───────────────┐
        │ GOOGLE POPUP  │
        │ Select Account│
        └───────┬───────┘
                │
         Firebase ID Token
                │
         Send to Backend:
         POST /api/auth/google
                │
         Backend verifies token
         with Firebase Admin SDK
                │
         Returns: JWT + isOnboarded
                │
         Store JWT in localStorage
                │
         ┌──────▼──────┐
    ┌────┤ isOnboarded?├────┐
    │    └─────────────┘    │
    NO                      YES
    │                        │
    ▼                        ▼
┌─────────────┐      ┌──────────────┐
│ ONBOARDING  │      │  DASHBOARD   │
│    PAGE     │      │     PAGE     │
├─────────────┤      ├──────────────┤
│ - Username  │      │ - Overview   │
│ - Socials   │      │ - Stats      │
│ - Skills    │      │ - Problems   │
│ - Experience│      │ - Contests   │
│ - Education │      │ - Activity   │
└──────┬──────┘      └──────┬───────┘
       │                    │
  [Complete]           [Sign Out]
       │                    │
       ▼                    ▼
  Update User          Clear Token
  isOnboarded=true     & Redirect to /
       │
       ▼
  ┌──────────────┐
  │  DASHBOARD   │
  │     PAGE     │
  └──────────────┘
```

---

## API Integration

### Authentication API

#### `POST /api/auth/google`
- **Purpose:** Verify Firebase ID token and create/login user
- **Request:**
  ```json
  {
    "idToken": "firebase_id_token_here"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "isOnboarded": false
  }
  ```
- **Used By:** Login page, Signup page

---

### User API

#### `GET /api/users/:id`
- **Purpose:** Get user profile
- **Auth:** Required (JWT)
- **Used By:** Profile pages

#### `PUT /api/users/:id`
- **Purpose:** Update user profile
- **Auth:** Required (JWT)
- **Request:**
  ```json
  {
    "username": "johndoe",
    "social": {
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe"
    },
    "skills": ["JavaScript", "React"],
    "experience": "3 years",
    "education": "BS Computer Science",
    "isOnboarded": true
  }
  ```
- **Used By:** Onboarding page

#### `GET /api/users/leaderboard`
- **Purpose:** Get global leaderboard
- **Auth:** Not required
- **Used By:** Dashboard (future)

---

## File Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Landing page
│   ├── login/
│   │   └── page.tsx           # ✅ Login page
│   ├── signup/
│   │   └── page.tsx           # ✅ Signup page
│   ├── onboarding/
│   │   └── page.tsx           # ✅ Onboarding page
│   ├── dashboard/
│   │   └── page.tsx           # ✅ Dashboard page
│   └── landing/
│       ├── Landing.tsx
│       └── components/
│           ├── Navbar.tsx     # Has Login/Signup buttons
│           ├── Hero.tsx       # Has "Start Improving" CTA
│           └── ...
├── components/
│   ├── AuthDemo.tsx           # Demo component (optional)
│   └── ui/                    # shadcn/ui components
├── context/
│   └── AuthContext.tsx        # ✅ Auth state management
├── lib/
│   ├── axios.ts               # ✅ Axios with JWT interceptors
│   ├── firebase.ts            # ✅ Firebase client config
│   └── api.ts                 # ✅ API service functions
├── .env.local                 # ✅ Environment variables
├── AUTH_GUIDE.md              # ✅ Testing guide
└── INTEGRATION.md             # ✅ Setup guide
```

---

## Component Architecture

### Global Context

**AuthProvider** (`context/AuthContext.tsx`)
- Wraps entire app in `app/layout.tsx`
- Provides:
  - `user` - Current user state
  - `firebaseUser` - Firebase user object
  - `loading` - Auth loading state
  - `signInWithGoogle()` - Sign in function
  - `signOut()` - Sign out function
  - `refreshUserData()` - Refresh user data

### How Pages Use Auth

```tsx
// Any component can access auth
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  
  // ... use these values
}
```

---

## JWT Token Flow

### 1. **Token Storage**
- Stored in `localStorage` as `'token'`
- Stored alongside on`'isOnboarded'` status

### 2. **Token Attachment**
- Axios interceptor auto-adds to requests:
  ```
  Authorization: Bearer <jwt_token>
  ```

### 3. **Token Verification**
- Backend middleware verifies JWT
- Attaches `req.user = userId` to request
- Returns 401 if invalid

### 4. **Token Expiration**
- JWT expires in 7 days
- 401 response triggers auto-logout
- User redirected to home page

---

## Protected Routes Implementation

### Method 1: useEffect Hook (Current)
```tsx
const { user, loading } = useAuth();
const router = useRouter();

useEffect(() => {
  if (!loading && !user) {
    router.push('/login');
  }
}, [user, loading, router]);
```

### Method 2: Middleware (Future)
- Create `middleware.ts` in root
- Check auth before page renders
- More efficient for many protected routes

---

## State Management

### Local Storage
- `token` - JWT authentication token
- `isOnboarded` - User onboarding status

### React Context
- `AuthContext` - Global auth state
- Persists across page navigation
- Syncs with localStorage

### Firebase State
- `onAuthStateChanged` - Firebase auth listener
- Updates when user signs in/out
- Triggers token refresh

---

## Styling System

### Tailwind CSS
- Custom gradient: `bg-linear-to-br`
- Dark mode by default
- Responsive utilities

### shadcn/ui Components
- Pre-styled, accessible components
- Customizable via Tailwind
- Consistent design system

### Color Scheme
- Primary: Emerald green
- Background: Dark slate
- Muted: Gray tones
- Destructive: Red

---

## Security Features

✅ **Firebase ID Token Verification** - Server-side validation  
✅ **JWT with expiration** - 7-day token lifetime  
✅ **Axios interceptors** - Automatic token management  
✅ **401 auto-logout** - Invalid tokens clear session  
✅ **Protected routes** - Redirects unauthenticated users  
✅ **No password storage** - Google handles credentials  

---

## Error Handling

### Frontend
- Toast notifications via Sonner
- Try-catch blocks in API calls
- Loading states for async operations

### Backend
- Error handler middleware
- Consistent error response format:
  ```json
  {
    "success": false,
    "message": "Error message here"
  }
  ```

---

## Next Features to Build

1. **Problems Page** - Browse and solve coding challenges
2. **Problem Detail Page** - View problem, submit code
3. **Contests Page** - Browse and join contests
4. **Contest Detail Page** - View contest problems
5. **Leaderboard Page** - Global and contest rankings
6. **Profile Page** - View and edit user profile
7. **Submissions Page** - View submission history
8. **Real-time Judge** - Code execution and testing

---

## Testing Checklist

- [ ] Can sign up with Google
- [ ] User created in MongoDB
- [ ] JWT token received and stored
- [ ] Redirected to onboarding
- [ ] Can complete profile
- [ ] Profile saved in database
- [ ] Redirected to dashboard
- [ ] Dashboard shows user info
- [ ] Can sign out
- [ ] Token cleared from localStorage
- [ ] Redirected to home
- [ ] Can sign in again
- [ ] Redirected directly to dashboard (onboarded)
- [ ] Protected routes redirect to login

---

**✨ All authentication pages and flows are now complete and connected to the backend!**
