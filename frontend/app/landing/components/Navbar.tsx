"use client"

import { Terminal } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full glass-nav">
      <div className="max-w-[1440px] mx-auto px-8 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-900 flex items-center justify-center text-white shadow-inner">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="text-white text-xl font-extrabold tracking-tight">
            CodeArena
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <Link
            href="#"
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Explore
          </Link>
          <Link
            href="#"
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Contests
          </Link>
          <Link
            href="#"
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Developer
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="#"
            className="hidden sm:block text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Login
          </Link>
          <button className="btn-emerald text-sm font-bold py-2.5 px-6 rounded-full">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
