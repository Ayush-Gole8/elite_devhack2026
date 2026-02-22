'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ContestLeaderboard from '@/components/ContestLeaderboard';
import { useContest, ContestProblem } from '@/hooks/useContest';
import {
  Trophy,
  Users,
  ListChecks,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Code2,
  TrendingUp,
  Radio,
  Calendar,
  Circle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

/* ─── Countdown display ──────────────────────────────────────── */
function CountdownBlock({ seconds, label }: { seconds: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-2xl font-bold text-white tabular-nums w-12 text-center">
        {String(seconds).padStart(2, '0')}
      </span>
      <span className="text-zinc-500 text-[10px] uppercase tracking-widest">{label}</span>
    </div>
  );
}

function ContestTimer({ timeRemaining, label }: { timeRemaining: number; label: string }) {
  const h = Math.floor(timeRemaining / 3600);
  const m = Math.floor((timeRemaining % 3600) / 60);
  const s = timeRemaining % 60;
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-zinc-500 text-xs font-medium">{label}</p>
      <div className="flex items-center gap-3">
        <CountdownBlock seconds={h} label="hrs" />
        <span className="text-zinc-600 font-mono text-2xl font-bold pb-4">:</span>
        <CountdownBlock seconds={m} label="min" />
        <span className="text-zinc-600 font-mono text-2xl font-bold pb-4">:</span>
        <CountdownBlock seconds={s} label="sec" />
      </div>
    </div>
  );
}

