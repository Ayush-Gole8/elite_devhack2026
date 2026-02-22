'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { contestAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContestTimer } from '@/components/ui/contest-timer';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Plus
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
  isPublic: boolean;
}

export default function ContestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await contestAPI.getContests();
      const allContests = response.data || [];
      
      // Sort contests: ongoing first, then upcoming, then completed
      const sorted = allContests.sort((a: Contest, b: Contest) => {
        const statusOrder = { ongoing: 0, upcoming: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status] || 
               new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      });
      
      setContests(sorted);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (contestId: string, contest: Contest) => {
    if (!user) {
      toast.error('Please login to register');
      router.push('/login');
      return;
    }

    // Frontend validation before API call
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (endTime < now) {
      toast.error('Cannot register for a contest that has already ended');
      return;
    }

    // Check if already registered
    if (isUserRegistered(contest)) {
      toast.info('You are already registered for this contest');
      return;
    }

    try {
      setRegistering(contestId);
      await contestAPI.registerForContest(contestId);
      toast.success('Successfully registered for contest!');
      fetchContests(); // Refresh to show updated registration
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to register';
      toast.error(message);
    } finally {
      setRegistering(null);
    }
  };

  const isUserRegistered = (contest: Contest) => {
    if (!user) return false;
    return contest.participants.some((p: any) => 
      (p.user?._id || p.user) === user._id
    );
  };

  const canRegisterForContest = (contest: Contest): { allowed: boolean; reason?: string } => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (endTime < now) {
      return { allowed: false, reason: 'Contest has ended' };
    }

    if (startTime <= now) {
      return { allowed: false, reason: 'Contest is already ongoing' };
    }

    if (isUserRegistered(contest)) {
      return { allowed: false, reason: 'Already registered' };
    }

    return { allowed: true };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-3 py-1 font-semibold">
            <Zap className="w-3 h-3 mr-1 animate-pulse" />
            Live Now
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 px-3 py-1 font-semibold">
            <Calendar className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 px-3 py-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ended
          </Badge>
        );
      default:
        return null;
    }
  };

  const groupedContests = {
    ongoing: contests.filter(c => c.status === 'ongoing'),
    upcoming: contests.filter(c => c.status === 'upcoming'),
    completed: contests.filter(c => c.status === 'completed'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Contests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 blur-3xl -z-10"></div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-purple-500 animate-bounce" />
              <h1 className="text-5xl font-bold text-white">Coding Contests</h1>
              <Sparkles className="w-12 h-12 text-pink-500 animate-pulse" />
            </div>
            <p className="text-gray-400 text-lg mb-4">
              Compete in real-time coding challenges and climb the ranks
            </p>
            {user && (
              <Button
                onClick={() => router.push('/admin/contests/create')}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Contest
              </Button>
            )}
          </div>
        </div>

        {/* Ongoing Contests */}
        {groupedContests.ongoing.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-green-500" />
              Live Contests
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedContests.ongoing.map((contest) => (
                <Card 
                  key={contest._id}
                  className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-2 border-green-500/30 hover:border-green-500/60 transition-all shadow-2xl hover:scale-105 cursor-pointer"
                  onClick={() => router.push(`/contests/${contest._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-2xl text-white">{contest.title}</CardTitle>
                      {getStatusBadge(contest.status)}
                    </div>
                    <CardDescription className="text-gray-300 line-clamp-2">
                      {contest.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <ContestTimer 
                        startTime={contest.startTime}
                        endTime={contest.endTime}
                        status={contest.status}
                      />
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Target className="w-4 h-4" />
                          <span>{contest.problems?.length || 0} Problems</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{contest.participants?.length || 0} Participants</span>
                        </div>
                      </div>

                      {isUserRegistered(contest) ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/contests/${contest._id}`);
                          }}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Enter Contest
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(contest._id, contest);
                          }}
                          disabled={registering === contest._id}
                        >
                          {registering === contest._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Registering...
                            </>
                          ) : (
                            'Register & Enter'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Contests */}
        {groupedContests.upcoming.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              Upcoming Contests
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedContests.upcoming.map((contest) => (
                <Card 
                  key={contest._id}
                  className="bg-[#1e1e1e] border-[#2a2a2a] hover:border-blue-500/60 transition-all shadow-xl hover:scale-105 cursor-pointer"
                  onClick={() => router.push(`/contests/${contest._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-2xl text-white">{contest.title}</CardTitle>
                      {getStatusBadge(contest.status)}
                    </div>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {contest.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(contest.startTime), 'MMM dd, yyyy • hh:mm a')}</span>
                      </div>

                      <ContestTimer 
                        startTime={contest.startTime}
                        endTime={contest.endTime}
                        status={contest.status}
                      />
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Target className="w-4 h-4" />
                          <span>{contest.problems?.length || 0} Problems</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{contest.duration} mins</span>
                        </div>
                      </div>

                      {isUserRegistered(contest) ? (
                        <div className="flex items-center justify-center gap-2 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">Registered</span>
                        </div>
                      ) : (
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(contest._id, contest);
                          }}
                          disabled={registering === contest._id}
                        >
                          {registering === contest._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Registering...
                            </>
                          ) : (
                            'Register Now'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Contests */}
        {groupedContests.completed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-gray-500" />
              Past Contests
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedContests.completed.map((contest) => (
                <Card 
                  key={contest._id}
                  className="bg-[#1e1e1e] border-[#2a2a2a] hover:border-gray-500/60 transition-all shadow-xl hover:scale-105 cursor-pointer"
                  onClick={() => router.push(`/contests/${contest._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-2xl text-white">{contest.title}</CardTitle>
                      {getStatusBadge(contest.status)}
                    </div>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {contest.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(contest.startTime), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Target className="w-4 h-4" />
                          <span>{contest.problems?.length || 0} Problems</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{contest.participants?.length || 0} Participants</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/contests/${contest._id}`);
                        }}
                      >
                        View Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {contests.length === 0 && (
          <Card className="bg-[#1e1e1e] border-[#2a2a2a] p-16 text-center">
            <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Contests Available</h3>
            <p className="text-gray-400">
              Check back later for upcoming coding competitions!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
