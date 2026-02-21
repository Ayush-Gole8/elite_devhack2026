"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="w-full py-32 px-8 text-center bg-bg-base relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-linear-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 relative z-10">
        <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[0.9]">
          Elevate Your Engineering IQ.
        </h2>
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed">
          Join the most elite community of algorithmic experts. No fluff, just
          hard engineering.
        </p>
        <Button size="lg" variant="success" asChild>
          <Link href="/signup">
            Create Free Account
          </Link>
        </Button>
      </div>
    </section>
  );
}
