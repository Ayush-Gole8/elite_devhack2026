'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { userAPI, problemAPI, submissionAPI } from '@/lib/api';
import {
  Code2, Trophy, Users, TrendingUp, Flame,
  CheckCircle2, ArrowRight, Zap, BarChart2, ChevronRight,
  Circle, LogOut, LayoutDashboard, BookOpen,
} from 'lucide-react';

interface RecentSubmission {
  status: string;
  problem?: { _id?: string; title?: string; difficulty?: string };
  language?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    solvedCount: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    contestsJoined: 0,
    rating: 1200,
    recentSubmissions: [] as RecentSubmission[],
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
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-zinc-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const s = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const solvedPct = stats.totalProblems > 0
    ? Math.min(Math.round((stats.solvedCount / stats.totalProblems) * 100), 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">DevHack</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <LayoutDashboard className="w-3 h-3" />
              Dashboard
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Problems',    href: '/problems'    },
              { label: 'Contests',    href: '/contests'    },
              { label: 'Leaderboard', href: '/leaderboard' },
            ].map(({ label, href }) => (
              <button key={label} onClick={() => router.push(href)}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                {label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/profile/${user._id}`)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/6 transition-all"
            >
              <Image
                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? '')}&background=10b981&color=fff&size=80`}
                alt={user.name || 'User'}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full ring-1 ring-white/10"
                unoptimized
              />
              <span className="hidden sm:block text-sm text-zinc-300 font-medium">{user.name?.split(' ')[0]}</span>
            </button>
            <button onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-white border border-white/6 hover:border-white/10 hover:bg-white/4 transition-all">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page body ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good to see you, <span className="text-emerald-400">{user.name?.split(' ')[0] || 'Coder'}</span> 👋
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Here&apos;s a snapshot of your progress today.</p>
          </div>
          {!user.isOnboarded && (
            <button onClick={() => router.push('/onboarding')}
              className="flex items-center gap-2 text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl hover:bg-amber-500/15 transition-all shrink-0">
              <Circle className="w-3 h-3 fill-amber-400" />
              Complete your profile
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Stat cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Problems Solved */}
          <div className="group relative rounded-2xl bg-[#18181b] border border-white/6 p-5 overflow-hidden hover:border-emerald-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/[0.07] rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full">
                  {loadingStats ? '—' : `${solvedPct}%`}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-0.5">
                {loadingStats ? <span className="text-zinc-600 animate-pulse">···</span> : stats.solvedCount}
              </div>
              <p className="text-sm text-zinc-500 mb-3">Problems Solved</p>
              {/* Progress bar */}
              <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: loadingStats ? '0%' : `${solvedPct}%` }} />
              </div>
              <p className="text-[11px] text-zinc-600 mt-1.5">of {stats.totalProblems} problems</p>
            </div>
          </div>

          {/* Total Submissions */}
          <div className="group relative rounded-2xl bg-[#18181b] border border-white/6 p-5 overflow-hidden hover:border-indigo-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500/[0.07] rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex items-end gap-0.5">
                  {[3,5,4,6,5,7,6].map((h, i) => (
                    <div key={i} className="w-1 rounded-full bg-indigo-500/50"
                      style={{ height: `${h * 3}px` }} />
                  ))}
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-0.5">
                {loadingStats ? <span className="text-zinc-600 animate-pulse">···</span> : stats.totalSubmissions}
              </div>
              <p className="text-sm text-zinc-500 mb-3">Total Submissions</p>
              <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-indigo-500 to-violet-400 rounded-full w-3/4" />
              </div>
              <p className="text-[11px] text-zinc-600 mt-1.5">All time activity</p>
            </div>
          </div>

          {/* Contests */}
          <div className="group relative rounded-2xl bg-[#18181b] border border-white/6 p-5 overflow-hidden hover:border-amber-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-500/[0.07] rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <Flame className="w-4 h-4 text-amber-400/50" />
              </div>
              <div className="text-3xl font-bold text-white mb-0.5">
                {stats.contestsJoined}
              </div>
              <p className="text-sm text-zinc-500 mb-3">Contests Joined</p>
              <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-amber-500 to-orange-400 rounded-full w-0" />
              </div>
              <p className="text-[11px] text-zinc-600 mt-1.5">Start competing today</p>
            </div>
          </div>

          {/* Rating */}
          <div className="group relative rounded-2xl bg-[#18181b] border border-white/6 p-5 overflow-hidden hover:border-purple-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-purple-500/40 to-transparent" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500/[0.07] rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-purple-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-purple-400/60" />
              </div>
              <div className="text-3xl font-bold text-white mb-0.5">
                {loadingStats ? <span className="text-zinc-600 animate-pulse">···</span> : stats.rating}
              </div>
              <p className="text-sm text-zinc-500 mb-3">Contest Rating</p>
              <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-purple-500 to-pink-400 rounded-full"
                  style={{ width: `${Math.min(((stats.rating - 1200) / 900) * 100, 100)}%` }} />
              </div>
              <p className="text-[11px] text-zinc-600 mt-1.5">Global ranking</p>
            </div>
          </div>
        </div>

        {/* ── Action cards + Recent activity ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Action cards column */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/6">
              <div>
                <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
                <p className="text-[12px] text-zinc-600 mt-0.5">Jump right in</p>
              </div>
            </div>
            <div className="p-4 space-y-2">

            {/* Problems */}
            <button onClick={() => router.push('/problems')}
              className="group w-full text-left relative rounded-2xl overflow-hidden border border-white/6 hover:border-emerald-500/20 transition-all bg-[#18181b] p-5">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/15 transition-colors">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">Browse Problems</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">
                    {stats.totalProblems > 0 ? `${stats.totalProblems} challenges available` : 'Explore all challenges'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </button>

            {/* Contests */}
            <button onClick={() => router.push('/contests')}
              className="group w-full text-left relative rounded-2xl overflow-hidden border border-white/6 hover:border-amber-500/20 transition-all bg-[#18181b] p-5">
              <div className="absolute inset-0 bg-linear-to-br from-amber-500/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 group-hover:bg-amber-500/15 transition-colors">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">Join Contests</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Compete &amp; climb the ranks</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </button>

            {/* Leaderboard */}
            <button onClick={() => router.push('/leaderboard')}
              className="group w-full text-left relative rounded-2xl overflow-hidden border border-white/6 hover:border-indigo-500/20 transition-all bg-[#18181b] p-5">
              <div className="absolute inset-0 bg-linear-to-br from-indigo-500/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/15 transition-colors">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">Leaderboard</p>
                  <p className="text-xs text-zinc-500 mt-0.5">See where you stand globally</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </button>

            {/* Profile */}
            <button onClick={() => router.push(`/profile/${user._id}`)}
              className="group w-full text-left relative rounded-2xl overflow-hidden border border-white/6 hover:border-purple-500/20 transition-all bg-[#18181b] p-5">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <Image
                  src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? '')}&background=10b981&color=fff&size=80`}
                  alt={user.name || ''}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-xl ring-1 ring-white/10 object-cover shrink-0"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">Your Profile</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{user.email}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/6">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                <p className="text-[12px] text-zinc-600 mt-0.5">Your latest submissions</p>
              </div>
              <button onClick={() => router.push(`/profile/${user._id}`)}
                className="text-xs text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {loadingStats ? (
                <div className="flex items-center justify-center py-16">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                </div>
              ) : stats.recentSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-700 px-6">
                  <Code2 className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium text-zinc-500">No submissions yet</p>
                  <p className="text-xs text-zinc-600 mt-1 mb-5 text-center">
                    Solve your first problem to see activity here
                  </p>
                  <button onClick={() => router.push('/problems')}
                    className="text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/15 transition-all">
                    Browse Problems
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/4">
                  {stats.recentSubmissions.map((submission, idx) => {
                    const accepted = submission.status === 'Accepted';
                    const diff = submission.problem?.difficulty;
                    return (
                      <div key={idx}
                        className="flex items-center justify-between px-6 py-3.5 hover:bg-white/2 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${accepted ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-sm text-zinc-300 group-hover:text-white transition-colors truncate font-medium">
                            {submission.problem?.title || 'Unknown Problem'}
                          </span>
                          <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-lg ${
                            diff === 'Easy'   ? 'bg-emerald-500/10 text-emerald-400' :
                            diff === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-red-500/10 text-red-400'
                          }`}>
                            {diff || '—'}
                          </span>
                          <span className={`hidden sm:inline-flex shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-lg ${
                            accepted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-600 ml-4 shrink-0">{getTimeAgo(submission.submittedAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
