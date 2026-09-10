"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------
  // Handle input
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // -----------------------------
  // Signup
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    // Basic validation
    if (!form.username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter a password.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Unable to create your account."
        );

        return;
      }

      setSuccess(
        "Account created! Check your email for the verification code."
      );

      // Go to OTP verification
      setTimeout(() => {
        router.push(
          `/verify-otp?email=${encodeURIComponent(
            form.email.trim().toLowerCase()
          )}`
        );
      }, 1000);
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 md:p-7">

      {/* ========================================
          FORM
      ======================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {/* ======================================
            USERNAME
        ====================================== */}

        <div>

          <label
            htmlFor="username"
            className="mb-2 block font-mono text-[12px] font-semibold tracking-wide text-[#c5bfd0]"
          >
            Username
          </label>

          <div className="relative">

            <span
              className="
                material-symbols-outlined
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[19px]
                text-[#9993a5]
              "
            >
              person
            </span>

            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="Terminal_Hero"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              className="
                cq-input
                w-full
                rounded-lg
                py-3
                pl-10
                pr-4
                font-mono
                text-sm
                disabled:opacity-60
              "
            />

          </div>

        </div>


        {/* ======================================
            EMAIL
        ====================================== */}

        <div>

          <label
            htmlFor="email"
            className="mb-2 block font-mono text-[12px] font-semibold tracking-wide text-[#c5bfd0]"
          >
            Email Address
          </label>

          <div className="relative">

            <span
              className="
                material-symbols-outlined
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[19px]
                text-[#9993a5]
              "
            >
              mail
            </span>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="hero@void.net"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className="
                cq-input
                w-full
                rounded-lg
                py-3
                pl-10
                pr-4
                font-mono
                text-sm
                disabled:opacity-60
              "
            />

          </div>

        </div>


        {/* ======================================
            PASSWORD
        ====================================== */}

        <div>

          <label
            htmlFor="password"
            className="mb-2 block font-mono text-[12px] font-semibold tracking-wide text-[#c5bfd0]"
          >
            Password
          </label>

          <div className="relative">

            <span
              className="
                material-symbols-outlined
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[19px]
                text-[#9993a5]
              "
            >
              lock
            </span>

            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              className="
                cq-input
                w-full
                rounded-lg
                py-3
                pl-10
                pr-10
                font-mono
                text-sm
                disabled:opacity-60
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              disabled={loading}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[#9993a5]
                transition
                hover:text-[#d2bbff]
                disabled:opacity-50
              "
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              <span className="material-symbols-outlined text-[19px]">
                {showPassword
                  ? "visibility"
                  : "visibility_off"}
              </span>
            </button>

          </div>

        </div>


        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div
            className="
              rounded-lg
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-center
              font-mono
              text-[12px]
              text-red-400
            "
          >
            {error}
          </div>
        )}


        {/* ======================================
            SUCCESS
        ====================================== */}

        {success && (
          <div
            className="
              rounded-lg
              border
              border-green-500/20
              bg-green-500/10
              px-4
              py-3
              text-center
              font-mono
              text-[12px]
              text-green-400
            "
          >
            {success}
          </div>
        )}


        {/* ======================================
            SUBMIT
        ====================================== */}

        <button
          type="submit"
          disabled={loading}
          className="
            btn-primary
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            py-3.5
            font-mono
            text-[13px]
            font-bold
            tracking-wide
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >

          {loading
            ? "Creating Account..."
            : "Start Your Journey"}

          {!loading && (
            <span className="material-symbols-outlined text-[19px]">
              arrow_forward
            </span>
          )}

        </button>

      </form>


      {/* ========================================
          DIVIDER
      ======================================== */}

      <div className="my-7 flex items-center gap-4">

        <div className="h-px flex-1 bg-white/10" />

        <span className="font-mono text-[11px] font-semibold text-[#9993a5]">
          OR
        </span>

        <div className="h-px flex-1 bg-white/10" />

      </div>


      {/* ========================================
          GITHUB
      ======================================== */}

      <button
        type="button"
        onClick={() => {
          console.log("GitHub signup clicked");
        }}
        className="
          mb-4
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-lg
          border
          border-white/15
          bg-transparent
          py-3
          font-mono
          text-[13px]
          font-semibold
          text-[#dae2fd]
          transition
          hover:border-purple-500/60
          hover:bg-white/5
        "
      >

        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-current"
        >
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.16c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.08.78 2.18v3.24c0 .3.21.66.79.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>

        Continue with GitHub

      </button>


      {/* ========================================
          GOOGLE
      ======================================== */}

      <button
        type="button"
        onClick={() => {
          console.log("Google signup clicked");
        }}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-lg
          border
          border-white/15
          bg-transparent
          py-3
          font-mono
          text-[13px]
          font-semibold
          text-[#dae2fd]
          transition
          hover:border-purple-500/60
          hover:bg-white/5
        "
      >

        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
        >

          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"
          />

          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
          />

          <path
            fill="#FBBC05"
            d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29V6.62H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4-3.09Z"
          />

          <path
            fill="#EA4335"
            d="M12 4.76c1.76 0 3.34.61 4.59 1.81l3.44-3.44C17.95 1.1 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4 3.09C5.77 6.87 8.88 4.76 12 4.76Z"
          />

        </svg>

        Continue with Google

      </button>


      {/* ========================================
          LOGIN
      ======================================== */}

      <div className="mt-7 text-center">

        <p className="font-mono text-[12px] text-[#9993a5]">

          Already have an account?{" "}

          <Link
            href="/login"
            className="
              font-semibold
              text-[#d2bbff]
              transition
              hover:text-white
            "
          >
            Log in
          </Link>

        </p>

      </div>

    </div>
  );
}