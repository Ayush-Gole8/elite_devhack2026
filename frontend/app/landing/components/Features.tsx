"use client"

import { Terminal, Zap, Brain, Users } from "lucide-react";

const features = [
  {
    icon: Terminal,
    title: "Practice Mode",
    description:
      "Adaptive learning paths that evolve with your skill level, focusing on high-impact algorithmic concepts.",
    color: "emerald",
  },
  {
    icon: Zap,
    title: "Live Contests",
    description:
      "Low-latency competitive environment featuring real-time ranking and instant performance telemetry.",
    color: "amber",
  },
  {
    icon: Brain,
    title: "Interview Prep",
    description:
      "Deeply curated question sets focused on system design and core fundamentals from top tech giants.",
    color: "emerald",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Connect with senior engineers globally. Review peer solutions and share high-performance patterns.",
    color: "amber",
  },
];

export default function Features() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-8 py-32">
      <div className="flex flex-col gap-6 mb-20">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">
          Engineered for Excellence
        </h2>
        <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
          Sophisticated tools designed for the modern developer workflow, from
          local development feel to global scale competition.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group glass-card p-8 rounded-3xl relative overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
              ></div>
              <div
                className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-${feature.color}-500 mb-8 border border-white/10 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
