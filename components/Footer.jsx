export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-surface-container-lowest">

      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-8 px-6 py-12 md:flex-row">

        <div className="flex items-center gap-2 text-[24px] font-bold text-primary">
          <span className="material-symbols-outlined">
            terminal
          </span>

          Codespirit
        </div>

        <div className="flex flex-wrap justify-center gap-6">

          {[
            "Terms",
            "Privacy",
            "API",
            "Contact",
            "Support",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="text-body-md text-on-surface-variant transition-opacity hover:text-primary hover:opacity-80"
            >
              {item}
            </a>
          ))}

        </div>

        <div className="font-label-sm text-on-surface-variant">
          © 2026 CodeSpirit. Forged in the Digital Void.
        </div>

      </div>

    </footer>
  );
}