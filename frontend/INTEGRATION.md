# Frontend-Backend Integration Guide

## 🚀 Setup Complete!

The frontend is now fully integrated with the Firebase + JWT authentication backend.

---

## 📁 New Files Created

### 1. **lib/axios.ts**
- Axios instance with JWT token interceptors
- Automatically adds Bearer token to all requests
- Handles 401 errors (token expiration) globally

### 2. **lib/firebase.ts**
- Firebase client configuration
- Google Auth Provider setup
- Initialized Firebase app

### 3. **context/AuthContext.tsx**
- Complete authentication context
- `signInWithGoogle()` - Google sign-in flow
- `signOut()` - Sign out functionality
- `user` - Current user state
- `loading` - Loading state

### 4. **lib/api.ts**
- Centralized API service
- Pre-built functions for all backend endpoints
- Organized by feature (auth, users, problems, submissions, contests)

### 5. **components/AuthDemo.tsx**
- Demo component showing authentication usage
- Sign in/out buttons
- User profile display

---

## 🔧 Configuration Required

### 1. Update `.env.local` with Firebase Credentials

Get these values from [Firebase Console](https://console.firebase.google.com):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Firebase Config (Project Settings -> General)
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=devhack-4a47b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=devhack-4a47b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=devhack-4a47b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### 2. Enable Google Sign-In in Firebase Console

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Google** provider
3. Set support email

---

## 🎯 How to Use Authentication

### Basic Usage

```tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.name}!</p>
          <Button onClick={signOut}>Sign Out</Button>
        </>
      ) : (
        <Button onClick={signInWithGoogle}>Sign In with Google</Button>
      )}
    </div>
  );
}
```

---

## 🔐 Making API Calls

### Using the API Service (Recommended)

```tsx
import { problemAPI, userAPI, submissionAPI } from '@/lib/api';

// Get problems
const problems = await problemAPI.getProblems();

// Submit solution (requires authentication)
const result = await submissionAPI.submitSolution({
  problemId: '123',
  code: 'console.log("Hello")',
  language: 'javascript'
});

// Get user profile
const profile = await userAPI.getProfile(userId);
```

### Direct Axios Usage

```tsx
import axiosInstance from '@/lib/axios';

// JWT token is automatically added to headers
const response = await axiosInstance.get('/problems');
const data = response.data;
```

---

## 🔄 Authentication Flow

1. **User clicks "Sign In with Google"**
   - Opens Google sign-in popup
   - User selects Google account

2. **Frontend gets Firebase ID token**
   - Firebase SDK provides ID token
   - Token contains user's Google info

3. **Frontend sends ID token to backend**
   - POST request to `/api/auth/google`
   - Backend verifies token with Firebase Admin

4. **Backend returns JWT token**
   - JWT token for subsequent API calls
   - `isOnboarded` status for routing

5. **Frontend stores JWT and redirects**
   - Token saved in localStorage
   - Redirects to `/onboarding` or `/dashboard`

6. **Protected API calls**
   - Axios automatically adds JWT to requests
   - Backend middleware verifies JWT

---

## 📊 Available API Endpoints

### Authentication
- `POST /api/auth/google` - Google sign-in

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (protected)
- `GET /api/users/leaderboard` - Get leaderboard

### Problems
- `GET /api/problems` - List all problems
- `GET /api/problems/:id` - Get problem details
- `POST /api/problems` - Create problem (protected)
- `PUT /api/problems/:id` - Update problem (protected)
- `DELETE /api/problems/:id` - Delete problem (protected)

### Submissions
- `POST /api/submissions` - Submit solution (protected)
- `GET /api/submissions/user/:userId` - User's submissions (protected)
- `GET /api/submissions/problem/:problemId` - Problem submissions (protected)
- `GET /api/submissions/:id` - Submission details (protected)

### Contests
- `GET /api/contests` - List contests
- `GET /api/contests/:id` - Contest details
- `POST /api/contests` - Create contest (protected)
- `PUT /api/contests/:id` - Update contest (protected)
- `DELETE /api/contests/:id` - Delete contest (protected)
- `POST /api/contests/:id/register` - Register for contest (protected)

---

## 🧪 Testing the Integration

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Test Authentication
1. Visit `http://localhost:3000`
2. Click "Sign In with Google"
3. Select Google account
4. Should redirect to onboarding/dashboard
5. Check browser console for token storage

### 4. Test Protected Routes
```tsx
// This will automatically include JWT token
const response = await problemAPI.getProblems();
```

---

## 🛡️ Security Features

✅ **JWT Tokens** - Secure, stateless authentication  
✅ **Firebase ID Token Verification** - Server-side validation  
✅ **Automatic Token Attachment** - Axios interceptors  
✅ **401 Handling** - Auto-logout on token expiration  
✅ **localStorage Security** - Tokens stored client-side

---

## 🐛 Troubleshooting

### "Invalid Firebase token"
- Check if Firebase is properly configured
- Ensure `serviceAccountKey.json` is in backend/
- Verify Firebase project ID matches

### "CORS Error"
- Backend CORS is enabled for all origins
- Check if backend is running on port 5000

### "Token not found" on protected routes
- Ensure user is signed in
- Check localStorage for 'token' key
- Token might be expired - sign in again

### Firebase errors
- Update `.env.local` with correct Firebase credentials
- Enable Google provider in Firebase Console
- Check Firebase project settings

---

## 📝 Next Steps

1. **Update `.env.local`** with real Firebase credentials
2. **Test authentication** flow end-to-end
3. **Build onboarding page** using `user.isOnboarded`
4. **Create dashboard** with authenticated API calls
5. **Add protected routes** using `useAuth()` hook

---

## 🔗 Quick Links

- Firebase Console: https://console.firebase.google.com
- Backend API: http://localhost:5000/api
- Frontend: http://localhost:3000
- Health Check: http://localhost:5000/health

---

## 💡 Pro Tips

1. **Use `api.ts` service** - Keeps API calls organized
2. **Check `loading` state** - Show loading UI during auth
3. **Handle errors gracefully** - Use try-catch blocks
4. **Test token expiration** - JWT expires in 7 days
5. **Secure routes** - Check `user` in protected pages

---

**🎉 Integration Complete! Your frontend is now connected to the backend with Firebase Google Authentication + JWT tokens.**
