import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 md:px-6">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-40">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-primary-container blur-[150px] opacity-20" />

        <div className="absolute -bottom-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-secondary-container blur-[120px] opacity-20" />
      </div>

      <div className="w-full max-w-[480px]">

        {/* Logo */}
        <div className="mb-8 text-center">

          <h1 className="flex items-center justify-center gap-2 text-[48px] font-extrabold tracking-tighter text-primary glow-text">

            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              terminal
            </span>

            CodeSpirit

          </h1>

        </div>

        <LoginForm />

      </div>

      {/* Footer */}
      <div className="pointer-events-none fixed bottom-0 left-0 hidden w-full p-4 text-center opacity-50 md:block">

        <p className="font-label-sm text-on-surface-variant">
          © 2024 CodeSpirit. Forged in the Digital Void.
        </p>

      </div>

    </main>
  );
}