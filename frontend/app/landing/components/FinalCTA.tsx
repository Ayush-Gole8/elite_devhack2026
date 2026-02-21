export default function FinalCTA() {
  return (
    <section className="w-full py-32 px-8 text-center bg-bg-base relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 relative z-10">
        <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[0.9]">
          Elevate Your Engineering IQ.
        </h2>
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed">
          Join the most elite community of algorithmic experts. No fluff, just
          hard engineering.
        </p>
        <button className="btn-emerald font-black text-xl py-6 px-16 rounded-2xl shadow-2xl shadow-emerald-950/40 hover:-translate-y-1 transition-transform">
          Create Free Account
        </button>
      </div>
    </section>
  );
}
