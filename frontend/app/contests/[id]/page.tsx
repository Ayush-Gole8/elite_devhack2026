'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter, useParams } from 'next/navigation';
import { contestAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContestTimer } from '@/components/ui/contest-timer';
import { 
  Trophy, 
  Users, 
  Target,
  Clock,
  ArrowLeft,
  Crown,
  Medal,
  CheckCircle2,
  Lock,
  Code,
  Sparkles,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Contest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  problems: any[];
  participants: any[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function ContestDetailPage() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard'>('problems');

  useEffect(() => {
    if (contestId) {
      fetchContest();
    }
  }, [contestId]);

  // Socket.io real-time leaderboard updates
  useEffect(() => {
    if (!socket || !contestId) return;

    // Join contest room for live updates
    socket.emit('joinContest', contestId);
    console.log(`Joined contest room: ${contestId}`);

    // Listen for leaderboard updates
    socket.on('leaderboardUpdate', (updatedParticipants) => {
      console.log('Leaderboard updated:', updatedParticipants);
      setContest((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: updatedParticipants,
        };
      });
      toast.success('🏆 Leaderboard updated!', {
        duration: 2000,
      });
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leaveContest', contestId);
      socket.off('leaderboardUpdate');
      console.log(`Left contest room: ${contestId}`);
    };
  }, [socket, contestId]);

  const fetchContest = async () => {
    try {
      setLoading(true);
      const response = await contestAPI.getContest(contestId);
      setContest(response.data);
    } catch (error) {
      console.error('Error fetching contest:', error);
      toast.error('Failed to load contest');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register');
      router.push('/login');
      return;
    }

    try {
      setRegistering(true);
      await contestAPI.registerForContest(contestId);
      toast.success('Successfully registered for contest!');
      fetchContest();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to register';
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };

  const isUserRegistered = () => {
    if (!user || !contest) return false;
    return contest.participants.some((p: any) => 
      (p.user?._id || p.user) === user._id
    );
  };

  const canAccessProblems = () => {
    if (!contest) return false;
    const now = new Date().getTime();
    const start = new Date(contest.startTime).getTime();
    return now >= start && isUserRegistered();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'hard':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const sortedParticipants = contest?.participants
    .slice()
    .sort((a: any, b: any) => (b.score || 0) - (a.score || 0)) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Contest...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] p-8 text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Contest Not Found</h3>
          <Button onClick={() => router.push('/contests')} className="mt-4">
            Back to Contests
          </Button>
        </Card>
      </div>
    );
  }

  const registered = isUserRegistered();
  const accessProblems = canAccessProblems();

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => router.push('/contests')}
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contests
        </Button>

        {/* Contest Header */}
        <div className="bg-linear-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border-2 border-purple-500/30 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-10 h-10 text-purple-500" />
                <h1 className="text-4xl font-bold text-white">{contest.title}</h1>
              </div>
              <p className="text-gray-300 text-lg mb-6">{contest.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#2a2a2a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Duration</span>
                  </div>
                  <p className="text-white font-bold text-lg">{contest.duration} mins</p>
                </div>

                <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#2a2a2a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Target className="w-4 h-4" />
                    <span>Problems</span>
                  </div>
                  <p className="text-white font-bold text-lg">{contest.problems?.length || 0}</p>
                </div>

                <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#2a2a2a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span>Participants</span>
                  </div>
                  <p className="text-white font-bold text-lg">{contest.participants?.length || 0}</p>
                </div>

                <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#2a2a2a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <p className="text-white font-bold text-lg capitalize">{contest.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Starts: {format(new Date(contest.startTime), 'MMM dd, yyyy • hh:mm a')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-stretch md:items-end">
              <ContestTimer 
                startTime={contest.startTime}
                endTime={contest.endTime}
                status={contest.status}
              />

              {!registered && contest.status !== 'completed' && (
                <Button 
                  onClick={handleRegister}
                  disabled={registering}
                  className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 text-lg"
                >
                  {registering ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Register for Contest
                    </>
                  )}
                </Button>
              )}

              {registered && (
                <div className="flex items-center gap-2 px-6 py-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Registered</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'problems'
                ? 'text-purple-500 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Problems
            </div>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'text-purple-500 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Leaderboard
              {connected && contest?.status === 'ongoing' && (
                <div className="flex items-center gap-1.5 ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-semibold">Live</span>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'problems' && (
          <div>
            {!accessProblems ? (
              <Card className="bg-[#1e1e1e] border-[#2a2a2a] p-12 text-center">
                <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {contest.status === 'upcoming' ? 'Contest Not Started' : 'Registration Required'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {contest.status === 'upcoming'
                    ? 'Problems will be revealed when the contest starts'
                    : 'Please register to access contest problems'}
                </p>
                {!registered && contest.status !== 'completed' && (
                  <Button 
                    onClick={handleRegister}
                    disabled={registering}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Register Now
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {contest.status === 'ongoing' && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-green-400 font-semibold">Contest Mode Active</p>
                    </div>
                  </div>
                )}

                {contest.problems && contest.problems.length > 0 ? (
                  contest.problems.map((problem: any, index: number) => (
                    <Card 
                      key={problem._id}
                      className="bg-[#1e1e1e] border-[#2a2a2a] hover:border-purple-500/50 transition-all cursor-pointer"
                      onClick={() => router.push(`/problems/${problem._id}?contestId=${contestId}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-2xl font-bold text-gray-500">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-2 hover:text-purple-400 transition-colors">
                                {problem.title}
                              </h3>
                              <div className="flex items-center gap-3">
                                <Badge className={`${getDifficultyColor(problem.difficulty)} border font-semibold`}>
                                  {problem.difficulty}
                                </Badge>
                                {problem.tags && problem.tags.slice(0, 3).map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-gray-400 border-gray-600">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost"
                            className="text-purple-500 hover:text-purple-400"
                          >
                            Solve →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-[#1e1e1e] border-[#2a2a2a] p-12 text-center">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No problems available yet</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <Card className="bg-[#1e1e1e] border-[#2a2a2a]">
            {sortedParticipants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#252525] border-b border-[#3a3a3a]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase">Participant</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-300 uppercase">Score</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-300 uppercase">Solved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]">
                    {sortedParticipants.map((participant: any, index: number) => {
                      const rank = index + 1;
                      const isCurrentUser = user?._id === (participant.user?._id || participant.user);
                      
                      return (
                        <tr 
                          key={participant.user?._id || index}
                          className={`transition-all hover:bg-[#252525] ${
                            isCurrentUser ? 'bg-purple-500/10 border-l-4 border-purple-500' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {rank === 1 && <Crown className="w-5 h-5 text-yellow-400" />}
                              {rank === 2 && <Medal className="w-5 h-5 text-gray-300" />}
                              {rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                              <span className={`text-lg font-bold ${
                                rank <= 3 ? 'text-yellow-400' : 'text-gray-400'
                              }`}>
                                #{rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                                <span className="text-lg font-bold text-white">
                                  {participant.user?.name?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-semibold flex items-center gap-2">
                                  {participant.user?.name || 'Anonymous'}
                                  {isCurrentUser && (
                                    <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-gray-400 text-sm">@{participant.user?.username || 'unknown'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-2xl font-bold text-green-400">
                              {participant.score || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-xl font-semibold text-blue-400">
                              {participant.submissions?.length || 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No participants yet</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
