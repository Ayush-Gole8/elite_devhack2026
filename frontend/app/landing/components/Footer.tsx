"use client"

import { Terminal } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-bg-surface pt-24 pb-12">
      <div className="max-w-360 mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
          <div className="col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="text-white text-xl font-extrabold tracking-tight">
                CodeArena
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              The definitive technical platform for modern software engineers.
              Practice, compete, and master the art of problem solving.
            </p>
            <div className="flex gap-5 mt-4">
              <Link
                href="#"
                className="text-slate-500 hover:text-white transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-slate-500 hover:text-white transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold tracking-tight">Product</h4>
            <nav className="flex flex-col gap-4">
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Curriculum
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Tournaments
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Certificates
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Enterprise
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold tracking-tight">Resources</h4>
            <nav className="flex flex-col gap-4">
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                API Documentation
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Style Guide
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                OSS Contributions
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Tech Blog
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold tracking-tight">Support</h4>
            <nav className="flex flex-col gap-4">
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Help Center
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                System Status
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Security
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-medium text-slate-600">
            © 2026 CodeArena Inc. Built with obsession for quality.
          </p>
          <div className="flex gap-8">
            <Link
              href="#"
              className="text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