/* ─── Status icon for problem ────────────────────────────────── */
function ProblemStatusIcon({ solved, attempted }: { solved: boolean; attempted: boolean }) {
  if (solved) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (attempted) return <RotateCcw className="w-4 h-4 text-amber-400" />;
  return <Circle className="w-4 h-4 text-zinc-600" />;
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ContestDetailPage() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;
  const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard'>('problems');

  const {
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
    refetch,
  } = useContest(contestId, user?._id);

  /* Socket.io — real-time leaderboard */
  useEffect(() => {
    if (!socket || !contestId) return;
    socket.emit('joinContest', contestId);
    socket.on('leaderboardUpdate', () => {
      refetch();
      toast.success('Leaderboard updated', { duration: 1800 });
    });
    return () => {
      socket.emit('leaveContest', contestId);
      socket.off('leaderboardUpdate');
    };
  }, [socket, contestId, refetch]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
          </div>
          <p className="text-zinc-500 text-sm">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="rounded-2xl bg-[#18181b] border border-white/6 p-10 text-center max-w-sm">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Contest not found</h3>
          <button
            onClick={() => router.push('/contests')}
            className="mt-4 px-5 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  const timerLabel =
    contestState === 'not_started'
      ? 'Starts in'
      : contestState === 'active'
      ? 'Ends in'
      : 'Contest ended';

  const statusBadge = () => {
    if (contestState === 'active') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
        <Radio className="w-3 h-3 animate-pulse" />Live
      </span>
    );
    if (contestState === 'not_started') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/25">
        <Calendar className="w-3 h-3" />Upcoming
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-700/60 text-zinc-400 border border-zinc-700">
        <CheckCircle2 className="w-3 h-3" />Ended
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 glass-nav">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push('/contests')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Contests
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-300 text-sm font-medium truncate">{contest.title}</span>
          <div className="ml-auto">{statusBadge()}</div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Hero card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl bg-[#18181b] border border-white/6 overflow-hidden"
        >
          {/* shimmer */}
          <div className={`absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent ${
            contestState === 'active' ? 'via-emerald-500/50' : contestState === 'not_started' ? 'via-sky-500/40' : 'via-zinc-500/20'
          } to-transparent`} />
          {/* glow blob */}
          {contestState === 'active' && (
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
          )}

          <div className="p-7 grid lg:grid-cols-[1fr_auto] gap-8">
            {/* left: title + description + metrics */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    contestState === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                    contestState === 'not_started' ? 'bg-sky-500/10 text-sky-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  {statusBadge()}
                </div>
                <h1 className="text-2xl font-bold text-white leading-tight">{contest.title}</h1>
                {contest.createdBy && (
                  <p className="text-zinc-500 text-sm mt-1">by {contest.createdBy.name || contest.createdBy.username}</p>
                )}
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">{contest.description}</p>

              {/* metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Clock, label: 'Duration', value: `${contest.duration} min` },
                  { icon: ListChecks, label: 'Problems', value: contest.problems?.length ?? 0 },
                  { icon: Users, label: 'Participants', value: contest.participants?.length ?? 0 },
                  {
                    icon: Calendar,
                    label: contestState === 'ended' ? 'Ended' : 'Start',
                    value: format(new Date(contestState === 'ended' ? contest.endTime : contest.startTime), 'MMM dd · hh:mm a'),
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl bg-zinc-900/60 border border-white/4 p-3.5">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                    <p className="text-white text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* right: timer + register */}
            <div className="flex flex-col items-center justify-center gap-5 min-w-50">
              {contestState !== 'ended' ? (
                <div className="rounded-2xl bg-zinc-900/60 border border-white/6 px-8 py-6">
                  <ContestTimer timeRemaining={timeRemaining} label={timerLabel} />
                </div>
              ) : (
                <div className="rounded-2xl bg-zinc-900/60 border border-white/6 px-8 py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm font-medium">Contest ended</p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    {format(new Date(contest.endTime), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}

              {!isRegistered && contestState !== 'ended' ? (
                <button
                  onClick={register}
                  disabled={registering}
                  className="w-full rounded-xl py-3 px-6 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {registering ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" />Register</>
                  )}
                </button>
              ) : isRegistered ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Registered
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/60 border border-white/4 w-fit">
          {(['problems', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-[#18181b] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'problems' ? <Code2 className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {tab === 'problems' ? 'Problems' : 'Leaderboard'}
              {tab === 'leaderboard' && connected && contestState === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'problems' && (
            <motion.div
              key="problems"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {!canAccessProblems ? (
                /* locked state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-[#18181b] border border-white/6 p-14 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {contestState === 'not_started' ? 'Problems are hidden' : 'Registration required'}
                  </h3>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                    {contestState === 'not_started'
                      ? 'Problems will be revealed when the contest begins.'
                      : 'Register for this contest to access the problem set.'}
                  </p>
                  {!isRegistered && contestState === 'not_started' && (
                    <button
                      onClick={register}
                      disabled={registering}
                      className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                    >
                      Register Now
                    </button>
                  )}
                </motion.div>
              ) : (
                /* problems list */
                <div className="rounded-2xl bg-[#18181b] border border-white/6 overflow-hidden">
                  {/* active banner */}
                  {contestState === 'active' && (
                    <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/8 border-b border-emerald-500/15">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-emerald-400 text-xs font-semibold">Contest is live — good luck!</p>
                    </div>
                  )}

                  {/* table header */}
                  <div className="grid grid-cols-[32px_40px_1fr_80px_80px] gap-4 px-5 py-3 border-b border-white/4 text-zinc-500 text-xs font-medium uppercase tracking-wider">
                    <span></span>
                    <span>#</span>
                    <span>Problem</span>
                    <span className="text-right">Solved</span>
                    <span className="text-right">Accuracy</span>
                  </div>

                  {/* rows */}
                  <motion.div
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                  >
                    {contest.problems && contest.problems.length > 0 ? (
                      contest.problems.map((problem: ContestProblem, index: number) => {
                        const ps = getUserProblemStatus(problem._id);
                        const isSolved = ps?.solved ?? false;
                        const isAttempted = (ps?.attempts ?? 0) > 0;
                        const totalSub = problem.totalSubmissions ?? 0;
                        const accSub = problem.acceptedSubmissions ?? 0;
                        const accuracy = totalSub > 0 ? Math.round((accSub / totalSub) * 100) : null;

                        return (
                          <motion.div
                            key={problem._id}
                            variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                            className={`grid grid-cols-[32px_40px_1fr_80px_80px] gap-4 px-5 py-4 border-b border-white/3 cursor-pointer transition-colors last:border-b-0 ${
                              isSolved ? 'bg-emerald-500/3' : ''
                            }`}
                            onClick={() => router.push(`/problems/${problem._id}?contestId=${contestId}`)}
                          >
                            {/* status */}
                            <div className="flex items-center">
                              <ProblemStatusIcon solved={isSolved} attempted={isAttempted} />
                            </div>
                            {/* index */}
                            <div className="flex items-center text-zinc-500 font-mono text-sm font-bold">
                              {String.fromCharCode(65 + index)}
                            </div>
                            {/* title */}
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`text-sm font-medium truncate ${isSolved ? 'text-emerald-400' : 'text-white'}`}>
                                {problem.title}
                              </span>
                              {ps && ps.attempts > 0 && !isSolved && (
                                <span className="shrink-0 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
                                  {ps.attempts} attempt{ps.attempts > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {/* solved count */}
                            <div className="flex items-center justify-end text-zinc-500 text-xs">
                              {accSub > 0 ? accSub : '—'}
                            </div>
                            {/* accuracy */}
                            <div className="flex items-center justify-end text-xs">
                              {accuracy !== null ? (
                                <span className={accuracy >= 50 ? 'text-emerald-400' : accuracy >= 25 ? 'text-amber-400' : 'text-rose-400'}>
                                  {accuracy}%
                                </span>
                              ) : <span className="text-zinc-600">—</span>}
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="p-12 text-center">
                        <ListChecks className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No problems available yet.</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ContestLeaderboard
                participants={sortedParticipants.filter(p => typeof p.user !== 'string').map((p, i) => ({
                  ...p,
                  user: p.user as { _id: string; name: string; username: string; profilePhoto?: string },
                  rank: p.rank ?? i + 1,
                }))}
                problems={contest.problems.map(p => ({ _id: p._id, title: p.title, slug: p.slug ?? p._id }))}
                currentUserId={user?._id}
                isFrozen={contest.isFrozen || false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

