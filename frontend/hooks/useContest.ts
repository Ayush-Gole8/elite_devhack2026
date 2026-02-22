'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { contestAPI } from '@/lib/api';
import { toast } from 'sonner';

export interface ProblemStatus {
  problem: string;
  solved: boolean;
  attempts: number;
  wrongAttempts: number;
  solveTime: number;
  penalty: number;
}

export interface Participant {
  user: { _id: string; name: string; username: string; profilePicture?: string } | string;
  score: number;
  penalty: number;
  totalTime: number;
  rank?: number;
  problemStatus: ProblemStatus[];
}

export interface ContestProblem {
  _id: string;
  title: string;
  slug?: string;
  difficulty: string;
  tags?: string[];
  totalSubmissions?: number;
  acceptedSubmissions?: number;
}

export interface Contest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  problems: ContestProblem[];
  participants: Participant[];
  status: 'upcoming' | 'ongoing' | 'completed';
  isPublic: boolean;
  isFrozen?: boolean;
  penaltyPerWrongAttempt?: number;
  createdBy?: { name: string; username: string };
}

export type ContestState = 'not_started' | 'active' | 'ended' | 'not_registered';

interface UseContestReturn {
  contest: Contest | null;
  loading: boolean;
  registering: boolean;
  contestState: ContestState;
  timeRemaining: number; // seconds
  isRegistered: boolean;
  canAccessProblems: boolean;
  sortedParticipants: Participant[];
  getUserProblemStatus: (problemId: string) => ProblemStatus | null;
  register: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useContest(contestId: string, userId?: string): UseContestReturn {
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchContest = useCallback(async () => {
    if (!contestId) return;
    try {
      setLoading(true);
      const response = await contestAPI.getContest(contestId);
      setContest(response.data);
    } catch {
      toast.error('Failed to load contest');
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  // Timer synchronization
  useEffect(() => {
    if (!contest) return;
    const updateTimer = () => {
      const now = Date.now();
      const start = new Date(contest.startTime).getTime();
      const end = new Date(contest.endTime).getTime();
      if (now < start) {
        setTimeRemaining(Math.max(0, Math.floor((start - now) / 1000)));
      } else if (now < end) {
        setTimeRemaining(Math.max(0, Math.floor((end - now) / 1000)));
      } else {
        setTimeRemaining(0);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [contest]);

  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  const isRegistered = !!(contest && userId &&
    contest.participants.some((p) => {
      const pid = typeof p.user === 'string' ? p.user : p.user?._id;
      return pid === userId;
    }));

  const contestState: ContestState = (() => {
    if (!contest) return 'not_started';
    const now = Date.now();
    const start = new Date(contest.startTime).getTime();
    const end = new Date(contest.endTime).getTime();
    if (now < start) return 'not_started';
    if (now >= start && now <= end) return 'active';
    return 'ended';
  })();

  const canAccessProblems =
    contestState === 'active' && isRegistered ||
    contestState === 'ended'; // show after contest ends

  const sortedParticipants = contest
    ? [...contest.participants].sort((a, b) => {
        if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
        return (a.totalTime ?? 0) - (b.totalTime ?? 0);
      })
    : [];

  const getUserProblemStatus = (problemId: string): ProblemStatus | null => {
    if (!userId || !contest) return null;
    const participant = contest.participants.find((p) => {
      const pid = typeof p.user === 'string' ? p.user : p.user?._id;
      return pid === userId;
    });
    if (!participant?.problemStatus) return null;
    return (
      participant.problemStatus.find(
        (ps) => (typeof ps.problem === 'string' ? ps.problem : (ps.problem as { _id: string })._id) === problemId
      ) ?? null
    );
  };

  const register = async () => {
    if (!userId) {
      toast.error('Please login to register');
      return;
    }
    try {
      setRegistering(true);
      await contestAPI.registerForContest(contestId);
      toast.success('Successfully registered for contest');
      await fetchContest();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  return {
    contest,
    loading,
    registering,
    contestState,
    timeRemaining,
    isRegistered,
    canAccessProblems,
    sortedParticipants,
    getUserProblemStatus,
    register,
    refetch: fetchContest,
  };
}
