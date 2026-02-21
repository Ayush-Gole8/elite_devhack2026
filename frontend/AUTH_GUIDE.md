# 🚀 Authentication Setup Complete!

Your frontend is now fully connected to the backend with **Firebase Google Authentication + JWT**.

---

## 📋 What Was Created

### **Authentication Pages**

1. **[/login](app/login/page.tsx)** - Sign in page with Google authentication
2. **[/signup](app/signup/page.tsx)** - Sign up page with Google authentication  
3. **[/onboarding](app/onboarding/page.tsx)** - Profile completion page for new users
4. **[/dashboard](app/dashboard/page.tsx)** - Protected dashboard for authenticated users

### **Features Implemented**

✅ **Google Sign-In** - One-click authentication via Firebase  
✅ **JWT Token Management** - Automatic token storage and refresh  
✅ **Protected Routes** - Dashboard requires authentication  
✅ **Auto-Redirects** - Smart routing based on auth state  
✅ **Profile Onboarding** - First-time user setup flow  
✅ **User Context** - Global auth state management  

---

## 🔧 Setup Instructions

### Step 1: Update Frontend Environment Variables

Edit `frontend/.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Get these from Firebase Console → Project Settings → General
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=devhack-4a47b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=devhack-4a47b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=devhack-4a47b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456...
```

### Step 2: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`devhack-4a47b`)
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Set your support email

### Step 3: Start Both Servers

**Backend:**
```bash
cd backend
npm run dev
# Should show: Server is running on port 5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Should show: Ready on http://localhost:3000
```

---

## 🧪 Testing the Authentication Flow

### Test 1: Sign Up Flow

1. Visit: `http://localhost:3000`
2. Click **"Sign Up"** button in navbar
3. Click **"Sign up with Google"**
4. Select your Google account
5. **Expected Result:**
   - Redirected to `/onboarding`
   - See profile completion form
   - User created in MongoDB
   - JWT token stored in localStorage

### Test 2: Complete Profile

1. On onboarding page, fill in:
   - Username (required)
   - Social links (optional)
   - Skills (comma-separated)
   - Experience
   - Education
2. Click **"Complete Profile"**
3. **Expected Result:**
   - Redirected to `/dashboard`
   - See welcome message
   - Profile updated in database
   - `isOnboarded` set to true

### Test 3: Sign Out

1. On dashboard, click **"Sign Out"**
2. **Expected Result:**
   - Signed out from Firebase
   - JWT token removed from localStorage
   - Redirected to home page

### Test 4: Sign In Flow

1. Visit: `http://localhost:3000/login`
2. Click **"Sign in with Google"**
3. Select your Google account
4. **Expected Result:**
   - Redirected to `/dashboard` (if onboarded)
   - Or redirected to `/onboarding` (if not onboarded)

### Test 5: Protected Routes

1. Visit: `http://localhost:3000/dashboard` (without logging in)
2. **Expected Result:**
   - Redirected to `/login`
   - Must sign in to access dashboard

---

## 🔄 Authentication Flow Diagram

```
┌─────────────┐
│   Landing   │
│    Page     │
└──────┬──────┘
       │
       ├─── Click "Sign Up" ───┐
       │                       │
       └─── Click "Login" ─────┤
                               │
                          ┌────▼────┐
                          │  Login/ │
                          │  Signup │
                          │  Page   │
                          └────┬────┘
                               │
                      Click "Sign in with Google"
                               │
                          ┌────▼─────┐
                          │ Google   │
                          │ Sign-In  │
                          │ Popup    │
                          └────┬─────┘
                               │
                    Get Firebase ID Token
                               │
                    Send to Backend: POST /api/auth/google
                               │
                    Backend verifies with Firebase Admin
                               │
                    Backend returns JWT + isOnboarded
                               │
                    Store token in localStorage
                               │
                          ┌────▼─────┐
                    ┌─────┤ Is       │
                    │     │Onboarded?│
                    │     └────┬─────┘
                    │          │
              NO ◄──┴──────────┴──────► YES
                    │                  │
             ┌──────▼───────┐   ┌──────▼────────┐
             │  Onboarding  │   │   Dashboard   │
             │     Page     │   │     Page      │
             └──────┬───────┘   └───────────────┘
                    │
        Complete profile & submit
                    │
        Update backend: PUT /api/users/:id
                    │
             Set isOnboarded = true
                    │
             ┌──────▼────────┐
             │   Dashboard   │
             │     Page      │
             └───────────────┘
```

