/**
 * API Service - Centralized API calls using axios
 * 
 * This file contains all API calls to the backend.
 * All requests automatically include JWT token via axios interceptors.
 */

import axiosInstance from './axios';

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Sign in with Google - Send Firebase ID token to backend
   */
  googleLogin: async (idToken: string) => {
    const response = await axiosInstance.post('/auth/google', { idToken });
    return response.data;
  },
};

// ============================================
// USER API
// ============================================

export const userAPI = {
  /**
   * Get user profile
   */
  getProfile: async (userId: string) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, data: any) => {
    const response = await axiosInstance.put(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Get leaderboard
   */
  getLeaderboard: async () => {
    const response = await axiosInstance.get('/users/leaderboard');
    return response.data;
  },
};

// ============================================
// PROBLEM API
// ============================================

export const problemAPI = {
  /**
   * Get all problems with optional filters
   */
  getProblems: async (filters?: { difficulty?: string; tags?: string; search?: string }) => {
    const response = await axiosInstance.get('/problems', { params: filters });
    return response.data;
  },

  /**
   * Get a single problem by ID
   */
  getProblem: async (problemId: string) => {
    const response = await axiosInstance.get(`/problems/${problemId}`);
    return response.data;
  },

  /**
   * Create a new problem (protected)
   */
  createProblem: async (data: any) => {
    const response = await axiosInstance.post('/problems', data);
    return response.data;
  },

  /**
   * Update a problem (protected)
   */
  updateProblem: async (problemId: string, data: any) => {
    const response = await axiosInstance.put(`/problems/${problemId}`, data);
    return response.data;
  },

  /**
   * Delete a problem (protected)
   */
  deleteProblem: async (problemId: string) => {
    const response = await axiosInstance.delete(`/problems/${problemId}`);
    return response.data;
  },
};

// ============================================
// SUBMISSION API
// ============================================

export const submissionAPI = {
  /**
   * Submit a solution (protected)
   */
  submitSolution: async (problemId: string, source_code: string, language_id: number, contestId?: string) => {
    const payload: any = { problemId, source_code, language_id };
    if (contestId) {
      payload.contestId = contestId;
    }
    const response = await axiosInstance.post('/submissions', payload);
    return response.data;
  },

  /**
   * Get user submissions (protected)
   */
  getUserSubmissions: async (userId: string) => {
    const response = await axiosInstance.get(`/submissions/user/${userId}`);
    return response.data;
  },

  /**
   * Get all submissions for a problem (optionally only the current user's)
   */
  getProblemSubmissions: async (problemId: string, mine = false) => {
    const response = await axiosInstance.get(`/submissions/problem/${problemId}`, {
      params: mine ? { mine: 'true' } : undefined,
    });
    return response.data;
  },

  /**
   * Get submission by ID (protected)
   */
  getSubmission: async (submissionId: string) => {
    const response = await axiosInstance.get(`/submissions/${submissionId}`);
    return response.data;
  },
};

// ============================================
// CONTEST API
// ============================================

export const contestAPI = {
  /**
   * Get all contests
   */
  getContests: async () => {
    const response = await axiosInstance.get('/contests');
    return response.data;
  },

  /**
   * Get a single contest by ID
   */
  getContest: async (contestId: string) => {
    const response = await axiosInstance.get(`/contests/${contestId}`);
    return response.data;
  },

  /**
   * Create a new contest (protected)
   */
  createContest: async (data: any) => {
    const response = await axiosInstance.post('/contests', data);
    return response.data;
  },

  /**
   * Update a contest (protected)
   */
  updateContest: async (contestId: string, data: any) => {
    const response = await axiosInstance.put(`/contests/${contestId}`, data);
    return response.data;
  },

  /**
   * Delete a contest (protected)
   */
  deleteContest: async (contestId: string) => {
    const response = await axiosInstance.delete(`/contests/${contestId}`);
    return response.data;
  },

  /**
   * Register for a contest (protected)
   */
  registerForContest: async (contestId: string) => {
    const response = await axiosInstance.post(`/contests/${contestId}/register`);
    return response.data;
  },
};

// ============================================
// EXAMPLE USAGE
// ============================================

/**
 * Example: How to use these APIs in your components
 * 
 * import { problemAPI, userAPI } from '@/lib/api';
 * 
 * // In your component:
 * const fetchProblems = async () => {
 *   try {
 *     const data = await problemAPI.getProblems();
 *     console.log(data);
 *   } catch (error) {
 *     console.error('Error fetching problems:', error);
 *   }
 * };
 * 
 * // Protected routes automatically use JWT token from localStorage
 * const submitSolution = async () => {
 *   try {
 *     const data = await submissionAPI.submitSolution({
 *       problemId: '123',
 *       code: 'console.log("Hello")',
 *       language: 'javascript'
 *     });
 *     console.log('Submitted:', data);
 *   } catch (error) {
 *     console.error('Error submitting:', error);
 *   }
 * };
 */
