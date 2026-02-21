"use client"

import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
      {/* Live Activity Card - Floating */}
      <div className="fixed top-24 right-8 z-50 glass-card rounded-2xl p-5 shadow-2xl flex flex-col gap-3 max-w-[220px] hidden lg:flex">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Live Activity
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        </div>
        <div className="text-white font-bold text-sm">Weekly Open Cup</div>
        <div className="flex -space-x-2.5 overflow-hidden">
          <div className="inline-block h-7 w-7 rounded-full ring-2 ring-bg-surface bg-emerald-500/20"></div>
          <div className="inline-block h-7 w-7 rounded-full ring-2 ring-bg-surface bg-blue-500/20"></div>
          <div className="inline-block h-7 w-7 rounded-full ring-2 ring-bg-surface bg-purple-500/20"></div>
          <div className="h-7 w-7 rounded-full ring-2 ring-bg-surface bg-bg-surface-elevated flex items-center justify-center text-[9px] font-black text-white">
            +1.2k
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium leading-none">
          coding right now
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px]"></div>
      </div>

      {/* Code Watermark */}
      <div className="absolute top-20 right-0 w-1/2 h-full code-watermark opacity-[0.03] font-mono text-xs select-none pointer-events-none hidden lg:block leading-relaxed">
        <p>const arena = new CodeArena(&apos;global&apos;);</p>
        <p>arena.on(&apos;matchFound&apos;, (players) =&gt; solve());</p>
        <p>while(competition.active) &#123; improve(); &#125;</p>
        <p>export default function Arena() &#123;</p>
        <p>  return &lt;Competition /&gt;;</p>
        <p>&#125;</p>
        <p>import &#123; Ranking &#125; from &apos;@codearena/core&apos;;</p>
      </div>

      {/* Left Column - Content */}
      <div className="relative z-10 flex flex-col gap-8">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
            Global Cup #42 is live
          </span>
        </div>

        <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95] text-white">
          Practice. <br />
          <span className="text-slate-500">Compete.</span> <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-emerald-900">
            Improve.
          </span>
        </h1>

        <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
          The high-performance arena for engineers to master algorithms,
          dominate leaderboards, and land FAANG roles.
        </p>

        <div className="flex flex-wrap gap-5 pt-4">
          <button className="btn-emerald font-bold py-4 px-10 rounded-xl text-base shadow-xl shadow-emerald-950/40">
            Start Improving Today
          </button>
          <button className="btn-secondary font-semibold py-4 px-10 rounded-xl text-base flex items-center gap-2 group">
            <span>View Challenges</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Right Column - Code Editor Preview */}
      <div className="relative z-10">
        <div className="w-full bg-[#0d0d0d] rounded-2xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col soft-glow-emerald">
          <div className="bg-[#1a1a1a] px-5 py-3.5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]/80"></div>
              </div>
            </div>
            <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
              <div className="px-4 py-1 text-xs text-white bg-emerald-500/10 rounded-md text-emerald-400 font-bold cursor-pointer">
                C++
              </div>
              <div className="px-4 py-1 text-xs text-slate-500 font-bold hover:text-white cursor-pointer transition-colors">
                Python
              </div>
              <div className="px-4 py-1 text-xs text-slate-500 font-bold hover:text-white cursor-pointer transition-colors">
                Rust
              </div>
            </div>
          </div>

          <div className="p-8 font-mono text-[13px] leading-relaxed">
            <div className="flex gap-6">
              <div className="text-slate-700 select-none text-right opacity-50">
                01<br />02<br />03<br />04<br />05<br />06<br />07<br />08<br />09<br />10
              </div>
              <div className="text-slate-300">
                <span className="text-purple-400">template</span> &lt;
                <span className="text-purple-400">typename</span> T&gt;<br />
                <span className="text-purple-400">class</span>{" "}
                <span className="text-yellow-400">ArenaCore</span> &#123;<br />
                &nbsp;&nbsp;<span className="text-purple-400">public</span>:
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-purple-400">auto</span>{" "}
                <span className="text-blue-400">solve</span>(T&amp; data) &#123;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-slate-600">
                  {`// Compute optimal path`}
                </span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-purple-400">if</span> (data.
                <span className="text-blue-400">isReady</span>()) &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-purple-400">return</span>{" "}
                <span className="text-blue-400">process</span>(data);<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                &#125;;
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
