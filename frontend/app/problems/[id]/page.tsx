"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { problemAPI, submissionAPI, contestAPI } from "@/lib/api";
import { ContestTimer } from "@/components/ui/contest-timer";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Loader2,
  Clock,
  BarChart2,
  ChevronDown,
  Play,
  ShieldAlert,
  FlaskConical,
  BookOpen,
  History,
  Trophy,
  Terminal,
  AlertCircle,
  Zap,
  Timer,
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────
interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string | null;
}

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  tags?: string[];
  description?: string;
  constraints?: string;
  examples?: Example[];
  sample?: Example;
  time_limit_ms?: number;
  memory_limit_mb?: number;
  totalSubmissions?: number;
  acceptedSubmissions?: number;
  source?: string;
}

interface Submission {
  _id: string;
  status: string;
  testResults?: TestResult[];
  testCasesPassed?: number;
  totalTestCases?: number;
  executionTime?: number;
  error?: string;
}

// History record returned from GET /submissions/problem/:id?mine=true
interface SubmissionRecord {
  _id: string;
  status: string;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime?: number;
  language: string;
  submittedAt: string;
  error?: string;
}

interface ApiError {
  response?: { data?: { message?: string } };
}

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestId = searchParams.get('contestId');

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("// Write your solution here\n");
  const [language, setLanguage] = useState("63");
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [polling, setPolling] = useState(false);
  const [copiedInput, setCopiedInput] = useState<number | null>(null);
  const [copiedOutput, setCopiedOutput] = useState<number | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [contest, setContest] = useState<any>(null);
  const [contestLoading, setContestLoading] = useState(false);
  const [contestElapsedTime, setContestElapsedTime] = useState<string>('00:00:00');
  const [contestElapsedMinutes, setContestElapsedMinutes] = useState<number>(0);

  // Language ID → display name map
  const langIdToName: Record<string, string> = {
    "63": "JavaScript",
    "71": "Python",
    "54": "C++",
    "62": "Java",
    "50": "C",
  };

  // Simple relative time helper
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const languages = [
    {
      id: "63",
      name: "JavaScript",
      monaco: "javascript",
      starter: '// Write your solution here\nconsole.log("Hello World");',
    },
    {
      id: "71",
      name: "Python",
      monaco: "python",
      starter: '# Write your solution here\nprint("Hello World")',
    },
    {
      id: "54",
      name: "C++",
      monaco: "cpp",
      starter:
        '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    cout << "Hello World" << endl;\n    return 0;\n}',
    },
    {
      id: "62",
      name: "Java",
      monaco: "java",
      starter:
        'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello World");\n    }\n}',
    },
    {
      id: "50",
      name: "C",
      monaco: "c",
      starter:
        '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    printf("Hello World\\n");\n    return 0;\n}',
    },
  ];

  const getCurrentLanguage = () =>
    languages.find((l) => l.id === language) || languages[0];

  const fetchProblem = useCallback(async () => {
    try {
      setLoading(true);
      const response = await problemAPI.getProblem(id);
      const data = response.data || response;
      setProblem(data);
      setCode(getCurrentLanguage().starter);
    } catch {
      toast.error("Failed to load problem");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchContest = useCallback(async (cId: string) => {
    try {
      setContestLoading(true);
      const response = await contestAPI.getContest(cId);
      const data = response.data || response;
      setContest(data);
    } catch {
      toast.error("Failed to load contest details");
    } finally {
      setContestLoading(false);
    }
  }, []);

  const loadSubmissionHistory = useCallback(async (problemId: string) => {
    if (!problemId) return;
    setHistoryLoading(true);
    try {
      const response = await submissionAPI.getProblemSubmissions(problemId, true);
      const data = response.data || [];
      setSubmissionHistory(Array.isArray(data) ? data : []);
      setHistoryLoaded(true);
    } catch {
      setSubmissionHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchProblem();
      if (contestId) {
        console.log('Fetching contest with ID:', contestId);
        fetchContest(contestId);
      }
    }
  }, [user, authLoading, id, fetchProblem, router, contestId, fetchContest]);

  // Debug logging
  useEffect(() => {
    console.log('Contest state:', { contestId, contest, contestLoading });
  }, [contestId, contest, contestLoading]);

  // Track time from contest start (for ACM-ICPC scoring)
  useEffect(() => {
    if (!contest || !contestId) return;

    const updateContestElapsedTime = () => {
      const now = Date.now();
      const contestStart = new Date(contest.startTime).getTime();
      const contestEnd = new Date(contest.endTime).getTime();
      
      // If contest hasn't started yet
      if (now < contestStart) {
        setContestElapsedTime('00:00:00');
        setContestElapsedMinutes(0);
        return;
      }
      
      // If contest has ended
      if (now >= contestEnd) {
        const totalDuration = contestEnd - contestStart;
        const totalMinutes = Math.floor(totalDuration / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setContestElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
        setContestElapsedMinutes(totalMinutes);
        return;
      }
      
      // Contest is ongoing - calculate elapsed time from start
      const elapsed = now - contestStart;
      const totalMinutes = Math.floor(elapsed / (1000 * 60));
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
      
      setContestElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setContestElapsedMinutes(totalMinutes);
    };

    updateContestElapsedTime();
    const interval = setInterval(updateContestElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [contest, contestId]);

  // Load history when problem is available and tab switches to submissions
  useEffect(() => {
    if (activeTab === "submissions" && problem?._id && !historyLoaded) {
      loadSubmissionHistory(problem._id);
    }
  }, [activeTab, problem, historyLoaded, loadSubmissionHistory]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }
    try {
      setSubmitting(true);
      
      // Prepare submission data
      const submissionData: any = {
        problemId: id,
        source_code: code,
        language_id: parseInt(language, 10),
      };
      
      // Add contestId if in contest mode
      if (contestId) {
        submissionData.contestId = contestId;
      }
      
      const response = await submissionAPI.submitSolution(
        submissionData.problemId,
        submissionData.source_code,
        submissionData.language_id,
        submissionData.contestId
      );
      const data = response.data || response;
      setSubmission(data);
      
      if (contestId) {
        toast.success("Submission received! Check contest leaderboard for your rank");
      } else {
        toast.success("Submission received! Evaluating…");
      }
      
      startPolling(data._id, id);
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const startPolling = (submissionId: string, problemId: string) => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await submissionAPI.getSubmission(submissionId);
        const data = response.data || response;
        setSubmission(data);
        if (data.status !== "Pending") {
          clearInterval(interval);
          setPolling(false);
          if (data.status === "Accepted")
            toast.success("✅ Accepted! All test cases passed!");
          else if (data.status === "Wrong Answer")
            toast.error("❌ Wrong Answer");
          else if (data.status === "Runtime Error")
            toast.error("⚠️ Runtime Error");
          // Refresh submission history and switch to tab
          setHistoryLoaded(false);
          loadSubmissionHistory(problemId);
          setActiveTab("submissions");
        }
      } catch {
        clearInterval(interval);
        setPolling(false);
      }
    }, 1500);
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 30000);
  };

  const copyToClipboard = (text: string, type: "input" | "output", idx = 0) => {
    navigator.clipboard.writeText(text);
    if (type === "input") {
      setCopiedInput(idx);
      setTimeout(() => setCopiedInput(null), 1500);
    } else {
      setCopiedOutput(idx);
      setTimeout(() => setCopiedOutput(null), 1500);
    }
  };

  // Build example list: prefer problem.examples[], then fall back to problem.sample
  const examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }> = problem?.examples?.length
    ? problem.examples
    : problem?.sample
      ? [problem.sample]
      : [];

  // Tag color palette (deterministic per tag string)
  const TAG_COLORS = [
    "bg-sky-500/10 text-sky-500 border-sky-500/20",
    "bg-violet-500/10 text-violet-500 border-violet-500/20",
    "bg-teal-500/10 text-teal-500 border-teal-500/20",
    "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
    "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  ];
  const getTagColor = (tag: string) => {
    let h = 0;
    for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
    return TAG_COLORS[Math.abs(h) % TAG_COLORS.length];
  };

  const difficultyConfig: Record<string, { label: string; className: string }> =
    {
      easy: {
        label: "Easy",
        className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      },
      medium: {
        label: "Medium",
        className: "text-amber-500  bg-amber-500/10  border-amber-500/20",
      },
      hard: {
        label: "Hard",
        className: "text-rose-500   bg-rose-500/10   border-rose-500/20",
      },
    };
  const diffKey = problem?.difficulty?.toLowerCase() ?? "";
  const diff = difficultyConfig[diffKey] ?? {
    label: problem?.difficulty,
    className: "text-muted-foreground bg-muted border-border",
  };

  const acceptanceRate =
    (problem?.totalSubmissions ?? 0) > 0
      ? Math.round(
          ((problem?.acceptedSubmissions ?? 0) / (problem?.totalSubmissions ?? 1)) * 100,
        )
      : null;

  const statusConfig: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    Accepted: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      border: "border-emerald-500/30",
    },
    "Wrong Answer": {
      bg: "bg-rose-500/10",
      text: "text-rose-500",
      border: "border-rose-500/30",
    },
    "Runtime Error": {
      bg: "bg-orange-500/10",
      text: "text-orange-500",
      border: "border-orange-500/30",
    },
    Pending: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/30",
    },
  };
  const sConf = statusConfig[submission?.status ?? ""] ?? {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  };

  /* ─── Loading / Not Found ─── */
  if (authLoading || loading)
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-mono">
            Loading problem…
          </p>
        </div>
      </div>
    );

  if (!problem)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg font-semibold">Problem not found</p>
        <Button variant="outline" onClick={() => router.push("/problems")}>
          Back to Problems
        </Button>
      </div>
    );

  /* ─── Main Layout ─── */
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Top Nav Bar ── */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border/60 bg-background/95 backdrop-blur-sm shrink-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2"
          onClick={() => router.push(contestId ? `/contests/${contestId}` : "/problems")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {contestId ? "Back to Contest" : "Problem List"}
          </span>
        </Button>

        <div className="w-px h-4 bg-border/70" />

        {/* Problem title + badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold truncate">
            {problem.title}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${diff.className}`}
          >
            {diff.label}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {acceptanceRate !== null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart2 className="h-3.5 w-3.5" />
              <span>{acceptanceRate}% accepted</span>
            </div>
          )}
          {problem.time_limit_ms && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{problem.time_limit_ms / 1000}s</span>
            </div>
          )}
        </div>
      </header>

      {/* Contest Mode Banner */}
      {contestId && contest && (
        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-purple-500/50 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-purple-300" />
                <div>
                  <div className="text-xs text-purple-400 uppercase tracking-wide font-semibold">Contest Mode</div>
                  <div className="text-base font-bold text-white">
                    {contest.title}
                  </div>
                </div>
              </div>
              <div className="h-10 w-px bg-purple-500/40"></div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-300" />
                <div>
                  <div className="text-xs text-purple-400 uppercase tracking-wide font-medium">Contest Remaining</div>
                  <ContestTimer
                    startTime={contest.startTime}
                    endTime={contest.endTime}
                    status={contest.status}
                    variant="compact"
                  />
                </div>
              </div>
              <div className="h-10 w-px bg-purple-500/40"></div>
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-xs text-green-400 uppercase tracking-wide font-medium">Your Time</div>
                  <div className="font-mono text-base font-bold text-green-300">
                    {contestElapsedTime} ({contestElapsedMinutes} min)
                  </div>
                </div>
              </div>
              {contest.penaltyPerWrongAttempt && (
                <>
                  <div className="h-10 w-px bg-purple-500/40"></div>
                  <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
                    <ShieldAlert className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="text-xs text-orange-400 font-medium">Penalty</div>
                      <div className="text-xs text-orange-300 font-bold">
                        +{contest.penaltyPerWrongAttempt} min per wrong attempt
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-300 hover:text-white hover:bg-purple-500/20 h-9 px-4 font-semibold"
              onClick={() => router.push(`/contests/${contestId}`)}
            >
              View Leaderboard
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Contest Loading State */}
      {contestId && !contest && contestLoading && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30 px-6 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-sm text-purple-300">Loading contest details...</span>
          </div>
        </div>
      )}

      {/* ── Split Panel ── */}
      <div className="flex flex-1 min-h-0">
        {/* ──── LEFT PANEL: Problem Info ──── */}
        <div className="w-[46%] min-w-85 flex flex-col border-r border-border/60 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Tab strip */}
            <div className="border-b border-border/60 bg-background/50 px-4 shrink-0">
              <TabsList className="h-10 bg-transparent gap-0 p-0 rounded-none">
                {[
                  { value: "description", label: "Description" },
                  { value: "submissions", label: "Submissions" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="relative h-10 px-4 text-xs font-medium rounded-none bg-transparent
                      text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none
                      data-[state=active]:after:absolute data-[state=active]:after:bottom-0
                      data-[state=active]:after:left-0 data-[state=active]:after:right-0
                      data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary
                      data-[state=active]:after:rounded-t data-[state=active]:after:content-['']"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Description tab */}
            <TabsContent
              value="description"
              className="flex-1 overflow-y-auto mt-0 p-0"
            >
              <div className="px-6 py-5 space-y-7">
                {/* ── Title row with difficulty + tags ── */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    <h2 className="text-lg font-bold leading-snug text-foreground flex-1 min-w-0">
                      {problem.title}
                    </h2>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${diff.className}`}
                    >
                      {diff.label}
                    </span>
                  </div>

                  {/* Tags */}
                  {(problem.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium cursor-default transition-colors ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BarChart2 className="h-3.5 w-3.5" />
                      {problem.totalSubmissions ?? 0} submissions
                    </span>
                    <span className="text-border">·</span>
                    <span className="text-emerald-500 font-medium">
                      {problem.acceptedSubmissions ?? 0} accepted
                    </span>
                    {acceptanceRate !== null && (
                      <>
                        <span className="text-border">·</span>
                        <span>{acceptanceRate}% rate</span>
                      </>
                    )}
                    {problem.time_limit_ms && (
                      <>
                        <span className="text-border">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {problem.time_limit_ms / 1000}s
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Problem Statement ── */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Problem
                    </h3>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none
                      prose-p:text-foreground/90 prose-p:leading-[1.75] prose-p:my-3
                      prose-headings:text-foreground prose-headings:font-semibold
                      prose-h3:text-[14px] prose-h3:mt-5 prose-h3:mb-2
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-em:text-foreground/80
                      prose-ul:my-2 prose-ul:pl-5 prose-ol:my-2 prose-ol:pl-5
                      prose-li:text-foreground/90 prose-li:leading-relaxed prose-li:my-1
                      prose-li:marker:text-primary
                      prose-blockquote:border-l-2 prose-blockquote:border-primary/40
                      prose-blockquote:text-muted-foreground prose-blockquote:italic
                      prose-blockquote:pl-4 prose-blockquote:my-3
                      prose-pre:bg-[#1e1e2e] prose-pre:border prose-pre:border-border/60
                      prose-pre:rounded-lg prose-pre:text-[12.5px] prose-pre:leading-relaxed
                      prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5
                      prose-code:rounded prose-code:text-[12px] prose-code:font-mono
                      prose-code:text-primary/90 prose-code:font-medium
                      prose-code:before:content-none prose-code:after:content-none
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-hr:border-border/40"
                  >
                    {problem.description ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {problem.description}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic text-sm">
                        No description available.
                      </p>
                    )}
                  </div>
                </section>

                {/* ── Constraints (above examples) ── */}
                {problem.constraints && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Constraints
                      </h3>
                    </div>
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5 space-y-0">
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none
                          [&_p]:my-0.5 [&_p]:text-[13px] [&_p]:text-foreground/85 [&_p]:leading-relaxed
                          [&_ul]:my-1 [&_ul]:pl-4 [&_ul]:list-none [&_ul]:space-y-1
                          [&_ol]:my-1 [&_ol]:pl-4 [&_ol]:space-y-1
                          [&_li]:text-[13px] [&_li]:text-foreground/85 [&_li]:leading-relaxed
                          [&_li]:before:content-['·'] [&_li]:before:text-amber-500
                          [&_li]:before:font-bold [&_li]:before:mr-2
                          [&_code]:bg-amber-500/10 [&_code]:text-amber-600
                          dark:[&_code]:text-amber-400 [&_code]:px-1.5 [&_code]:py-0.5
                          [&_code]:rounded [&_code]:text-[12px] [&_code]:font-mono [&_code]:font-medium
                          [&_code]:before:content-none [&_code]:after:content-none
                          [&_strong]:text-foreground [&_strong]:font-semibold"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {problem.constraints}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </section>
                )}

                {/* ── Examples / Test Cases ── */}
                {examples.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-3.5 w-3.5 text-primary shrink-0" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Examples
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-border/60 overflow-hidden bg-card"
                        >
                          {/* Example header */}
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border/50">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              Example {idx + 1}
                            </span>
                          </div>

                          <div className="divide-y divide-border/40">
                            {/* Input block */}
                            <div className="group">
                              <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  Input
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(ex.input, "input", idx)
                                  }
                                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  {copiedInput === idx ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-500" />
                                      <span className="text-emerald-500">
                                        Copied
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="px-4 py-3 text-[13px] font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed bg-[#0d1117] dark:bg-[#0d1117] overflow-x-auto">
                                <code>{ex.input || "(empty)"}</code>
                              </pre>
                            </div>

                            {/* Output block */}
                            <div className="group">
                              <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  Output
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(ex.output, "output", idx)
                                  }
                                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  {copiedOutput === idx ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-500" />
                                      <span className="text-emerald-500">
                                        Copied
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="px-4 py-3 text-[13px] font-mono text-emerald-400 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed bg-[#0d1117] dark:bg-[#0d1117] overflow-x-auto">
                                <code>{ex.output || "(empty)"}</code>
                              </pre>
                            </div>

                            {/* Explanation (if present) */}
                            {ex.explanation && (
                              <div className="px-4 py-3 bg-muted/10">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                                  Explanation
                                </p>
                                <p className="text-[13px] text-foreground/80 leading-relaxed">
                                  {ex.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* bottom pad */}
                <div className="h-4" />
              </div>
            </TabsContent>

            {/* Submissions tab */}
            <TabsContent
              value="submissions"
              className="flex-1 overflow-y-auto mt-0 p-0"
            >
              {historyLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : submissionHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-16">
                  <History className="h-9 w-9 opacity-20" />
                  <p className="text-sm font-medium">No submissions yet</p>
                  <p className="text-xs opacity-60">Submit your solution to see results here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {submissionHistory.map((sub) => {
                    const sc =
                      statusConfig[sub.status] ??
                      { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
                    const langName = langIdToName[sub.language] ?? `Lang ${sub.language}`;
                    const isAcc = sub.status === "Accepted";
                    const pct = sub.totalTestCases > 0
                      ? Math.round((sub.testCasesPassed / sub.totalTestCases) * 100)
                      : 0;
                    return (
                      <div key={sub._id} className="px-4 py-3.5 hover:bg-muted/15 transition-colors">
                        {/* Top row: status + counts + lang + time */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5
                              rounded-full text-[11px] font-semibold border
                              ${sc.bg} ${sc.text} ${sc.border}`}
                          >
                            {isAcc ? (
                              <Trophy className="h-3 w-3" />
                            ) : sub.status === "Pending" ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {sub.status}
                          </span>

                          <span
                            className={`text-xs font-mono font-semibold ${
                              isAcc ? "text-emerald-500" : "text-muted-foreground"
                            }`}
                          >
                            {sub.testCasesPassed}/{sub.totalTestCases} cases
                          </span>

                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40 font-mono">
                              {langName}
                            </span>
                            <span className="text-[11px] text-muted-foreground/70 shrink-0">
                              {timeAgo(sub.submittedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2.5 h-1 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAcc ? "bg-emerald-500" : pct > 0 ? "bg-rose-500/70" : "bg-muted-foreground/30"
                            }`}
                            style={{ width: `${isAcc ? 100 : pct}%` }}
                          />
                        </div>

                        {/* Test case dot grid */}
                        {sub.totalTestCases > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.from({ length: sub.totalTestCases }).map((_, i) => {
                              const dotPassed = isAcc || i < sub.testCasesPassed;
                              const dotFailed = !isAcc && i === sub.testCasesPassed;
                              return (
                                <div
                                  key={i}
                                  title={`Case ${i + 1}: ${
                                    dotPassed ? "Passed" : dotFailed ? "Failed" : "Not evaluated"
                                  }`}
                                  className={`h-5 w-5 rounded text-[9px] font-bold flex items-center justify-center
                                    ${
                                      dotPassed
                                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                        : dotFailed
                                        ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                                        : "bg-muted/60 text-muted-foreground/50 border border-border/30"
                                    }`}
                                >
                                  {i + 1}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Error snippet */}
                        {sub.error && (
                          <div className="mt-2 flex items-start gap-1.5">
                            <Terminal className="h-3 w-3 text-orange-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] font-mono text-orange-400/80 leading-relaxed line-clamp-2">
                              {sub.error}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ──── RIGHT PANEL: Editor ──── */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 h-11 border-b border-border/60 bg-background/80 shrink-0 gap-3">
            {/* Language selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                  const langConfig = languages.find((l) => l.id === newLang);
                  if (langConfig) setCode(langConfig.starter);
                }}
                className="appearance-none h-7 pl-3 pr-7 text-xs font-medium rounded-md border border-border/60
                  bg-muted/50 text-foreground cursor-pointer hover:bg-muted transition-colors
                  focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>

            {/* Contest timer in editor toolbar */}
            {contestId && (
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30">
                <Timer className="h-3.5 w-3.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wide text-green-500 font-semibold">Submission Time</span>
                  <span>{contestElapsedTime}</span>
                </div>
              </div>
            )}

            {/* Time limit pill */}
            {problem.time_limit_ms && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border/40">
                <Clock className="h-3 w-3" />
                <span>{problem.time_limit_ms / 1000}s limit</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || polling}
              size="sm"
              className="ml-auto h-8 px-4 text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700
                text-white border-0 shadow-md hover:shadow-emerald-900/20 transition-all"
            >
              {submitting || polling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {polling ? "Evaluating…" : "Submitting…"}
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Submit
                </>
              )}
            </Button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Editor
              height="100%"
              language={getCurrentLanguage().monaco}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13.5,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 14, bottom: 14 },
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                renderLineHighlight: "gutter",
                bracketPairColorization: { enabled: true },
                lineDecorationsWidth: 6,
                lineNumbersMinChars: 3,
                glyphMargin: false,
                folding: true,
                wordWrap: "on",
              }}
            />
          </div>

          {/* ── Submission Result Panel ── */}
          {submission && (
            <div
              className={`shrink-0 border-t border-border/60 ${sConf.bg} transition-all`}
            >
              {/* Result header */}
              <div
                className={`flex items-center gap-3 px-5 py-3 border-b ${sConf.border}`}
              >
                {submission.status === "Accepted" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : submission.status === "Pending" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                )}
                <span className={`text-sm font-bold ${sConf.text}`}>
                  {submission.status}
                </span>

                {submission.status !== "Pending" && (
                  <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">
                      {submission.testCasesPassed}/{submission.totalTestCases}{" "}
                      test cases
                    </span>
                    {submission.executionTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {submission.executionTime}ms
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Test results grid */}
              {submission.status !== "Pending" && (
                <div className="px-5 py-3 max-h-44 overflow-y-auto space-y-2">
                {/* Test cases: show all judge test dots */}
                {(submission.totalTestCases ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Array.from({ length: submission.totalTestCases! }).map((_, i) => {
                      const isAccepted = submission.status === "Accepted";
                      const dotPassed = isAccepted || i < (submission.testCasesPassed ?? 0);
                      const dotFailed =
                        !isAccepted && i === (submission.testCasesPassed ?? 0);
                      return (
                        <div
                          key={i}
                          title={`Case ${i + 1}: ${
                            dotPassed
                              ? "Passed"
                              : dotFailed
                              ? "Failed"
                              : "Not evaluated"
                          }`}
                          className={`h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold
                            ${
                              dotPassed
                                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                : dotFailed
                                ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                                : "bg-muted/60 text-muted-foreground/40 border border-border/40"
                            }`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                )}

                  {/* Failed cases detail */}
                  {submission.testResults
                    ?.filter((r: TestResult) => !r.passed)
                    .map((r: TestResult, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 space-y-1.5 text-[12px] font-mono"
                      >
                        <p className="text-rose-400 font-semibold text-[11px]">
                          Failed Case
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-muted-foreground text-[10px] mb-0.5">
                              Input
                            </p>
                            <p className="text-foreground/80">{r.input}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] mb-0.5">
                              Expected
                            </p>
                            <p className="text-emerald-400">{r.expected}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] mb-0.5">
                              Got
                            </p>
                            <p className="text-rose-400">{r.actual}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Error output */}
                  {submission.error && (
                    <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                      <p className="text-[11px] text-orange-400 font-semibold mb-1">
                        Error Output
                      </p>
                      <pre className="text-[12px] font-mono text-foreground/80 whitespace-pre-wrap">
                        {submission.error}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
