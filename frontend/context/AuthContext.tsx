'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

// Types
interface User {
  _id: string;
  email: string;
  name: string;
  profilePhoto: string | null;
  username?: string;
  isOnboarded: boolean;
  skills?: string[];
  experience?: string;
  education?: string;
  social?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // User is signed in with Firebase
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // We have a JWT token and user data
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('user');
          }
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('isOnboarded');
        localStorage.removeItem('user');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Sign in with Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get ID token from Firebase
      const idToken = await result.user.getIdToken();
      
      // Send ID token to backend for verification and JWT generation
      const response = await axiosInstance.post('/auth/google', { idToken });
      
      const { token, isOnboarded, user: userData } = response.data;
      
      // Store JWT token, onboarding status, and user data
      localStorage.setItem('token', token);
      localStorage.setItem('isOnboarded', isOnboarded.toString());
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user data
      setUser(userData);
      
      toast.success('Sign in successful!');
      
      // Redirect based on onboarding status
      if (!isOnboarded) {
        window.location.href = '/onboarding';
      } else {
        window.location.href = '/dashboard';
      }
      
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      
      // Sign out from Firebase on error
      await firebaseSignOut(auth);
      
      const errorMessage = (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) 
        ? String(error.response.data.message) 
        : 'Failed to sign in. Please try again.';
      toast.error(errorMessage);
      
      setUser(null);
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('isOnboarded');
      localStorage.removeItem('user');
      
      // Clear user state
      setUser(null);
      setFirebaseUser(null);
      
      toast.success('Signed out successfully');
      
      // Redirect to home
      window.location.href = '/';
      
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data from backend
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) return;
      
      // Parse stored user to get the ID
      const userData = JSON.parse(storedUser);
      
      // Fetch updated user data from backend
      const response = await axiosInstance.get(`/users/${userData._id}`);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('isOnboarded', updatedUser.isOnboarded.toString());
        
        // Update state
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If error fetching user data, try to keep existing data
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
