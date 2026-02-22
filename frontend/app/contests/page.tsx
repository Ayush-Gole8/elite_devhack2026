'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { contestAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  ListChecks,
  CheckCircle2,
  ArrowRight,
  Lock,
  Radio,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ContestParticipant {
  user: { _id: string; name: string; username: string } | string;
  score?: number;
}

interface Contest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  problems: { _id: string; title: string }[];
  participants: ContestParticipant[];
  status: 'upcoming' | 'ongoing' | 'completed';
  isPublic: boolean;
}

/* ─── Countdown hook ─────────────────────────────────────────── */
function useCountdown(target: string): string {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setDisplay('00:00:00'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setDisplay(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return display;
}

/* ─── Status badge ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === 'ongoing') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      <Radio className="w-3 h-3 animate-pulse" />
      Live
    </span>
  );
  if (status === 'upcoming') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/25">
      <Calendar className="w-3 h-3" />
      Upcoming
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-700/60 text-zinc-400 border border-zinc-700">
      <CheckCircle2 className="w-3 h-3" />
      Ended
    </span>
  );
}

/* ─── Contest card ───────────────────────────────────────────── */
function ContestCard({
  contest,
  userId,
  onRegister,
  registering,
}: {
  contest: Contest;
  userId?: string;
  onRegister: (id: string, c: Contest) => void;
  registering: string | null;
}) {
  const router = useRouter();
  const isRegistered = userId
    ? contest.participants.some((p) => (typeof p.user === 'string' ? p.user : p.user._id) === userId)
    : false;

  const timerTarget = contest.status === 'upcoming' ? contest.startTime : contest.endTime;
  const countdown = useCountdown(timerTarget);

  const accentHover =
    contest.status === 'ongoing'
      ? 'hover:border-emerald-500/30'
      : contest.status === 'upcoming'
      ? 'hover:border-sky-500/25'
      : 'hover:border-zinc-600/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={`group relative rounded-2xl bg-[#18181b] border border-white/6 overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow ${accentHover}`}
      onClick={() => router.push(`/contests/${contest._id}`)}
    >
      {/* shimmer line */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent ${
          contest.status === 'ongoing'
            ? 'via-emerald-500/50'
            : contest.status === 'upcoming'
            ? 'via-sky-500/40'
            : 'via-zinc-500/20'
        } to-transparent`}
      />
      {contest.status === 'ongoing' && (
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="p-5 flex flex-col gap-4">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`shrink-0 mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center ${
              contest.status === 'ongoing'
                ? 'bg-emerald-500/15 text-emerald-400'
                : contest.status === 'upcoming'
                ? 'bg-sky-500/10 text-sky-400'
                : 'bg-zinc-800 text-zinc-500'
            }`}>
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors">
                {contest.title}
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                {contest.description}
              </p>
            </div>
          </div>
          <StatusBadge status={contest.status} />
        </div>

        {/* countdown */}
        {contest.status !== 'completed' && (
          <div className="rounded-xl bg-zinc-900/60 border border-white/4 px-4 py-2.5 flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-medium">
              {contest.status === 'ongoing' ? 'Ends in' : 'Starts in'}
            </span>
            <span className="font-mono text-base font-bold tracking-widest text-white tabular-nums">
              {countdown}
            </span>
          </div>
        )}

        {/* stats */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5" />
            {contest.problems?.length ?? 0} problems
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {contest.participants?.length ?? 0} joined
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            {contest.duration} min
          </span>
        </div>

        {contest.status === 'upcoming' && (
          <p className="text-zinc-500 text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(contest.startTime), 'MMM dd, yyyy · hh:mm a')}
          </p>
        )}

        {/* CTA */}
        <div onClick={(e) => e.stopPropagation()}>
          {contest.status === 'completed' ? (
            <button
              className="w-full rounded-xl py-2.5 text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              onClick={() => router.push(`/contests/${contest._id}`)}
            >
              <BarChart3 className="w-4 h-4" />
              View Results
            </button>
          ) : isRegistered ? (
            <button
              className="w-full rounded-xl py-2.5 text-sm font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors flex items-center justify-center gap-2"
              onClick={() => router.push(`/contests/${contest._id}`)}
            >
              <ArrowRight className="w-4 h-4" />
              {contest.status === 'ongoing' ? 'Enter Contest' : 'View Contest'}
            </button>
          ) : (
            <button
              className="w-full rounded-xl py-2.5 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={registering === contest._id}
              onClick={() => onRegister(contest._id, contest)}
            >
              {registering === contest._id ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" />Register Now</>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({
  icon: Icon,
  label,
  count,
  dotColor,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  dotColor: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <Icon className={`w-5 h-5 ${dotColor}`} />
      <h2 className="text-base font-semibold text-white">{label}</h2>
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
        {count}
      </span>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ─── Page ───────────────────────────────────────────────────── */
export default function ContestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contestAPI.getContests();
      const all: Contest[] = response.data || [];
      const order: Record<string, number> = { ongoing: 0, upcoming: 1, completed: 2 };
      all.sort(
        (a, b) =>
          (order[a.status] ?? 3) - (order[b.status] ?? 3) ||
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      setContests(all);
    } catch {
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContests(); }, [fetchContests]);

  const handleRegister = async (contestId: string, contest: Contest) => {
    if (!user) { toast.error('Please login to register'); router.push('/login'); return; }
    const now = new Date();
    if (new Date(contest.endTime) < now) { toast.error('Contest has already ended'); return; }
    if (contest.participants.some((p) => (typeof p.user === 'string' ? p.user : p.user._id) === user._id)) {
      toast.info('Already registered'); return;
    }
    try {
      setRegistering(contestId);
      await contestAPI.registerForContest(contestId);
      toast.success('Registered successfully');
      fetchContests();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to register');
    } finally {
      setRegistering(null);
    }
  };

  const grouped = {
    ongoing: contests.filter((c) => c.status === 'ongoing'),
    upcoming: contests.filter((c) => c.status === 'upcoming'),
    completed: contests.filter((c) => c.status === 'completed'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
          </div>
          <p className="text-zinc-500 text-sm">Loading contests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 glass-nav">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Contests</span>
          </div>
          {user && (
            <button
              onClick={() => router.push('/admin/contests/create')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              <Trophy className="w-4 h-4" />
              Create Contest
            </button>
          )}
          {!user && <div className="w-24" />}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">Coding Contests</h1>
          <p className="text-zinc-500 mt-1.5 text-sm">
            Compete in timed challenges, earn rankings, and benchmark your skills.
          </p>
        </motion.div>

        {/* Live */}
        <AnimatePresence>
          {grouped.ongoing.length > 0 && (
            <motion.section key="ongoing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
              <SectionHeader icon={Radio} label="Live Now" count={grouped.ongoing.length} dotColor="text-emerald-400" />
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped.ongoing.map((c) => (
                  <ContestCard key={c._id} contest={c} userId={user?._id} onRegister={handleRegister} registering={registering} />
                ))}
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Upcoming */}
        {grouped.upcoming.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <SectionHeader icon={Calendar} label="Upcoming" count={grouped.upcoming.length} dotColor="text-sky-400" />
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.upcoming.map((c) => (
                <ContestCard key={c._id} contest={c} userId={user?._id} onRegister={handleRegister} registering={registering} />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Past */}
        {grouped.completed.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <SectionHeader icon={CheckCircle2} label="Past Contests" count={grouped.completed.length} dotColor="text-zinc-500" />
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.completed.map((c) => (
                <ContestCard key={c._id} contest={c} userId={user?._id} onRegister={handleRegister} registering={registering} />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Empty */}
        {contests.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-[#18181b] border border-white/6 p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-7 h-7 text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No contests available</h3>
            <p className="text-zinc-500 text-sm">Check back later for upcoming competitions.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

