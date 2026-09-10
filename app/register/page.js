import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="absolute -bottom-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-[404px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-[46px] font-extrabold tracking-[-2px] text-[#d2bbff] glow-text">
            CodeSpirit
          </h1>

          <p className="mt-1 text-[16px] text-[#c5bfd0]">
            Join the Quest
          </p>
        </div>

        <SignupForm />

      </div>

    </main>
  );
}