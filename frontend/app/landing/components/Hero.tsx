"use client"

import { ArrowRight, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

type Language = "cpp" | "java" | "python";

const codeTemplates: Record<Language, { lines: string[]; lineCount: number }> = {
  cpp: {
    lineCount: 10,
    lines: [
      '<span class="text-purple-400">template</span> &lt;<span class="text-purple-400">typename</span> T&gt;',
      '<span class="text-purple-400">class</span> <span class="text-yellow-400">ArenaCore</span> {',
      '&nbsp;&nbsp;<span class="text-purple-400">public</span>:',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">auto</span> <span class="text-blue-400">solve</span>(T&amp; data) {',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-600">// Compute optimal path</span>',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">if</span> (data.<span class="text-blue-400">isReady</span>()) {',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">return</span> <span class="text-blue-400">process</span>(data);',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}',
      '&nbsp;&nbsp;&nbsp;&nbsp;}',
      '};',
    ],
  },
  java: {
    lineCount: 10,
    lines: [
      '<span class="text-purple-400">public class</span> <span class="text-yellow-400">ArenaCore</span>&lt;T&gt; {',
      '&nbsp;&nbsp;<span class="text-purple-400">public</span> T <span class="text-blue-400">solve</span>(T data) {',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-600">// Compute optimal path</span>',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">if</span> (data.<span class="text-blue-400">isReady</span>()) {',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">return</span> <span class="text-blue-400">process</span>(data);',
      '&nbsp;&nbsp;&nbsp;&nbsp;}',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">return null</span>;',
      '&nbsp;&nbsp;}',
      '',
      '}',
    ],
  },
  python: {
    lineCount: 10,
    lines: [
      '<span class="text-purple-400">class</span> <span class="text-yellow-400">ArenaCore</span>:',
      '&nbsp;&nbsp;<span class="text-purple-400">def</span> <span class="text-blue-400">__init__</span>(<span class="text-purple-400">self</span>):',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">pass</span>',
      '',
      '&nbsp;&nbsp;<span class="text-purple-400">def</span> <span class="text-blue-400">solve</span>(<span class="text-purple-400">self</span>, data):',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-600"># Compute optimal path</span>',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">if</span> data.<span class="text-blue-400">is_ready</span>():',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">return</span> <span class="text-purple-400">self</span>.<span class="text-blue-400">process</span>(data)',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">return</span> <span class="text-purple-400">None</span>',
      '',
    ],
  },
};

export default function Hero() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("cpp");
  const currentTemplate = codeTemplates[selectedLanguage];

  return (
    <section className="relative w-full max-w-360 mx-auto px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
      {/* Live Activity Card - Floating */}
      <div className="fixed top-24 right-8 z-50 backdrop-blur-3xl bg-card/90 ring-1 ring-primary/10 border border-primary/10 rounded-2xl p-5 shadow-2xl shadow-primary/20 hidden lg:flex flex-col gap-4 max-w-60 transform transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Live Activity
            </span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shadow-lg shadow-destructive/50"></span>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="text-foreground font-bold text-sm">Weekly Open Cup</div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span>Ends in 2h 34m</span>
          </div>
        </div>
        
        <div className="flex -space-x-2.5 overflow-hidden">
          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-card bg-linear-to-br from-primary/40 to-primary/20 backdrop-blur-sm"></div>
          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-card bg-linear-to-br from-chart-2/40 to-chart-2/20 backdrop-blur-sm"></div>
          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-card bg-linear-to-br from-chart-3/40 to-chart-3/20 backdrop-blur-sm"></div>
          <div className="h-8 w-8 rounded-full ring-2 ring-card bg-linear-to-br from-accent to-accent/50 flex items-center justify-center text-[9px] font-black text-accent-foreground backdrop-blur-sm">
            +1.2k
          </div>
        </div>
        
        <div className="pt-2 border-t border-border/50 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">Active coders</span>
          <span className="text-[11px] text-primary font-bold">1,247 online</span>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-150 h-150 bg-primary/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-chart-1/5 rounded-full blur-[140px]"></div>
      </div>

      {/* Code Watermark */}
      <div className="absolute top-20 right-0 w-1/2 h-full code-watermark text-muted-foreground/12 font-mono text-xs select-none pointer-events-none hidden lg:block leading-relaxed tracking-wide">
        <p className="mb-1">const arena = new CodeArena(&apos;global&apos;);</p>
        <p className="mb-1">arena.on(&apos;matchFound&apos;, (players) =&gt; solve());</p>
        <p className="mb-1">while(competition.active) &#123; improve(); &#125;</p>
        <p className="mb-1">export default function Arena() &#123;</p>
        <p className="mb-1">  return &lt;Competition /&gt;;</p>
        <p className="mb-1">&#125;</p>
        <p className="mb-1">import &#123; Ranking &#125; from &apos;@codearena/core&apos;;</p>
      </div>

      {/* Left Column - Content */}
      <div className="relative z-10 flex flex-col gap-8">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit shadow-lg shadow-primary/10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[11px] font-bold text-primary-foreground uppercase tracking-widest">
            Global Cup #42 is live
          </span>
        </div>

        <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95] text-white">
          Practice. <br />
          <span className="text-slate-300">Compete.</span> <br />
          <span className="bg-clip-text text-transparent bg-linear-to-br from-primary to-chart-1">
            Improve.
          </span>
        </h1>

        <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
          The high-performance arena for engineers to master algorithms,
          dominate leaderboards, and land FAANG roles.
        </p>

        <div className="flex flex-wrap gap-5 pt-4">
          <Button size="lg" variant="success" asChild>
            <Link href="/signup">
              Start Improving Today
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#" className="group text-slate-200">
              View Challenges
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Right Column - Code Editor Preview */}
      <div className="relative z-10">
        <div className="w-full bg-[#0d0d0d] rounded-2xl border border-primary/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] shadow-primary/10 overflow-hidden flex flex-col hover:border-primary/30 transition-colors duration-300">
          <div className="bg-[#1a1a1a] px-5 py-3.5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]/80"></div>
              </div>
            </div>
            <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
              <button
                onClick={() => setSelectedLanguage("cpp")}
                className={`px-4 py-1 text-xs font-bold cursor-pointer transition-all rounded-md text-white ${
                  selectedLanguage === "cpp"
                    ? "bg-primary/20 text-primary"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                C++
              </button>
              <button
                onClick={() => setSelectedLanguage("java")}
                className={`px-4 py-1 text-xs font-bold cursor-pointer transition-all rounded-md text-white ${
                  selectedLanguage === "java"
                    ? "bg-primary/20 text-primary"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Java
              </button>
              <button
                onClick={() => setSelectedLanguage("python")}
                className={`px-4 py-1 text-xs font-bold cursor-pointer transition-all rounded-md text-white ${
                  selectedLanguage === "python"
                    ? "bg-primary/20 text-primary"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Python
              </button>
            </div>
          </div>

          <div className="p-8 font-mono text-[13px] leading-relaxed">
            <div className="flex gap-6">
              <div className="text-slate-700 select-none text-right opacity-50">
                {Array.from({ length: currentTemplate.lineCount }, (_, i) => (
                  <div key={i}>{String(i + 1).padStart(2, "0")}</div>
                ))}
              </div>
              <div className="text-slate-300">
                {currentTemplate.lines.map((line, idx) => (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