---

## 📚 Using Authentication in Your Components

### Basic Usage

```tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Making Authenticated API Calls

```tsx
import { problemAPI, userAPI } from '@/lib/api';

// Fetch problems (JWT token automatically included)
const fetchProblems = async () => {
  try {
    const data = await problemAPI.getProblems();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Update user profile
const updateProfile = async () => {
  try {
    const data = await userAPI.updateProfile(userId, {
      username: 'newusername',
      skills: ['JavaScript', 'React'],
    });
    console.log('Updated:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🗺️ Available Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/login` | Sign in page | No |
| `/signup` | Sign up page | No |
| `/onboarding` | Profile setup | Yes |
| `/dashboard` | Main dashboard | Yes |

---

## 🔐 Security Features

✅ **Firebase ID Token Verification** - Backend validates tokens with Firebase Admin  
✅ **JWT with 7-day expiration** - Secure stateless authentication  
✅ **Automatic token refresh** - Axios interceptors handle token attachment  
✅ **401 Auto-logout** - Invalid/expired tokens trigger automatic sign-out  
✅ **Protected routes** - Dashboard requires valid authentication  
✅ **HTTPS recommended** - Use secure connections in production  

---

## 📊 Database Schema

### User Model
```javascript
{
  email: String (required, unique),
  name: String,
  profilePhoto: String,
  provider: String (default: 'google'),
  isOnboarded: Boolean (default: false),
  username: String,
  social: {
    portfolio: String,
    github: String,
    linkedin: String,
    twitter: String
  },
  skills: [String],
  experience: String,
  education: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/popup-closed-by-user)"
- User closed the Google sign-in popup
- Normal behavior, just try again

### "Invalid or expired Firebase token"
- Check if Firebase credentials in `.env.local` are correct
- Verify `serviceAccountKey.json` is in backend folder
- Ensure Firebase project IDs match

### "Cannot connect to backend"
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### "Not authorized to access this route"
- JWT token might be expired (7 days)
- Sign out and sign in again
- Check localStorage for 'token' key

### Page redirects in a loop
- Clear localStorage: `localStorage.clear()`
- Refresh the page
- Sign in again

---

## 🎨 UI Components Used

All pages use **shadcn/ui** components:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button` with variants: `default`, `outline`, `destructive`
- `Input`, `Label`, `Textarea`
- `Badge` for status indicators
- `Toaster` (Sonner) for notifications

---

## 🚀 Next Steps

1. ✅ **Test authentication end-to-end**
2. ✅ **Complete your profile on onboarding**
3. Build problems page with `problemAPI`
4. Build contests page with `contestAPI`
5. Build submissions page with `submissionAPI`
6. Add leaderboard using `userAPI.getLeaderboard()`
7. Create user profile page
8. Add social sharing features

---

## 📝 Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend  
cd frontend && npm run dev

# Test health endpoint
curl http://localhost:5000/health

# Clear localStorage (in browser console)
localStorage.clear()
```

---

## 🔗 Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health
- **Firebase Console:** https://console.firebase.google.com
- **MongoDB:** Check your connection string in backend/.env

---

## ✨ Features Checklist

- [x] Firebase Google Authentication
- [x] JWT token generation and verification  
- [x] User registration and login
- [x] Profile onboarding flow
- [x] Protected dashboard
- [x] Auto-redirect based on auth state
- [x] Sign out functionality
- [x] Axios interceptors for JWT
- [x] Error handling and toasts
- [x] Responsive design
- [ ] Password reset (Google handles this)
- [ ] Email verification (Google handles this)
- [ ] Profile editing page
- [ ] Problems listing page
- [ ] Contest participation

---

**🎉 Your authentication system is ready! Start testing by visiting http://localhost:3000**
