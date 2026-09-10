export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-container-max items-center justify-between px-6 py-4">

        <div className="flex items-center gap-2 text-[24px] font-extrabold tracking-tighter text-primary">
          <span className="material-symbols-outlined">
            terminal
          </span>

            CodeSpirit
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {[
            "Features",
            "Problems",
            "Quizzes",
            "Resources",
            "Leaderboard",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="text-label-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-label-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            Log In
          </a>

          <a
            href="/register"
            className="rounded-lg bg-primary-container px-6 py-2 text-label-sm text-white transition-all hover:bg-primary-container/90 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]"
          >
            Get Started
          </a>
        </div>

      </div>
    </nav>
  );
}