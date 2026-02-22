'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import useRecommendations from '@/hooks/useRecommendations';
import {
  Sparkles, Trophy, AlertTriangle, Zap, Clock,
  ArrowRight, TrendingUp, Brain,
} from 'lucide-react';

interface RecommendationPanelProps {
  userId: string | undefined;
}

const difficultyStyle = (d: string) => {
  if (d === 'Easy')   return 'bg-emerald-500/10 text-emerald-400';
  if (d === 'Medium') return 'bg-amber-500/10   text-amber-400';
  return 'bg-red-500/10 text-red-400';
};

export default function RecommendationPanel({ userId }: RecommendationPanelProps) {
  const router = useRouter();
  const { data, loading, error } = useRecommendations(userId);

  /* ── Loading ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="rounded-2xl bg-[#18181b] border border-white/6 p-6 flex items-center justify-center min-h-55">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-zinc-600 text-xs">Analysing your progress…</p>
        </div>
      </div>
    );
  }

  /* ── Error / No data ──────────────────────────────────────────── */
  if (error || !data) {
    return (
      <div className="rounded-2xl bg-[#18181b] border border-white/6 p-6 flex flex-col items-center justify-center min-h-55 gap-2">
        <Brain className="w-8 h-8 text-zinc-700" />
        <p className="text-zinc-600 text-sm text-center">
          {error ? 'Could not load recommendations.' : 'Solve a few problems to unlock personalised recommendations.'}
        </p>
      </div>
    );
  }

  const { milestone, weakTopics, patternGaps, efficiencyNudge, recommendedProblems } = data;

  const hasInsights = milestone || weakTopics.length > 0 || patternGaps.length > 0 || efficiencyNudge;

  return (
    <div className="rounded-2xl bg-[#18181b] border border-white/6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/6">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Smart Recommendations
          </h3>
          <p className="text-[12px] text-zinc-600 mt-0.5">Personalised for your journey</p>
        </div>
      </div>

      <div className="p-5 space-y-4 flex-1">

        {/* ── Milestone ─────────────────────────────────────────── */}
        {milestone && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-500/8 border border-amber-500/20 p-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                🎉 {milestone} problems solved!
              </p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Amazing milestone — keep the momentum going!
              </p>
            </div>
          </div>
        )}

        {/* ── Weak Topics ───────────────────────────────────────── */}
        {weakTopics.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              Weak areas to strengthen
            </p>
            <div className="flex flex-wrap gap-2">
              {weakTopics.slice(0, 3).map((t) => (
                <div
                  key={t.tag}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/8 border border-red-500/15 text-xs"
                >
                  <span className="text-zinc-300 capitalize">{t.tag}</span>
                  <span className="text-red-400 font-medium">
                    {(t.successRate * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Pattern Gaps ──────────────────────────────────────── */}
        {patternGaps.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-sky-400" />
              Topics you&apos;ve never tried
            </p>
            <div className="flex flex-wrap gap-2">
              {patternGaps.map((g) => (
                <span
                  key={g.tag}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/8 border border-sky-500/15 text-xs text-sky-300 capitalize"
                >
                  {g.tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Efficiency Nudge ──────────────────────────────────── */}
        {efficiencyNudge && (
          <div className="flex items-start gap-3 rounded-xl bg-orange-500/8 border border-orange-500/20 p-3">
            <Clock className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-300/90 leading-relaxed">
              Your accepted solutions use a high fraction of the time limit on average. Try optimising your algorithms for better efficiency.
            </p>
          </div>
        )}

        {/* ── Empty insights ────────────────────────────────────── */}
        {!hasInsights && (
          <div className="flex flex-col items-center gap-2 py-3 text-center">
            <Zap className="w-6 h-6 text-emerald-400/60" />
            <p className="text-sm text-zinc-500">You&apos;re doing great across all topics!</p>
          </div>
        )}

        {/* ── Recommended Problems ──────────────────────────────── */}
        {recommendedProblems.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Try these next
            </p>
            <div className="space-y-1.5">
              {recommendedProblems.map((p) => (
                <button
                  key={p._id}
                  onClick={() => router.push(`/problems/${p._id}`)}
                  className="group w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#1c1c1f] border border-white/5 hover:border-violet-500/25 hover:bg-violet-500/5 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 group-hover:text-white transition-colors font-medium truncate">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${difficultyStyle(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                      {p.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] text-zinc-600 capitalize">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No recommendations at all */}
        {recommendedProblems.length === 0 && !hasInsights && (
          <p className="text-xs text-zinc-700 text-center">
            Solve more problems to get personalised suggestions.
          </p>
        )}
      </div>
    </div>
  );
}
