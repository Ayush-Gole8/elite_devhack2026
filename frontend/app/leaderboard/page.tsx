'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  TrendingUp, 
  Medal, 
  Crown,
  Sparkles,
  Target,
  Zap,
  Award,
  Users
} from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  name: string;
  username: string;
  profilePhoto?: string;
  solvedCount: number;
  rating?: number;
  rank?: number;
}

type TimeFilter = 'all' | 'month' | 'week';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getLeaderboard();
      const users = response.data || [];
      
      // Add ranks and simulated ratings
      const rankedUsers = users.map((u: any, idx: number) => ({
        ...u,
        rank: idx + 1,
        rating: u.rating || (1500 - idx * 10), // Simulated rating system
      }));
      
      setLeaderboard(rankedUsers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
    if (rank <= 10) return 'from-green-500/10 to-green-600/10 border-green-500/20';
    return 'from-[#1e1e1e] to-[#1e1e1e] border-[#2a2a2a]';
  };

  const isCurrentUser = (userId: string) => user?._id === userId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-linear-to-r from-yellow-600/10 via-orange-600/10 to-red-600/10 blur-3xl -z-10"></div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-yellow-500 animate-pulse" />
              <h1 className="text-5xl font-bold text-white">Global Leaderboard</h1>
              <Trophy className="w-12 h-12 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-gray-400 text-lg">
              Compete with the best coders around the world
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-green-500 font-semibold">{leaderboard.length} Competitors</span>
            </div>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            <Button
              onClick={() => setTimeFilter('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                timeFilter === 'all'
                  ? 'bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333333] hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 mr-2" />
              All Time
            </Button>
            <Button
              onClick={() => setTimeFilter('month')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                timeFilter === 'month'
                  ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333333] hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              This Month
            </Button>
            <Button
              onClick={() => setTimeFilter('week')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                timeFilter === 'week'
                  ? 'bg-linear-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333333] hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              This Week
            </Button>
          </div>

          {timeFilter !== 'all' && (
            <div className="text-center py-8 bg-[#1e1e1e] rounded-xl border border-yellow-500/30">
              <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-yellow-400 font-semibold text-lg">
                Time-filtered leaderboards coming soon!
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Currently showing all-time rankings
              </p>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && timeFilter === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* 2nd Place */}
            <div className="order-2 md:order-1">
              <Card className="bg-linear-to-br from-gray-400/20 to-gray-500/20 border-2 border-gray-400/40 p-6 text-center transform hover:scale-105 transition-all shadow-2xl">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-500/30 flex items-center justify-center mx-auto ring-4 ring-gray-400/50">
                    {leaderboard[1].profilePhoto ? (
                      <img
                        src={leaderboard[1].profilePhoto}
                        alt={leaderboard[1].name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {leaderboard[1].name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gray-500 rounded-full p-2">
                    <Medal className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {leaderboard[1].name}
                </h3>
                <p className="text-gray-300 text-sm mb-3">@{leaderboard[1].username}</p>
                <div className="flex justify-center gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Rank</p>
                    <p className="text-white font-bold text-xl">#2</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Solved</p>
                    <p className="text-green-400 font-bold text-xl">{leaderboard[1].solvedCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rating</p>
                    <p className="text-blue-400 font-bold text-xl">{leaderboard[1].rating}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="order-1 md:order-2">
              <Card className="bg-linear-to-br from-yellow-500/30 to-amber-500/30 border-2 border-yellow-500/60 p-8 text-center transform hover:scale-105 transition-all shadow-2xl shadow-yellow-500/30 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-500 rounded-full p-3 shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="relative inline-block mb-4 mt-4">
                  <div className="w-28 h-28 rounded-full bg-yellow-500/30 flex items-center justify-center mx-auto ring-4 ring-yellow-400/70">
                    {leaderboard[0].profilePhoto ? (
                      <img
                        src={leaderboard[0].profilePhoto}
                        alt={leaderboard[0].name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-white">
                        {leaderboard[0].name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Sparkles className="absolute top-0 right-0 w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {leaderboard[0].name}
                </h3>
                <p className="text-gray-200 text-sm mb-4">@{leaderboard[0].username}</p>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <p className="text-gray-300">Rank</p>
                    <p className="text-yellow-400 font-bold text-2xl">#1</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Solved</p>
                    <p className="text-green-400 font-bold text-2xl">{leaderboard[0].solvedCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Rating</p>
                    <p className="text-blue-400 font-bold text-2xl">{leaderboard[0].rating}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="order-3">
              <Card className="bg-linear-to-br from-amber-600/20 to-amber-700/20 border-2 border-amber-600/40 p-6 text-center transform hover:scale-105 transition-all shadow-2xl">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-amber-600/30 flex items-center justify-center mx-auto ring-4 ring-amber-600/50">
                    {leaderboard[2].profilePhoto ? (
                      <img
                        src={leaderboard[2].profilePhoto}
                        alt={leaderboard[2].name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {leaderboard[2].name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-600 rounded-full p-2">
                    <Medal className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {leaderboard[2].name}
                </h3>
                <p className="text-gray-300 text-sm mb-3">@{leaderboard[2].username}</p>
                <div className="flex justify-center gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Rank</p>
                    <p className="text-white font-bold text-xl">#3</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Solved</p>
                    <p className="text-green-400 font-bold text-xl">{leaderboard[2].solvedCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rating</p>
                    <p className="text-blue-400 font-bold text-xl">{leaderboard[2].rating}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        {timeFilter === 'all' && (
          <Card className="bg-[#1e1e1e] border-[#2a2a2a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#252525] border-b border-[#3a3a3a]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="w-4 h-4" />
                        Solved
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <Award className="w-4 h-4" />
                        Rating
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry._id}
                      className={`
                        transition-all hover:bg-[#252525]
                        ${isCurrentUser(entry._id) ? 'bg-green-500/10 border-l-4 border-green-500' : ''}
                      `}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getRankIcon(entry.rank!)}
                          <span className={`text-lg font-bold ${
                            entry.rank! <= 3 ? 'text-yellow-400' :
                            entry.rank! <= 10 ? 'text-green-400' :
                            'text-gray-400'
                          }`}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                            {entry.profilePhoto ? (
                              <img
                                src={entry.profilePhoto}
                                alt={entry.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-white">
                                {entry.name?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold flex items-center gap-2">
                              {entry.name}
                              {isCurrentUser(entry._id) && (
                                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-gray-400 text-sm">@{entry.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-2xl font-bold text-green-400">
                          {entry.solvedCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-2xl font-bold text-blue-400">
                          {entry.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <Card className="bg-[#1e1e1e] border-[#2a2a2a] p-16 text-center">
            <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Rankings Yet</h3>
            <p className="text-gray-400">
              Be the first to solve problems and claim the top spot!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
