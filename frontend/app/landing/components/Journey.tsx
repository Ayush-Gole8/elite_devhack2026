"use client"

import { Filter, Code2, BarChart3, Award } from "lucide-react";

const steps = [
  {
    icon: Filter,
    title: "Selection",
    description: "Pick challenges by topic or company tags.",
  },
  {
    icon: Code2,
    title: "Execution",
    description: "Solve using our low-latency IDE.",
  },
  {
    icon: BarChart3,
    title: "Validation",
    description: "Pass edge cases with real-time feedback.",
  },
  {
    icon: Award,
    title: "Rank Up",
    description: "Climb the global ELO leaderboard.",
  },
];

export default function Journey() {
  return (
    <section className="w-full bg-bg-surface border-y border-white/5 py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCA0MEw0MCAwSDIwTDAgMjBNNDAgNDBWMjBMMjAgNDAiIGZpbGw9IiMxMTEiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-5"></div>

      <div className="max-w-360 mx-auto px-8 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">
            Your Path to Mastery
          </h2>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center gap-6 group"
                >
                  <div className="w-14 h-14 rounded-full bg-bg-base border-2 border-emerald-500/50 flex items-center justify-center text-emerald-500 z-10 glass-card soft-glow-emerald group-hover:border-emerald-400 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 max-w-50 mx-auto leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
