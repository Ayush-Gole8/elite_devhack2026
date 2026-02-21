'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userAPI, submissionAPI, problemAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Calendar,
  Users,
  UserPlus,
  Trophy,
  Target,
  Flame,
  CheckCircle2,
  TrendingUp,
  Zap,
  Star,
  Award,
  Lock,
  Code2,
} from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  username?: string;
  email: string;
  profilePhoto?: string;
  social?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  skills?: string[];
  experience?: string;
  education?: string;
  solvedCount: number;
  solvedProblems?: string[];
  createdAt: string;
}

interface SubmissionStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  maxStreak: number;
  currentStreak: number;
  recentSubmissions: any[];
  heatmapData: any[];
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<SubmissionStats>({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    maxStreak: 0,
    currentStreak: 0,
    recentSubmissions: [],
    heatmapData: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [problemCounts, setProblemCounts] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });

  const isOwnProfile = currentUser?._id === params.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile & total problem counts in parallel
        const [profileResponse, allProblemsResponse] = await Promise.all([
          userAPI.getProfile(params.id as string),
          problemAPI.getProblems(),
        ]);
        setProfile(profileResponse.data);

        const allProblems: any[] = allProblemsResponse.data || allProblemsResponse || [];
        const pCounts = allProblems.reduce(
          (acc: { easy: number; medium: number; hard: number; total: number }, p: any) => {
            const d = p.difficulty?.toLowerCase();
            if (d === 'easy') acc.easy++;
            else if (d === 'medium') acc.medium++;
            else if (d === 'hard') acc.hard++;
            acc.total++;
            return acc;
          },
          { easy: 0, medium: 0, hard: 0, total: 0 }
        );
        setProblemCounts(pCounts);

        // Fetch user submissions
        const submissionsResponse = await submissionAPI.getUserSubmissions(params.id as string);
        const submissions = submissionsResponse.data || [];

        // Calculate stats
        const acceptedSubmissions = submissions.filter((s: any) => s.status === 'Accepted');
        const problemDifficulties = await fetchProblemDifficulties(acceptedSubmissions);
        
        const calculatedStats = {
          total: submissions.length,
          easy: problemDifficulties.easy,
          medium: problemDifficulties.medium,
          hard: problemDifficulties.hard,
          maxStreak: calculateMaxStreak(submissions),
          currentStreak: calculateCurrentStreak(submissions),
          recentSubmissions: submissions.slice(0, 10),
          heatmapData: generateHeatmapData(submissions)
        };

        setStats(calculatedStats);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfileData();
    }
  }, [params.id]);

  const fetchProblemDifficulties = async (submissions: any[]) => {
    const difficulties = { easy: 0, medium: 0, hard: 0 };
    const problemIds = new Set(submissions.map(s => s.problem?._id || s.problem).filter(Boolean));
    
    for (const problemId of problemIds) {
      try {
        const response = await problemAPI.getProblem(problemId);
        const difficulty = response.data?.difficulty?.toLowerCase();
        if (difficulty === 'easy') difficulties.easy++;
        else if (difficulty === 'medium') difficulties.medium++;
        else if (difficulty === 'hard') difficulties.hard++;
      } catch (error) {
        // Skip if problem not found
      }
    }
    
    return difficulties;
  };

  const calculateMaxStreak = (submissions: any[]) => {
    // Simple implementation - count consecutive days with submissions
    return Math.floor(Math.random() * 20) + 5; // Placeholder
  };

  const calculateCurrentStreak = (submissions: any[]) => {
    return Math.floor(Math.random() * 10) + 1; // Placeholder
  };

  const generateHeatmapData = (submissions: any[]) => {
    const heatmap: any[] = [];
    const today = new Date();
    
    // Generate 52 weeks of data (364 days)
    for (let week = 0; week < 52; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - ((51 - week) * 7 + (6 - day)));
        
        // Count submissions on this date
        const count = submissions.filter((s: any) => {
          const subDate = new Date(s.submittedAt);
          return subDate.toDateString() === date.toDateString();
        }).length;
        
        heatmap.push({
          date: date.toISOString().split('T')[0],
          count,
          level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4
        });
      }
    }
    
    return heatmap;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="text-center">
          <p className="text-white text-xl">User not found</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const totalSolved = stats.easy + stats.medium + stats.hard;
  const contestRating = 1500 + totalSolved * 10;
  const globalRanking = Math.max(1, 100000 - totalSolved * 100);

  const getRatingTier = (r: number) => {
    if (r >= 2100) return { label: 'Grandmaster', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    };
    if (r >= 1900) return { label: 'Master',      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    if (r >= 1600) return { label: 'Expert',      color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' };
    if (r >= 1400) return { label: 'Specialist',  color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   };
    if (r >= 1200) return { label: 'Pupil',       color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/20'   };
    return           { label: 'Newbie',      color: 'text-zinc-400',   bg: 'bg-zinc-500/10',   border: 'border-zinc-500/20'   };
  };
  const tier = getRatingTier(contestRating);

  const badgeList = [
    { id: 'first-solve', name: 'First Solve',    desc: 'Solved your first problem',    Icon: Trophy,       gradient: 'from-amber-500 to-orange-500',   earned: totalSolved >= 1       },
    { id: 'streak-7',   name: 'Streak Week',     desc: '7-day submission streak',      Icon: Flame,        gradient: 'from-orange-500 to-red-500',     earned: stats.maxStreak >= 7   },
    { id: 'easy-10',    name: 'Easy Rider',      desc: 'Solved 10 easy problems',      Icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-400',   earned: stats.easy >= 10       },
    { id: 'medium-10',  name: 'Problem Solver',  desc: 'Solved 10 medium problems',    Icon: Target,       gradient: 'from-blue-500 to-indigo-400',    earned: stats.medium >= 10     },
    { id: 'hard-5',     name: 'Hard Core',       desc: 'Solved 5 hard problems',       Icon: Zap,          gradient: 'from-purple-500 to-violet-400',  earned: stats.hard >= 5        },
    { id: 'fifty-club', name: 'Fifty Club',      desc: 'Solved 50+ problems',          Icon: Star,         gradient: 'from-pink-500 to-rose-400',      earned: totalSolved >= 50      },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* ─── LEFT SIDEBAR ──────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Profile Header */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-emerald-500/6 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <div className="relative inline-block mb-4">
                <img
                  src={profile.profilePhoto || `https://ui-avatars.com/api/?name=${profile.name}&background=10b981&color=fff&size=200`}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full border-2 border-emerald-500/30 ring-4 ring-white/4"
                />
              </div>
              <h2 className="text-lg font-bold text-white mb-0.5">{profile.username || profile.name}</h2>
              <p className="text-xs text-zinc-500 mb-4">#{globalRanking.toLocaleString()} Global</p>
              <div className="flex justify-center gap-6 text-xs text-zinc-500 mb-5">
                <span className="flex flex-col items-center gap-0.5">
                  <span className="text-white font-semibold text-base">0</span>
                  <span>Following</span>
                </span>
                <div className="w-px bg-white/6" />
                <span className="flex flex-col items-center gap-0.5">
                  <span className="text-white font-semibold text-base">0</span>
                  <span>Followers</span>
                </span>
              </div>
              {isOwnProfile && (
                <Button
                  onClick={() => router.push('/profile/edit')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl font-medium transition-all"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 p-5 space-y-2.5">
            {profile.education && (
              <div className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors">
                <Building2 className="w-4 h-4 text-zinc-600 shrink-0" />
                <span className="truncate">{profile.education}</span>
              </div>
            )}
            {profile.experience && (
              <div className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors">
                <Code2 className="w-4 h-4 text-zinc-600 shrink-0" />
                <span className="truncate">{profile.experience}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Calendar className="w-4 h-4 text-zinc-600 shrink-0" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>
            {profile.social?.github && (
              <a href={profile.social.github} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors">
                <Github className="w-4 h-4 text-zinc-600 shrink-0" />
                <span>GitHub</span>
              </a>
            )}
            {profile.social?.linkedin && (
              <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4 text-zinc-600 shrink-0" />
                <span>LinkedIn</span>
              </a>
            )}

            {profile.social?.portfolio && (
              <a href={profile.social.portfolio} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors">
                <Globe className="w-4 h-4 text-zinc-600 shrink-0" />
                <span>Portfolio</span>
              </a>
            )}
            {profile.social?.twitter && (
              <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4 text-zinc-600 shrink-0" />
                <span>Twitter / X</span>
              </a>
            )}
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="rounded-2xl bg-[#18181b] border border-white/6 p-5">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, idx) => (
                  <span key={idx}
                    className="bg-white/5 hover:bg-white/8 text-zinc-300 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border border-white/4">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Community Stats */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 p-5">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Community</h3>
            <div className="space-y-3">
              {[
                { label: 'Reputation',     value: totalSolved * 10, extra: undefined,          extraCls: '' },
                { label: 'Solutions',      value: 0,                extra: '+0 this week',     extraCls: 'text-blue-400' },
                { label: 'Discussions',    value: 0,                extra: '+0 this week',     extraCls: 'text-emerald-400' },
                { label: 'Profile Views',  value: 0,                extra: undefined,          extraCls: '' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{item.value}</span>
                    {item.extra && <span className={`text-[11px] ${item.extraCls}`}>{item.extra}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── MAIN CONTENT ──────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── Contest Rating ──────────────────────────────── */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 p-6 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-indigo-600/[0.07] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-6 right-20 w-36 h-36 bg-emerald-500/4 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Contest Rating</p>
                <div className="flex items-end gap-3 mb-5">
                  <span className="text-5xl font-bold text-white tracking-tight">{contestRating}</span>
                  <span className={`mb-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}>
                    {tier.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    { Icon: Trophy,    color: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Global Rank',  value: `#${globalRanking.toLocaleString()}` },
                    { Icon: Target,    color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  label: 'Attended',     value: '0 contests' },
                    { Icon: TrendingUp,color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Best Rank',    value: '—' },
                  ].map(({ Icon, color, bg, label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600 leading-none mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating histogram */}
              <div className="flex items-end gap-1 h-24 shrink-0 self-center">
                {[18,28,44,58,76,68,52,38,26,14].map((h, i) => (
                  <div key={i} className="w-3 rounded-t-sm"
                    style={{ height: `${h}%`, background: `rgba(99,102,241,${0.25 + i * 0.05})` }} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Problems Solved ─────────────────────────────── */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 p-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-52 h-52 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-start justify-between mb-6">
              <h3 className="text-base font-semibold text-white">Problems Solved</h3>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                {problemCounts.total > 0
                  ? (totalSolved > 0 ? `${Math.min(Math.round((totalSolved / problemCounts.total) * 100), 100)}% of ${problemCounts.total}` : `0 of ${problemCounts.total}`)
                  : 'Get started!'}
              </span>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-8">
              {/* Multi-arc circular chart */}
              <div className="relative shrink-0">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                  {/* Track */}
                  <circle cx="72" cy="72" r="58" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                  {/* Easy arc */}
                  <circle cx="72" cy="72" r="58" fill="none" stroke="#10b981" strokeWidth="10"
                    strokeDasharray={`${problemCounts.easy > 0 ? Math.min((stats.easy / problemCounts.easy) * 364.4, 110) : 0} 364.4`}
                    strokeLinecap="round" />
                  {/* Medium arc */}
                  <circle cx="72" cy="72" r="58" fill="none" stroke="#f59e0b" strokeWidth="10"
                    strokeDasharray={`${problemCounts.medium > 0 ? Math.min((stats.medium / problemCounts.medium) * 364.4, 130) : 0} 364.4`}
                    strokeDashoffset={-(problemCounts.easy > 0 ? Math.min((stats.easy / problemCounts.easy) * 364.4, 110) : 0) - 4}
                    strokeLinecap="round" />
                  {/* Hard arc */}
                  <circle cx="72" cy="72" r="58" fill="none" stroke="#ef4444" strokeWidth="10"
                    strokeDasharray={`${problemCounts.hard > 0 ? Math.min((stats.hard / problemCounts.hard) * 364.4, 100) : 0} 364.4`}
                    strokeDashoffset={-((problemCounts.easy > 0 ? Math.min((stats.easy / problemCounts.easy) * 364.4, 110) : 0) + (problemCounts.medium > 0 ? Math.min((stats.medium / problemCounts.medium) * 364.4, 130) : 0) + 8)}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white leading-none">{totalSolved}</span>
                  <span className="text-[11px] text-zinc-500 mt-1">Solved</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="flex-1 w-full space-y-4">
                {[
                  { label: 'Easy',   val: stats.easy,   max: problemCounts.easy   || 1, bar: 'bg-emerald-500', txt: 'text-emerald-400', track: 'bg-emerald-500/10' },
                  { label: 'Medium', val: stats.medium, max: problemCounts.medium || 1, bar: 'bg-amber-500',   txt: 'text-amber-400',   track: 'bg-amber-500/10'   },
                  { label: 'Hard',   val: stats.hard,   max: problemCounts.hard   || 1, bar: 'bg-red-500',     txt: 'text-red-400',     track: 'bg-red-500/10'     },
                ].map(d => (
                  <div key={d.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-zinc-400">{d.label}</span>
                      <span className={`text-sm font-semibold ${d.txt}`}>
                        {d.val} <span className="text-zinc-700 font-normal">/ {d.max}</span>
                      </span>
                    </div>
                    <div className={`h-1.5 ${d.track} rounded-full overflow-hidden`}>
                      <div className={`h-full ${d.bar} rounded-full`}
                        style={{ width: `${Math.min((d.val / d.max) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}

                {/* Stats row */}
                <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Submissions', value: stats.total },
                    { label: 'Acceptance',  value: `${stats.total > 0 ? Math.round((totalSolved / stats.total) * 100) : 0}%` },
                    { label: 'Max Streak',  value: `${stats.maxStreak}d` },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-lg font-bold text-white">{s.value}</div>
                      <div className="text-[11px] text-zinc-600">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Badges ──────────────────────────────────────── */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-72 h-36 bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-start justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-white">Badges</h3>
                <p className="text-[12px] text-zinc-600 mt-0.5">
                  {badgeList.filter(b => b.earned).length}/{badgeList.length} earned
                </p>
              </div>
              <Award className="w-5 h-5 text-amber-400/50" />
            </div>

            <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-3">
              {badgeList.map((badge) => {
                const IconComp = badge.Icon;
                return (
                  <div key={badge.id} title={badge.desc}
                    className="group flex flex-col items-center gap-2 cursor-default">
                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      badge.earned
                        ? `bg-linear-to-br ${badge.gradient} shadow-lg group-hover:scale-110 group-hover:brightness-110`
                        : 'bg-white/3 border border-white/6'
                    }`}>
                      {badge.earned ? (
                        <IconComp className="w-7 h-7 text-white drop-shadow" />
                      ) : (
                        <>
                          <IconComp className="w-6 h-6 text-zinc-700" />
                          <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50">
                            <Lock className="w-3.5 h-3.5 text-zinc-600" />
                          </div>
                        </>
                      )}
                    </div>
                    <p className={`text-[11px] font-medium text-center leading-tight ${
                      badge.earned ? 'text-zinc-300' : 'text-zinc-700'
                    }`}>{badge.name}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Heatmap */}
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-4 md:p-6 hover-lift">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Submission Activity</h3>
              <div className="flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {stats.total} submissions
                </span>
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {stats.maxStreak} day max streak
                </span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="inline-flex gap-1">
                {Array.from({ length: 52 }).map((_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const dataIdx = weekIdx * 7 + dayIdx;
                      const data = stats.heatmapData[dataIdx] || { level: 0 };
                      const colors = ['#1e1e1e', '#0e4429', '#006d32', '#26a641', '#39d353'];
                      return (
                        <div
                          key={dayIdx}
                          className="w-3 h-3 rounded-sm border border-[#2a2a2a]"
                          style={{ backgroundColor: colors[data.level] }}
                          title={`${data.count || 0} submissions`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="w-3 h-3 rounded-sm border border-[#2a2a2a]"
                    style={{ backgroundColor: ['#1e1e1e', '#0e4429', '#006d32', '#26a641', '#39d353'][level] }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>

          {/* ── Recent Activity ──────────────────────────────── */}
          <div className="rounded-2xl bg-[#18181b] border border-white/6 p-6">
            <div className="flex gap-1 border-b border-white/6 mb-4 -mx-1 overflow-x-auto">
              {['recent', 'list', 'solutions', 'discuss'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-3 pb-3 text-sm font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'text-emerald-400 border-b-2 border-emerald-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}>
                  {tab === 'recent' ? 'Recent AC' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-0.5">
              {stats.recentSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-zinc-700">
                  <Code2 className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No submissions yet</p>
                  <p className="text-xs mt-1 text-zinc-700">Start solving problems to see activity here</p>
                </div>
              ) : (
                stats.recentSubmissions.map((submission: any, idx) => (
                  <div key={idx}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/4 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        submission.status === 'Accepted' ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
                        {submission.problem?.title || 'Problem'}
                      </span>
                      <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-lg font-medium ${
                        submission.problem?.difficulty === 'Easy'   ? 'bg-emerald-500/10 text-emerald-400' :
                        submission.problem?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                                                       'bg-red-500/10 text-red-400'
                      }`}>
                        {submission.problem?.difficulty || '—'}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-600 ml-3 shrink-0">{getTimeAgo(submission.submittedAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
