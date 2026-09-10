"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOtpContent() {
const router = useRouter();
const searchParams = useSearchParams();

const email = searchParams.get("email") || "";

const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);
const [resending, setResending] = useState(false);

const inputRefs = useRef([]);

// Focus first box
useEffect(() => {
inputRefs.current[0]?.focus();
}, []);

// Handle OTP input
const handleChange = (e, index) => {
const value = e.target.value;


// Only numbers
if (!/^\d*$/.test(value)) return;

const newOtp = [...otp];

// Handle paste / multiple digits
if (value.length > 1) {
  const digits = value.slice(0, 6).split("");

  digits.forEach((digit, i) => {
    if (index + i < 6) {
      newOtp[index + i] = digit;
    }
  });

  setOtp(newOtp);

  const nextIndex = Math.min(index + digits.length, 5);
  inputRefs.current[nextIndex]?.focus();

  return;
}

newOtp[index] = value;
setOtp(newOtp);

// Move next
if (value && index < 5) {
  inputRefs.current[index + 1]?.focus();
}


};

// Keyboard handling
const handleKeyDown = (e, index) => {
if (e.key === "Backspace" && !otp[index] && index > 0) {
inputRefs.current[index - 1]?.focus();
}


if (e.key === "ArrowLeft" && index > 0) {
  inputRefs.current[index - 1]?.focus();
}

if (e.key === "ArrowRight" && index < 5) {
  inputRefs.current[index + 1]?.focus();
}


};

// Verify OTP
const handleSubmit = async (e) => {
e.preventDefault();


setError("");
setMessage("");

const otpCode = otp.join("");

if (otpCode.length !== 6) {
  setError("Please enter all 6 digits.");
  return;
}

if (!email) {
  setError("Email address is missing. Please register again.");
  return;
}

setLoading(true);

try {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      otp: otpCode,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Invalid OTP. Please try again.");

    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    return;
  }

  setMessage("Email verified successfully!");

  // Go to dashboard
  setTimeout(() => {
    router.push("/dashboard");
  }, 800);

} catch (error) {
  console.error(error);
  setError("Something went wrong. Please check your connection.");

} finally {
  setLoading(false);
}


};

// Resend OTP
const handleResend = async () => {
if (!email || resending) return;


setError("");
setMessage("");
setResending(true);

try {
  const response = await fetch("/api/auth/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Unable to resend OTP.");
    return;
  }

  setMessage("A new verification code has been sent to your email.");

  setOtp(["", "", "", "", "", ""]);
  inputRefs.current[0]?.focus();

} catch (error) {
  console.error(error);
  setError("Network error. Please try again.");

} finally {
  setResending(false);
}


};

return ( <main className="min-h-screen bg-[#020617] text-[#dae2fd] flex items-center justify-center px-4">

```
  <div className="w-full max-w-[440px]">

    {/* Logo */}
    <div className="text-center mb-8">

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#d2bbff]">
        CodeSpirit
      </h1>

      <p className="mt-2 text-[#a8aec5]">
        Join the Quest
      </p>

    </div>

    {/* Card */}
    <div
      className="
        rounded-xl
        p-7 sm:p-9
        bg-[rgba(30,41,59,0.8)]
        backdrop-blur-xl
        border border-white/5
        shadow-[0_10px_30px_-10px_rgba(124,58,237,0.3)]
      "
    >

      {/* Heading */}
      <div className="text-center mb-8">

        <h2 className="text-2xl font-bold text-[#dae2fd]">
          Verification Required
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#8c91b1]">
          We've sent a 6-digit verification code to
        </p>

        {email && (
          <p className="mt-1 text-sm font-medium text-[#cbb5ff] break-all">
            {email}
          </p>
        )}

      </div>

      <form onSubmit={handleSubmit}>

        {/* Label */}
        <label
          htmlFor="otp"
          className="
            block
            mb-3
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-[#a0a5be]
          "
        >
          Enter OTP
        </label>

        {/* OTP boxes */}
        <div className="flex justify-between gap-2 mb-6">

          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={loading}
              className="
                w-11
                h-12
                sm:w-14
                sm:h-14
                rounded-lg
                bg-[#020617]
                border
                border-white/10
                text-center
                text-xl
                sm:text-2xl
                font-bold
                text-white
                outline-none
                transition-all
                focus:border-[#7c3aed]
                focus:ring-1
                focus:ring-[#7c3aed]
                disabled:opacity-50
              "
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}

        </div>

        {/* Error */}
        {error && (
          <div
            className="
              mb-5
              rounded-lg
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-center
              text-sm
              text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div
            className="
              mb-5
              rounded-lg
              border
              border-green-500/20
              bg-green-500/10
              px-4
              py-3
              text-center
              text-sm
              text-green-400
            "
          >
            {message}
          </div>
        )}

        {/* Verify button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            rounded-lg
            bg-[#7c3aed]
            py-3.5
            text-sm
            font-bold
            text-white
            transition-all
            hover:bg-[#8b5cf6]
            hover:-translate-y-[1px]
            hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? "Verifying..." : "Verify & Proceed"}

            {!loading && (
              <span className="text-lg">
                →
              </span>
            )}
          </span>
        </button>

      </form>

      {/* Footer */}
      <div className="mt-7 text-center space-y-3">

        <p className="text-xs text-[#8c91b1]">
          Didn't receive the code?{" "}

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            className="
              font-semibold
              text-[#cbb5ff]
              hover:text-[#e5d9ff]
              transition-colors
              disabled:opacity-50
            "
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </p>

        <p className="text-xs text-[#8c91b1]">

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="
              text-[#a0a5be]
              hover:text-[#d2bbff]
              transition-colors
            "
          >
            ← Back to Sign Up
          </button>

        </p>

      </div>

    </div>

  </div>

</main>

);
}
