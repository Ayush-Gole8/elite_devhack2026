'use client';

import { useState, useEffect, useCallback } from 'react';import Image from "next/image";import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { problemAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  Search,
  LayoutDashboard,
  Trophy,
  Code2,
  Tag,
  SlidersHorizontal,
  Flame,
  Zap,
  CheckCircle2,
  ChevronRight,
  X,
  ListFilter,
  Loader2,
  Frown,
  BarChart3,
  Target,
  Swords,
} from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  tags?: string[];
  totalSubmissions: number;
  acceptedSubmissions: number;
  solved?: boolean;
}

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    classes: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    icon: CheckCircle2,
  },
  medium: {
    label: 'Medium',
    classes: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    icon: Zap,
  },
  hard: {
    label: 'Hard',
    classes: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    icon: Flame,
  },
} as const;

const TAG_COLORS = [
  'bg-sky-500/10 text-sky-500 border-sky-500/20',
  'bg-violet-500/10 text-violet-500 border-violet-500/20',
  'bg-teal-500/10 text-teal-500 border-teal-500/20',
  'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
  'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'bg-pink-500/10 text-pink-500 border-pink-500/20',
];

const getTagColor = (tag: string) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

const getDifficultyConfig = (difficulty: string) => {
  return (
    DIFFICULTY_CONFIG[difficulty?.toLowerCase() as keyof typeof DIFFICULTY_CONFIG] ?? {
      label: difficulty || 'Unknown',
      classes: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
      icon: Zap,
    }
  );
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function ProblemsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedTags = useDebounce(tagsInput, 400);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (difficulty) filters.difficulty = difficulty;
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
      if (debouncedTags.trim()) filters.tags = debouncedTags.trim();
      const response = await problemAPI.getProblems(filters);
      setProblems(response.data || response);
    } catch {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, [difficulty, debouncedSearch, debouncedTags]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const clearFilters = () => {
    setSearchInput('');
    setTagsInput('');
    setDifficulty('');
  };

  const hasActiveFilters = searchInput || tagsInput || difficulty;

  const easyCount   = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
  const mediumCount  = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
  const hardCount    = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;
  const solvedCount  = problems.filter(p => p.solved).length;

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-3 group"
          >
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">Elite DevHack</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Practice Arena</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="rounded-xl">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/contests')} className="rounded-xl">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Contests</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/leaderboard')} className="rounded-xl">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
            {user.profilePhoto && (
              <div className="relative ml-1">
                <Image
                  src={user.profilePhoto}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border-2 border-primary/30 shadow"
                  unoptimized
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Problems</h1>
          <p className="text-muted-foreground text-sm">Train your problem-solving skills. Pick a challenge and start coding.</p>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total',  value: problems.length, icon: BarChart3,    color: 'text-primary',      bg: 'bg-primary/10'      },
            { label: 'Solved', value: solvedCount,      icon: CheckCircle2, color: 'text-emerald-500',  bg: 'bg-emerald-500/10'  },
            { label: 'Easy',   value: easyCount,        icon: CheckCircle2, color: 'text-emerald-500',  bg: 'bg-emerald-500/10'  },
            { label: 'Medium', value: mediumCount,       icon: Zap,          color: 'text-amber-500',    bg: 'bg-amber-500/10'    },
            { label: 'Hard',   value: hardCount,         icon: Flame,        color: 'text-rose-500',     bg: 'bg-rose-500/10'     },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
                  <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── FILTER CARD ── */}
        <Card className="rounded-2xl border shadow-sm mb-6">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filter Problems
            </CardTitle>
            <CardDescription className="text-xs">Narrow down by title, difficulty, or topic tags</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by title..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="pl-9 rounded-xl border-border/60 focus-visible:ring-primary/25"
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Difficulty */}
              <div className="relative">
                <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition appearance-none"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                {difficulty && (
                  <button onClick={() => setDifficulty('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Tags */}
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="e.g. array, dp, greedy"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="pl-9 rounded-xl border-border/60 focus-visible:ring-primary/25"
                />
                {tagsInput && (
                  <button onClick={() => setTagsInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Active:</span>
                {searchInput && (
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
                    &ldquo;{searchInput}&rdquo;
                    <button onClick={() => setSearchInput('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {difficulty && (
                  <span className={`inline-flex items-center gap-1 text-xs border rounded-full px-2.5 py-0.5 font-medium ${getDifficultyConfig(difficulty).classes}`}>
                    {difficulty}
                    <button onClick={() => setDifficulty('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {tagsInput && (
                  <span className="inline-flex items-center gap-1 text-xs bg-violet-500/10 text-violet-500 border border-violet-500/20 rounded-full px-2.5 py-0.5 font-medium">
                    tags: {tagsInput}
                    <button onClick={() => setTagsInput('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── RESULTS COUNT ── */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{problems.length}</span> problem{problems.length !== 1 ? 's' : ''}
              {hasActiveFilters && <span className="ml-1 text-muted-foreground">(filtered)</span>}
            </p>
          </div>
        )}

        {/* ── PROBLEM LIST ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading problems…</p>
          </div>
        ) : problems.length === 0 ? (
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="py-24 flex flex-col items-center gap-3">
              <Frown className="h-16 w-16 text-muted-foreground/40" />
              <p className="text-lg font-semibold">No problems found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or clear them to see all problems.</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-2 rounded-xl" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {problems.map((problem, index) => {
              const diffConfig = getDifficultyConfig(problem.difficulty);
              const DiffIcon = diffConfig.icon;
              const acceptanceRate =
                problem.totalSubmissions > 0
                  ? Math.round((problem.acceptedSubmissions / problem.totalSubmissions) * 100)
                  : null;
              const visibleTags = problem.tags?.slice(0, 4) ?? [];
              const extraTags = (problem.tags?.length ?? 0) - visibleTags.length;

              return (
                <Card
                  key={problem._id}
                  className="rounded-2xl border hover:border-primary/40 hover:shadow-md transition-all duration-150 cursor-pointer group bg-card"
                  onClick={() => router.push(`/problems/${problem._id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Index / Solved indicator */}
                      <div className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-xl transition-colors shrink-0
                        ${ problem.solved
                          ? 'bg-emerald-500/15 group-hover:bg-emerald-500/25'
                          : 'bg-muted group-hover:bg-primary/10'
                        }`}>
                        {problem.solved ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight mb-2 group-hover:text-primary transition-colors truncate">
                          {problem.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {visibleTags.map(tag => (
                            <span
                              key={tag}
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {extraTags > 0 && (
                            <span className="inline-flex items-center rounded-full border border-border/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/50">
                              +{extraTags} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right-side stats */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Acceptance */}
                        {acceptanceRate !== null && (
                          <div className="hidden md:flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <Target className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-semibold text-foreground">{acceptanceRate}%</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">acceptance</span>
                          </div>
                        )}

                        {/* Difficulty badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${diffConfig.classes}`}
                        >
                          <DiffIcon className="h-3.5 w-3.5" />
                          {diffConfig.label}
                        </span>

                        {/* CTA */}
                        <Button
                          size="sm"
                          variant={problem.solved ? 'outline' : 'default'}
                          className={`rounded-xl shadow-sm group-hover:shadow-md transition-shadow ${
                            problem.solved
                              ? 'border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10'
                              : ''
                          }`}
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/problems/${problem._id}`);
                          }}
                        >
                          {problem.solved ? (
                            <><CheckCircle2 className="h-3.5 w-3.5" />Solved</>
                          ) : (
                            <>Solve<ChevronRight className="h-3.5 w-3.5" /></>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="h-16" />
      </div>
    </div>
  );
}