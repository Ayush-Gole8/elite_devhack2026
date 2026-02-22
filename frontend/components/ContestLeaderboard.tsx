'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Users,
  CheckCircle2,
  XCircle,
  Minus,
  Lock,
  Clock,
  AlertCircle,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────── */
interface ProblemStatus {
  problem: string | { _id: string; title: string; slug: string };
  solved: boolean;
  attempts: number;
  wrongAttempts: number;
  solveTime: number;
  penalty: number;
}

interface Participant {
  user: {
    _id: string;
    name: string;
    username: string;
    profilePhoto?: string;
  };
  score: number;
  penalty: number;
  totalTime: number;
  rank: number;
  problemStatus?: ProblemStatus[];
}

interface Problem {
  _id: string;
  title: string;
  slug: string;
}

interface ContestLeaderboardProps {
  participants: Participant[];
  problems: Problem[];
  currentUserId?: string;
  isFrozen?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────── */
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex items-center gap-1.5">
        <Crown className="w-4 h-4 text-amber-400" />
        <span className="font-bold text-amber-400 tabular-nums">1</span>
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex items-center gap-1.5">
        <Crown className="w-4 h-4 text-zinc-300" />
        <span className="font-bold text-zinc-300 tabular-nums">2</span>
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex items-center gap-1.5">
        <Crown className="w-4 h-4 text-amber-700" />
        <span className="font-bold text-amber-700 tabular-nums">3</span>
      </div>
    );
  return (
    <span className="font-mono text-sm font-semibold text-zinc-500 tabular-nums">
      {rank}
    </span>
  );
}

function ProblemCell({ status }: { status: ProblemStatus | null | undefined }) {
  if (!status || status.attempts === 0) {
    return (
      <td className="px-2 py-3.5 text-center">
        <Minus className="w-4 h-4 text-zinc-700 mx-auto" />
      </td>
    );
  }
  if (status.solved) {
    const timeColor =
      status.solveTime <= 10
        ? 'text-emerald-400'
        : status.solveTime <= 30
          ? 'text-amber-400'
          : 'text-orange-400';
    return (
      <td className="px-2 py-3.5 text-center">
        <div className="flex flex-col items-center gap-0.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className={`font-mono text-[10px] font-semibold ${timeColor}`}>
            {formatTime(status.solveTime)}
          </span>
          {status.wrongAttempts > 0 && (
            <span className="text-[10px] text-red-400/70">
              +{status.wrongAttempts}
            </span>
          )}
        </div>
      </td>
    );
  }
  return (
    <td className="px-2 py-3.5 text-center">
      <div className="flex flex-col items-center gap-0.5">
        <XCircle className="w-4 h-4 text-red-500/70" />
        <span className="text-[10px] text-zinc-500">{status.attempts} att.</span>
      </div>
    </td>
  );
}

/* ─── Component ──────────────────────────────────────────────── */
const ContestLeaderboard: React.FC<ContestLeaderboardProps> = ({
  participants,
  problems,
  currentUserId,
  isFrozen = false,
}) => {
  const getProblemStatus = (participant: Participant, problemId: string) => {
    if (!participant.problemStatus) return null;
    return (
      participant.problemStatus.find(
        (ps) =>
          (typeof ps.problem === 'string' ? ps.problem : ps.problem._id) ===
          problemId,
      ) ?? null
    );
  };

  if (participants.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-[#18181b] border border-white/6 p-16 text-center"
      >
        <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm">No participants yet.</p>
        <p className="text-zinc-600 text-xs mt-1">
          Be the first to register and submit!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Frozen banner */}
      {isFrozen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-sky-500/8 border border-sky-500/20"
        >
          <Lock className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <p className="text-sky-400 text-sm font-semibold">Leaderboard Frozen</p>
            <p className="text-zinc-500 text-xs">
              Standings are locked — final results pending
            </p>
          </div>
        </motion.div>
      )}

      {/* Table card */}
      <div className="relative rounded-2xl bg-[#18181b] border border-white/6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky left-0 bg-[#18181b] z-10 w-14">
                  Rank
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky left-14 bg-[#18181b] z-10 min-w-44">
                  Participant
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider w-16">
                  Solved
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider w-20">
                  Time
                </th>
                {problems.map((problem, i) => (
                  <th
                    key={problem._id}
                    className="px-2 py-3.5 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider min-w-20"
                    title={problem.title}
                  >
                    {String.fromCharCode(65 + i)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {participants.map((participant, index) => {
                const rank = participant.rank || index + 1;
                const isCurrentUser = currentUserId === participant.user?._id;
                const solved = participant.score || 0;

                return (
                  <motion.tr
                    key={participant.user?._id || index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`border-b border-white/3 last:border-b-0 transition-colors ${
                      isCurrentUser
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/8'
                        : 'hover:bg-white/2'
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3.5 sticky left-0 bg-inherit z-10 w-14">
                      <RankBadge rank={rank} />
                    </td>

                    {/* Participant */}
                    <td className="px-4 py-3.5 sticky left-14 bg-inherit z-10 min-w-44">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            rank === 1
                              ? 'bg-amber-500/15 text-amber-400'
                              : rank === 2
                                ? 'bg-zinc-500/15 text-zinc-300'
                                : rank === 3
                                  ? 'bg-amber-800/20 text-amber-700'
                                  : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {participant.user?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold truncate ${
                                isCurrentUser ? 'text-emerald-400' : 'text-white'
                              }`}
                            >
                              {participant.user?.name || 'Anonymous'}
                            </span>
                            {isCurrentUser && (
                              <span className="shrink-0 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                                you
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-600 font-mono">
                            @{participant.user?.username ?? 'unknown'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Solved */}
                    <td className="px-4 py-3.5 text-center w-16">
                      <span
                        className={`font-bold text-base tabular-nums ${
                          solved > 0 ? 'text-emerald-400' : 'text-zinc-600'
                        }`}
                      >
                        {solved}
                      </span>
                    </td>

                    {/* Time + penalty */}
                    <td className="px-4 py-3.5 text-center w-20">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-mono text-xs font-semibold text-zinc-300 tabular-nums">
                          {formatTime(participant.totalTime || 0)}
                        </span>
                        {(participant.penalty || 0) > 0 && (
                          <span className="text-[10px] text-red-400/80 font-medium">
                            +{participant.penalty}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Per-problem cells */}
                    {problems.map((problem) => (
                      <ProblemCell
                        key={problem._id}
                        status={getProblemStatus(participant, problem._id)}
                      />
                    ))}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Solved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-red-500/70" />
          <span>Attempted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Minus className="w-3.5 h-3.5 text-zinc-700" />
          <span>Not attempted</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fast (&lt;10m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Mid (10–30m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span>Slow (&gt;30m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-400/70" />
          <span>Wrong attempts in red</span>
        </div>
      </div>
    </div>
  );
};

export default ContestLeaderboard;
