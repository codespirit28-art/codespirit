import DashboardPreview from "./DashboardPreview";

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-container-max px-6 py-12 md:py-20">

      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] opacity-50" />

      <div className="grid items-center gap-12 md:grid-cols-2">

        {/* Left */}
        <div className="z-10 space-y-8">

          <h1 className="text-[48px] font-extrabold leading-tight tracking-tight text-white md:text-[64px]">
            Learn Coding.
            <br />

            <span className="text-gradient">
              Solve Problems.
            </span>

            <br />

            Earn Rewards.
          </h1>

          <p className="max-w-lg text-body-lg text-on-surface-variant">
            Master data structures, algorithms, and languages.
            Earn coins for every problem solved and unlock premium
            learning resources. Level up your developer journey today.
          </p>

          <div className="flex flex-wrap items-center gap-4">

            <button className="rounded-lg bg-primary-container px-8 py-4 font-label-sm text-white transition-all hover:scale-105 hover:bg-primary-container/90 active:scale-95">
              Start Learning Free
            </button>

            <button className="rounded-lg border border-primary-container px-8 py-4 font-label-sm text-primary transition-all hover:bg-primary-container/10 active:scale-95">
              Explore Problems
            </button>

          </div>

        </div>

        {/* Right */}
        <DashboardPreview />

      </div>

    </section>
  );
}