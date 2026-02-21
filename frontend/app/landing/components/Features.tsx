"use client"

import React from "react";
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

// Avoid dynamic Tailwind interpolation; enumerate the exact class combinations
const colorStyles: Record<string, { gradient: string; text: string; ring: string }> = {
  emerald: {
    gradient: "from-emerald-500/6 to-transparent",
    text: "text-emerald-400",
    ring: "focus-visible:ring-emerald-300/40",
  },
  amber: {
    gradient: "from-amber-500/6 to-transparent",
    text: "text-amber-400",
    ring: "focus-visible:ring-amber-300/40",
  },
};

export default function Features() {
  return (
    <section
      aria-labelledby="features-heading"
      className="w-full max-w-7xl mx-auto px-6 py-20"
    >
      <div className="flex flex-col gap-4 mb-12">
        <h2
          id="features-heading"
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tighter"
        >
          Engineered for Excellence
        </h2>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          Sophisticated tools designed for the modern developer workflow, from
          local development feel to global scale competition.
        </p>
      </div>

      <ul
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          const styles = colorStyles[feature.color] || colorStyles.emerald;

          return (
            <li key={feature.title} role="listitem">
              <article
                tabIndex={0}
                className={`group relative overflow-hidden rounded-2xl p-6 glass-card border border-white/6 transform transition-transform duration-200 will-change-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles.ring}`}
                aria-labelledby={`feature-${feature.title.replace(/\s+/g, "-").toLowerCase()}`}
                onKeyDown={(e) => {
                  // make card actionable by keyboard (Enter / Space) if required later
                  if (e.key === "Enter" || e.key === " ") {
                    e.currentTarget.click?.();
                  }
                }}
              >
                <div
                  aria-hidden
                  className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/8 ${styles.text} group-hover:scale-105 transition-transform duration-200`}
                  >
                    <Icon className="w-7 h-7" aria-hidden />
                  </div>

                  <h3
                    id={`feature-${feature.title.replace(/\s+/g, "-").toLowerCase()}`}
                    className="text-xl font-semibold text-white mb-2"
                  >
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
