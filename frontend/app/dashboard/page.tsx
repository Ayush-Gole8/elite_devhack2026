'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { userAPI, problemAPI, submissionAPI } from '@/lib/api';
import { Code, Trophy, Target, Users, TrendingUp, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    solvedCount: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    contestsJoined: 0,
    rating: 1200,
    recentSubmissions: [] as any[],
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?._id) return;

      try {
        setLoadingStats(true);
        
        // Fetch user profile for solved count
        const profileResponse = await userAPI.getProfile(user._id);
        const profile = profileResponse.data;

        // Fetch all problems to get total count
        const problemsResponse = await problemAPI.getProblems();
        const totalProblems = problemsResponse.data?.length || 0;

        // Fetch user submissions
        const submissionsResponse = await submissionAPI.getUserSubmissions(user._id);
        const submissions = submissionsResponse.data || [];
        const totalSubmissions = submissions.length;

        // Get recent submissions
        const recentSubmissions = submissions.slice(0, 5);

        setStats({
          solvedCount: profile.solvedCount || 0,
          totalProblems,
          totalSubmissions,
          contestsJoined: 0, // Placeholder for now
          rating: 1200 + (profile.solvedCount || 0) * 10,
          recentSubmissions,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?._id) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Navigation Bar */}
      <nav className="border-b border-[#2a2a2a] bg-[#1e1e1e]/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="w-7 h-7 text-green-500" />
              <h1 className="text-2xl font-bold text-white">Elite DevHack</h1>
              <Badge className="bg-green-600 hover:bg-green-600">Dashboard</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => router.push('/problems')}
                variant="ghost" 
                className="text-gray-300 hover:text-white"
              >
                Problems
              </Button>
              <Button 
                onClick={() => router.push('/contests')}
                variant="ghost" 
                className="text-gray-300 hover:text-white"
              >
                Contests
              </Button>
              <Button 
                onClick={() => router.push('/leaderboard')}
                variant="ghost" 
                className="text-gray-300 hover:text-white"
              >
                Leaderboard
              </Button>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#2a2a2a]">
                {user.profilePhoto && (
                  <img
                    src={user.profilePhoto}
                    alt={user.name || 'User'}
                    onClick={() => router.push(`/profile/${user._id}`)}
                    className="w-9 h-9 rounded-full cursor-pointer hover:ring-2 hover:ring-green-500 transition-all"
                  />
                )}
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  size="sm"
                  className="border-[#3a3a3a] text-gray-300 hover:text-white"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Coder'}! 👋
          </h2>
          <p className="text-gray-400">
            Ready to tackle some coding challenges?
          </p>
        </div>

        {/* Onboarding Status */}
        {!user.isOnboarded && (
          <div className="mb-6 bg-[#1e1e1e] border border-yellow-500/50 rounded-[14px] p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Complete Your Profile</h3>
            <p className="text-gray-400 mb-4">
              Finish setting up your profile to unlock all features
            </p>
            <Button 
              onClick={() => router.push('/onboarding')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Complete Profile
            </Button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-6 hover:border-green-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {loadingStats ? '...' : stats.solvedCount}
            </div>
            <p className="text-sm text-gray-400">Problems Solved</p>
            <div className="mt-2 text-xs text-gray-500">
              of {stats.totalProblems} total
            </div>
          </div>

          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-6 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-500" />
              </div>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {loadingStats ? '...' : stats.totalSubmissions}
            </div>
            <p className="text-sm text-gray-400">Total Submissions</p>
            <div className="mt-2 text-xs text-gray-500">
              All time
            </div>
          </div>

          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.contestsJoined}
            </div>
            <p className="text-sm text-gray-400">Contests Joined</p>
            <div className="mt-2 text-xs text-gray-500">
              Participate now
            </div>
          </div>

          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-6 hover:border-yellow-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.rating}
            </div>
            <p className="text-sm text-gray-400">Contest Rating</p>
            <div className="mt-2 text-xs text-gray-500">
              Global rank
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-linear-to-br from-green-600 to-green-700 rounded-[14px] shadow-lg p-6 cursor-pointer hover:scale-105 transition-transform"
               onClick={() => router.push('/problems')}>
            <Code className="w-10 h-10 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Browse Problems</h3>
            <p className="text-green-100 text-sm mb-4">
              {stats.totalProblems}+ coding challenges awaiting you
            </p>
            <div className="flex items-center text-white font-medium">
              <span>Start Solving</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-600 to-purple-700 rounded-[14px] shadow-lg p-6 cursor-pointer hover:scale-105 transition-transform"
               onClick={() => router.push('/contests')}>
            <Trophy className="w-10 h-10 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Join Contests</h3>
            <p className="text-purple-100 text-sm mb-4">
              Compete with others and climb the ranks
            </p>
            <div className="flex items-center text-white font-medium">
              <span>View Contests</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-[14px] shadow-lg p-6 cursor-pointer hover:scale-105 transition-transform"
               onClick={() => router.push(`/profile/${user._id}`)}>
            <Users className="w-10 h-10 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Your Profile</h3>
            <p className="text-blue-100 text-sm mb-4">
              View your stats and submission history
            </p>
            <div className="flex items-center text-white font-medium">
              <span>View Profile</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/profile/${user._id}`)}
              className="text-gray-400 hover:text-white"
            >
              View All
            </Button>
          </div>

          {loadingStats ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            </div>
          ) : stats.recentSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No recent activity</p>
              <p className="text-sm text-gray-500 mb-4">
                Start solving problems to see your activity here
              </p>
              <Button 
                onClick={() => router.push('/problems')}
                className="bg-green-600 hover:bg-green-700"
              >
                Browse Problems
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentSubmissions.map((submission: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#252525] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      submission.status === 'Accepted' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-white font-medium">
                        {submission.problem?.title || 'Problem'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          submission.problem?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          submission.problem?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {submission.problem?.difficulty || 'Unknown'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          submission.status === 'Accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {getTimeAgo(submission.submittedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
