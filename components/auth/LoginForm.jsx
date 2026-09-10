"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState("idle");
  // idle | loading | error

  const [message, setMessage] = useState("");

  // -----------------------------
  // Update form fields
  // -----------------------------
  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // -----------------------------
  // Login
  // -----------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    if (status === "loading") return;

    setMessage("");

    // Basic validation
    if (!form.email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setStatus("error");
      setMessage("Please enter your password.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      // -----------------------------
      // Login failed
      // -----------------------------
      if (!res.ok) {
        setStatus("error");

        // User hasn't verified email
        if (data.needsVerification) {
          setMessage(
            "Please verify your email first. Redirecting..."
          );

          setTimeout(() => {
            router.push(
              `/verify-otp?email=${encodeURIComponent(
                data.email || form.email
              )}`
            );
          }, 1200);

          return;
        }

        setMessage(
          data.message ||
            data.error ||
            "Invalid email or password."
        );

        return;
      }

      // -----------------------------
      // Login successful
      // -----------------------------
      setStatus("idle");
      setMessage("");

      router.push("/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setStatus("error");
      setMessage(
        "Unable to connect to the server. Please try again."
      );
    }
  }

  // -----------------------------
  // Go to register
  // -----------------------------
  function handleSignup() {
    router.push("/register");
  }

  // -----------------------------
  // Forgot password
  // -----------------------------
  function handleForgotPassword() {
    router.push("/forgot-password");
  }

  return (
    <div className="glass-card w-full rounded-xl p-8 md:p-10">

      {/* ========================================
          HEADING
      ======================================== */}

      <div className="mb-10 text-center md:text-left">

        <h2 className="mb-2 text-[32px] font-bold leading-tight text-on-surface">
          Welcome Back, Architect
        </h2>

        <p className="text-[16px] leading-[1.5] text-on-surface-variant">
          Re-enter the void and resume your progress.
        </p>

      </div>


      {/* ========================================
          LOGIN FORM
      ======================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ======================================
            EMAIL
        ====================================== */}

        <div className="space-y-2">

          <label
            htmlFor="email"
            className="block text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant"
          >
            Email Address
          </label>

          <div className="relative">

            {/* Email Icon */}

            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">

              <span className="material-symbols-outlined text-xl">
                mail
              </span>

            </div>


            {/* Email Input */}

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="architect@digitalvoid.io"
              className="cq-input w-full rounded-lg py-3 pl-10 pr-4 font-mono text-sm placeholder:text-outline-variant"
              value={form.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
              disabled={status === "loading"}
            />

          </div>

        </div>


        {/* ======================================
            PASSWORD
        ====================================== */}

        <div className="space-y-2">

          {/* Password label + forgot password */}

          <div className="flex items-center justify-between">

            <label
              htmlFor="password"
              className="block text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Password
            </label>


            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[12px] text-primary transition-colors hover:text-primary-fixed-dim"
            >
              Forgot Password?
            </button>

          </div>


          {/* Password input */}

          <div className="relative">

            {/* Password Icon */}

            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">

              <span className="material-symbols-outlined text-xl">
                key
              </span>

            </div>


            {/* Password field */}

            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="cq-input w-full rounded-lg py-3 pl-10 pr-10 font-mono text-sm placeholder:text-outline-variant"
              value={form.password}
              onChange={(e) =>
                updateField(
                  "password",
                  e.target.value
                )
              }
              disabled={status === "loading"}
            />


            {/* Show / hide password */}

            <button
              type="button"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline transition-colors hover:text-primary"
            >

              <span className="material-symbols-outlined text-xl">
                {showPassword
                  ? "visibility"
                  : "visibility_off"}
              </span>

            </button>

          </div>

        </div>


        {/* ======================================
            ERROR / STATUS MESSAGE
        ====================================== */}

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-center text-[12px] ${
              status === "error"
                ? "border border-red-500/20 bg-red-500/10 text-red-400"
                : "text-on-surface-variant"
            }`}
          >
            {message}
          </div>
        )}


        {/* ======================================
            LOGIN BUTTON
        ====================================== */}

        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-4 text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >

          {status === "loading"
            ? "Signing in..."
            : "Continue Quest"}

          {status !== "loading" && (
            <span className="material-symbols-outlined">
              arrow_forward
            </span>
          )}

        </button>

      </form>


      {/* ========================================
          DIVIDER
      ======================================== */}

      <div className="my-8 flex items-center justify-center">

        <div className="flex-grow border-t border-white/5" />

        <span className="px-4 text-[12px] font-semibold uppercase tracking-wider text-outline-variant">
          Or
        </span>

        <div className="flex-grow border-t border-white/5" />

      </div>


      {/* ========================================
          SOCIAL LOGIN
      ======================================== */}

      <div className="grid grid-cols-2 gap-4">

        {/* GitHub */}

        <button
          type="button"
          onClick={() => {
            console.log("GitHub login clicked");
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-surface-container-low px-4 py-3 text-sm text-on-surface transition-all hover:border-primary/50 hover:bg-surface-container"
        >

          <span className="material-symbols-outlined text-lg">
            code
          </span>

          GitHub

        </button>


        {/* Google */}

        <button
          type="button"
          onClick={() => {
            console.log("Google login clicked");
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-surface-container-low px-4 py-3 text-sm text-on-surface transition-all hover:border-primary/50 hover:bg-surface-container"
        >

          <span className="material-symbols-outlined text-lg">
            mail
          </span>

          Google

        </button>

      </div>


      {/* ========================================
          SIGN UP
      ======================================== */}

      <div className="mt-8 text-center">

        <p className="text-[16px] text-on-surface-variant">

          New to the realm?{" "}

          <button
            type="button"
            onClick={handleSignup}
            className="font-semibold text-primary underline-offset-4 glow-text hover:underline"
          >
            Sign Up
          </button>

        </p>

      </div>

    </div>
  );
}