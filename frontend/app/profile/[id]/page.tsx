'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userAPI, submissionAPI, problemAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
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
  Clock,
  TrendingUp
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

  const isOwnProfile = currentUser?._id === params.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profileResponse = await userAPI.getProfile(params.id as string);
        setProfile(profileResponse.data);

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
  const contestRating = 1500 + totalSolved * 10; // Placeholder calculation
  const globalRanking = Math.max(1, 100000 - totalSolved * 100); // Placeholder

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 animate-fade-in">
        {/* LEFT SIDEBAR - Fixed 300px on desktop, full width on mobile */}
        <div className="w-full lg:w-[300px] flex-shrink-0 space-y-5 stagger-animation">
          {/* Profile Header Card */}
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-5 hover-lift">
            <div className="flex flex-col items-center">
              <img
                src={profile.profilePhoto || `https://ui-avatars.com/api/?name=${profile.name}&background=2ecc71&color=fff&size=200`}
                alt={profile.name}
                className="w-[100px] h-[100px] rounded-full border-4 border-[#2a2a2a] mb-4"
              />
              <h2 className="text-xl font-bold text-white mb-1">
                {profile.username || profile.name}
              </h2>
              <p className="text-sm text-gray-400 mb-2">
                Rank: {globalRanking.toLocaleString()}
              </p>
              <div className="flex gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  0 Following
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  0 Followers
                </span>
              </div>
              
              {isOwnProfile && (
                <Button 
                  onClick={() => router.push('/profile/edit')}
                  className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded-lg transition-all duration-200 font-medium"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-5 space-y-3 hover-lift">
            {profile.education && (
              <div className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                <Building2 className="w-[18px] h-[18px] text-gray-400" />
                <span>{profile.education}</span>
              </div>
            )}
            
            {profile.experience && (
              <div className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                <Target className="w-[18px] h-[18px] text-gray-400" />
                <span>{profile.experience}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
              <Calendar className="w-[18px] h-[18px] text-gray-400" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>

            {profile.social?.github && (
              <a 
                href={profile.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Github className="w-[18px] h-[18px] text-gray-400" />
                <span>GitHub Profile</span>
              </a>
            )}

            {profile.social?.linkedin && (
              <a 
                href={profile.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Linkedin className="w-[18px] h-[18px] text-gray-400" />
                <span>LinkedIn</span>
              </a>
            )}

            {profile.social?.portfolio && (
              <a 
                href={profile.social.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Globe className="w-[18px] h-[18px] text-gray-400" />
                <span>Portfolio</span>
              </a>
            )}

            {profile.social?.twitter && (
              <a 
                href={profile.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Twitter className="w-[18px] h-[18px] text-gray-400" />
                <span>Twitter</span>
              </a>
            )}
          </div>

          {/* Skill Tags */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-5 hover-lift">
              <h3 className="text-sm font-semibold text-white mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-[#2a2a2a] text-gray-300 px-3 py-1.5 rounded-full text-[13px] hover:bg-[#333333] transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Community Stats */}
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-5 hover-lift">
            <h3 className="text-sm font-semibold text-white mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Views</span>
                <span className="text-white font-bold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Solutions</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">0</span>
                  <span className="text-xs text-blue-400">+0 this week</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Discussions</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">0</span>
                  <span className="text-xs text-green-400">+0 this week</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Reputation</span>
                <span className="text-white font-bold">{totalSolved * 10}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA - Flexible */}
        <div className="flex-1 space-y-6 stagger-animation">
          {/* Contest Rating Card */}
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-4 md:p-6 hover-lift">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-gray-400 text-sm mb-2">Contest Rating</h3>
                <div className="text-4xl font-bold text-white mb-4">{contestRating}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-400">Global Ranking:</span>
                    <span className="text-white font-semibold">{globalRanking.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-400">Attended:</span>
                    <span className="text-white font-semibold">0</span>
                  </div>
                </div>
              </div>
              
              {/* Rating Distribution Histogram */}
              <div className="flex items-end gap-1 h-20">
                {[20, 35, 50, 65, 80, 70, 55, 40, 25, 15].map((height, idx) => (
                  <div
                    key={idx}
                    className="w-3 bg-linear-to-t from-green-600 to-green-400 rounded-t opacity-70"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Problems Solved Card */}
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-4 md:p-6 hover-lift">
            <h3 className="text-lg font-semibold text-white mb-6">Problems Solved</h3>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Circular Progress */}
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#2a2a2a"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(totalSolved / 150) * 440} 440`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2ecc71" />
                      <stop offset="100%" stopColor="#27ae60" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{totalSolved}</div>
                    <div className="text-xs text-gray-400">Solved</div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Easy</span>
                  </div>
                  <span className="text-white font-semibold">{stats.easy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-300">Medium</span>
                  </div>
                  <span className="text-white font-semibold">{stats.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">Hard</span>
                  </div>
                  <span className="text-white font-semibold">{stats.hard}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Card */}
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-4 md:p-6 hover-lift">
            <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
            <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center md:justify-start">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-gray-400">First Solve</span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-gray-400">100 Club</span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-gray-400">7 Day Streak</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Most recent badge earned</p>
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

          {/* Recent Activity */}
          <div className="bg-[#1e1e1e] rounded-[14px] border border-[#2a2a2a] shadow-lg p-4 md:p-6 hover-lift">
            <div className="flex gap-6 border-b border-[#2a2a2a] mb-4">
              {['recent', 'list', 'solutions', 'discuss'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-green-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab === 'recent' ? 'Recent AC' : tab}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {stats.recentSubmissions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No submissions yet</p>
              ) : (
                stats.recentSubmissions.map((submission: any, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#252525] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        submission.status === 'Accepted' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-gray-200">
                        {submission.problem?.title || 'Problem'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        submission.problem?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        submission.problem?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {submission.problem?.difficulty || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(submission.submittedAt)}
                    </span>
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
