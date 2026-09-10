export default function DashboardPreview() {
  return (
    <div className="glass-panel glow-effect group relative z-10 overflow-hidden rounded-xl p-6">

      <div className="absolute right-0 top-0 -z-10 h-32 w-32 bg-secondary-container/20 blur-[50px]" />

      {/* Profile */}
      <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-container bg-primary-container/20">
            <span className="material-symbols-outlined text-primary">
              person
            </span>
          </div>

          <div>
            <h3 className="text-[18px] font-semibold text-white">
              Alex Developer
            </h3>

            <p className="font-label-sm text-primary">
              Level 12 Architect
            </p>
          </div>

        </div>

        <div className="flex flex-col items-end">

          <span className="flex items-center gap-1 font-code-md font-bold text-secondary">
            <span className="material-symbols-outlined text-[18px]">
              monetization_on
            </span>
            1,250
          </span>

          <span className="font-label-sm text-on-surface-variant">
            Coins Earned
          </span>

        </div>

      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">

        <div className="rounded-lg border border-white/5 bg-surface-container/50 p-4">
          <span className="mb-1 block font-label-sm text-on-surface-variant">
            Problems Solved
          </span>

          <span className="text-headline-lg text-white">
            128
          </span>
        </div>

        <div className="rounded-lg border border-white/5 bg-surface-container/50 p-4">
          <span className="mb-1 block font-label-sm text-on-surface-variant">
            Current Streak
          </span>

          <span className="flex items-center gap-2 text-headline-lg text-white">
            14

            <span className="material-symbols-outlined text-orange-400">
              local_fire_department
            </span>
          </span>
        </div>

      </div>

      {/* Languages */}
      <div className="mb-6 space-y-3">

        <span className="font-label-sm text-on-surface-variant">
          Language Proficiency
        </span>

        <ProgressBar
          language="Java"
          percentage={72}
        />

        <ProgressBar
          language="Python"
          percentage={58}
        />

        <ProgressBar
          language="JS"
          percentage={45}
        />

      </div>

      {/* Challenge */}
      <div className="rounded-lg border border-primary-container/30 bg-surface-container/80 p-4">

        <div className="mb-2 flex items-center justify-between">

          <span className="font-label-sm text-primary">
            Daily Challenge
          </span>

          <span className="flex items-center gap-1 rounded bg-secondary-container/20 px-2 py-1 font-code-md text-[12px] text-secondary">
            +10 Coins
          </span>

        </div>

        <h4 className="text-[16px] font-semibold text-white">
          Two Sum
        </h4>

        <p className="mt-1 mb-3 text-sm text-on-surface-variant">
          Given an array of integers nums and an integer target...
        </p>

        <button className="w-full rounded border border-primary-container/50 bg-primary-container/20 py-2 font-label-sm text-primary transition-colors hover:bg-primary-container/40">
          Solve Now
        </button>

      </div>

    </div>
  );
}

function ProgressBar({ language, percentage }) {
  return (
    <div className="flex items-center gap-3">

      <span className="w-12 font-code-md text-white">
        {language}
      </span>

      <div className="h-2 flex-grow overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full bg-gradient-to-r from-primary-container to-secondary"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="font-code-md text-on-surface-variant">
        {percentage}%
      </span>

    </div>
  );
}