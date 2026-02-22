"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Crown, Medal, Users, CheckCircle2, XCircle, Minus, Lock } from 'lucide-react';

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

const ContestLeaderboard: React.FC<ContestLeaderboardProps> = ({
  participants,
  problems,
  currentUserId,
  isFrozen = false,
}) => {
  // Format time in HH:MM format
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Get problem status for a participant
  const getProblemStatus = (participant: Participant, problemId: string) => {
    if (!participant.problemStatus) return null;
    return participant.problemStatus.find(
      ps => (typeof ps.problem === 'string' ? ps.problem : ps.problem._id) === problemId
    );
  };

  // Color code solve times
  const getSolveTimeColor = (solveTime: number): string => {
    if (solveTime <= 10) return 'text-green-400';
    if (solveTime <= 30) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (participants.length === 0) {
    return (
      <Card className="bg-[#1e1e1e] border-[#2a2a2a]">
        <div className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No participants yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isFrozen && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-blue-400 font-semibold">Leaderboard Frozen</p>
            <p className="text-sm text-gray-400">Final standings are locked</p>
          </div>
        </div>
      )}

      <Card className="bg-[#1e1e1e] border-[#2a2a2a]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#252525] border-b border-[#3a3a3a]">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-bold text-gray-300 uppercase sticky left-0 bg-[#252525] z-10">
                  Rank
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-gray-300 uppercase sticky left-20 bg-[#252525] z-10">
                  Participant
                </th>
                <th className="px-4 py-4 text-center text-sm font-bold text-gray-300 uppercase">
                  Solved
                </th>
                <th className="px-4 py-4 text-center text-sm font-bold text-gray-300 uppercase">
                  Time
                </th>
                {problems.map((problem) => (
                  <th
                    key={problem._id}
                    className="px-3 py-4 text-center text-xs font-bold text-gray-300 uppercase min-w-25"
                    title={problem.title}
                  >
                    {problem.title.length > 12
                      ? `${problem.title.substring(0, 12)}...`
                      : problem.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {participants.map((participant, index) => {
                const rank = participant.rank || index + 1;
                const isCurrentUser = currentUserId === participant.user?._id;

                return (
                  <tr
                    key={participant.user?._id || index}
                    className={`transition-all hover:bg-[#252525] ${
                      isCurrentUser ? 'bg-purple-500/10 border-l-4 border-purple-500' : ''
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-[#1e1e1e] z-10">
                      <div className="flex items-center gap-2">
                        {rank === 1 && <Crown className="w-5 h-5 text-yellow-400" />}
                        {rank === 2 && <Medal className="w-5 h-5 text-gray-300" />}
                        {rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                        <span
                          className={`text-lg font-bold ${
                            rank <= 3 ? 'text-yellow-400' : 'text-gray-400'
                          }`}
                        >
                          #{rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap sticky left-20 bg-[#1e1e1e] z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-white">
                            {participant.user?.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="min-w-37.5">
                          <p className="text-white font-semibold flex items-center gap-2">
                            {participant.user?.name || 'Anonymous'}
                            {isCurrentUser && (
                              <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-gray-400 text-sm">
                            @{participant.user?.username || 'unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-2xl font-bold text-green-400">
                        {participant.score || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-blue-400">
                          {formatTime(participant.totalTime || 0)}
                        </span>
                        {(participant.penalty || 0) > 0 && (
                          <span className="text-xs text-red-400">
                            (+{participant.penalty})
                          </span>
                        )}
                      </div>
                    </td>
                    {problems.map((problem) => {
                      const status = getProblemStatus(participant, problem._id);

                      if (!status || status.attempts === 0) {
                        // Not attempted
                        return (
                          <td key={problem._id} className="px-3 py-4 text-center">
                            <Minus className="w-5 h-5 text-gray-600 mx-auto" />
                          </td>
                        );
                      }

                      if (status.solved) {
                        // Solved
                        return (
                          <td key={problem._id} className="px-3 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                              <div className="text-xs flex flex-col">
                                <span className={getSolveTimeColor(status.solveTime)}>
                                  {formatTime(status.solveTime)}
                                </span>
                                <span className="text-gray-500">
                                  ({status.attempts})
                                </span>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      // Attempted but not solved
                      return (
                        <td key={problem._id} className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <XCircle className="w-6 h-6 text-red-500" />
                            <span className="text-xs text-gray-500">
                              ({status.attempts})
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-400 px-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Solved</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span>Attempted</span>
        </div>
        <div className="flex items-center gap-2">
          <Minus className="w-4 h-4 text-gray-600" />
          <span>Not Attempted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">●</span>
          <span>&lt;10 min</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">●</span>
          <span>10-30 min</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-400">●</span>
          <span>&gt;30 min</span>
        </div>
      </div>
    </div>
  );
};

export default ContestLeaderboard;
