export default function Stats() {
  return (
    <section className="w-full bg-bg-surface border-y border-white/5">
      <div className="max-w-360 mx-auto px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-black text-white tracking-tight">
              1,200+
            </span>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Problems
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-black text-white tracking-tight">
              500k+
            </span>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Submissions
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-black text-white tracking-tight">
              5,000+
            </span>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Elite Users
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-black text-white tracking-tight">
              99.9%
            </span>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Uptime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
