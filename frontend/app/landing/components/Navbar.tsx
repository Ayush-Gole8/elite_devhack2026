"use client"

import { Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full glass-nav">
      <div className="max-w-360 mx-auto px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-900 flex items-center justify-center text-white shadow-inner">
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
            href="/contests"
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
          <Button variant="link" className="text-white" asChild>
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button variant="success" asChild>
            <Link href="/signup">
              Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
