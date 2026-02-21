"use client"

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Contest() {
  const [time, setTime] = useState({ hours: 2, minutes: 14, seconds: 55 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  return (
    <section className="w-full max-w-360 mx-auto px-8 py-32">
      <div className="relative glass-card bg-linear-to-br from-bg-surface-elevated to-bg-surface rounded-[40px] p-12 md:p-20 overflow-hidden text-center flex flex-col items-center">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#fff 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="relative z-10 flex flex-col items-center gap-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit">
            <Clock className="text-amber-500 w-4 h-4" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
              Ending Soon
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Weekly Global Cup #42
            </h2>
            <p className="text-slate-400 text-xl font-medium">
              Join 1,234 participants currently competing.
            </p>
          </div>

          <div className="font-mono text-6xl md:text-9xl font-extrabold text-white tracking-tighter tabular-nums opacity-90 drop-shadow-2xl">
            {formatTime(time.hours)}:{formatTime(time.minutes)}:
            {formatTime(time.seconds)}
          </div>

          <Link
            href="/contests"
            className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xl py-6 px-16 rounded-2xl transition-all shadow-2xl animate-pulse-amber active:scale-95"
          >
            Join Contest Now
          </Link>

          <p className="text-slate-500 text-sm max-w-md">
            Top 3 winners get exclusive pro membership, verified badges, and
            priority referrals to partner companies.
          </p>
        </div>
      </div>
    </section>
  );
}
