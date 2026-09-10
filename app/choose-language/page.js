"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, TriangleAlert, Loader2 } from "lucide-react";

export default function ChooseLanguagePage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);

        const [userRes, subjectsRes] = await Promise.all([
          fetch("/api/user/me"),
          fetch("/api/subjects"),
        ]);

        // ---------------- USER ----------------
        const userDataResponse = await userRes.json();

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        setUserData(userDataResponse.user);

        // ---------------- SUBJECTS ----------------
        if (!subjectsRes.ok) {
          throw new Error("Failed to load subjects");
        }

        const subjectsData = await subjectsRes.json();

        setSubjects(subjectsData);
      } catch (err) {
        console.error("LOAD CHOOSE LANGUAGE ERROR:", err);
        setError(
          "Unable to load the programming languages. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [router]);

  // =========================================================
  // SELECT SUBJECT
  // =========================================================
  const handleSelect = (subject) => {
    console.log("Selected subject:", subject);

    // Store selected subject
    localStorage.setItem("primaryLanguage", subject.name);
    localStorage.setItem("primarySubjectId", subject._id);

    // Go to topics/chapters page
    router.push("/topic");
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    } finally {
      router.push("/login");
    }
  }

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071024] text-[#dce3ff]">
        <div className="flex items-center gap-2 font-mono text-sm">
          <Loader2 size={18} className="animate-spin text-violet-400" />
          Loading languages...
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#071024] text-[#dce3ff]">
        <p className="font-semibold text-red-400">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#252f52] px-4 py-2 text-sm hover:bg-[#303b63]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#071024] px-4 py-5 text-[#dce3ff] sm:px-6 lg:px-8">
      <section className="relative mx-auto min-h-[calc(100vh-40px)] max-w-[1300px] rounded-2xl bg-[#0d032e] px-5 py-12 sm:px-8 md:px-10 lg:px-12">

        {/* =====================================================
            LOGOUT
        ===================================================== */}
        <button
          onClick={handleLogout}
          className="absolute right-6 top-6 text-xs font-mono text-gray-400 transition hover:text-white"
        >
          Logout
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mx-auto max-w-[850px] text-center">
          <h1 className="text-4xl font-extrabold tracking-[-1.5px] text-[#d5b4ff] sm:text-5xl md:text-[50px]">
            Choose Your Weapon
          </h1>

          <p className="mx-auto mt-4 max-w-[760px] text-base leading-7 text-[#c3bed2] sm:text-lg">
            Welcome {userData?.name || "Developer"}! Select a primary
            programming language to begin your journey.
          </p>
        </div>

        {/* =====================================================
            SUBJECT GRID
        ===================================================== */}
        {subjects.length === 0 ? (
          <div className="mx-auto mt-16 max-w-xl rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-sm text-slate-400">
              No programming languages are available yet.
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Please check back later.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-16 grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                index={index}
                onSelect={() => handleSelect(subject)}
              />
            ))}
          </div>
        )}

        {/* =====================================================
            LATER
        ===================================================== */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="group flex items-center gap-1 font-mono text-sm font-semibold tracking-wide text-[#c5b6d8] transition hover:text-[#e0c8ff]"
          >
            I'll decide later

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   SUBJECT CARD
========================================================= */

function SubjectCard({ subject, index, onSelect }) {
  /*
   * These values are generated from the subject data.
   *
   * Your database currently has things like:
   * _id
   * name
   *
   * So we don't require difficulty/image/badge fields.
   */

  const name = subject.name || "Programming";

  // Generate a simple difficulty based on card position.
  // You can later store difficulty in MongoDB if you want.
  const difficulty = Math.min((index % 5) + 1, 5);

  return (
    <button
      onClick={onSelect}
      className="
        group relative overflow-hidden rounded-xl border border-[#252f52]
        bg-[#151e3e] p-6 text-left
        transition-all duration-300
        hover:-translate-y-1
        hover:border-[#8156bd]
        hover:bg-[#192347]
        hover:shadow-[0_15px_45px_rgba(124,58,237,0.18)]
      "
    >
      {/* =====================================================
          ICON
      ===================================================== */}
      <div className="mb-7 flex h-[80px] w-[80px] items-center justify-center">
        <div
          className="
            relative flex h-[64px] w-[64px]
            items-center justify-center
            rounded-lg bg-[#10162c]
            shadow-[0_0_25px_rgba(124,58,237,0.35)]
            transition-all duration-300
            group-hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]
          "
        >
          <span className="font-mono text-2xl font-bold text-[#cda8ff]">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* =====================================================
          TITLE
      ===================================================== */}
      <h2 className="text-3xl font-bold tracking-tight text-[#dce3ff] transition group-hover:text-[#e2caff]">
        {name}
      </h2>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}
      <p className="mt-3 min-h-[48px] max-w-[650px] text-[16px] leading-6 text-[#c1bfd0]">
        {subject.description ||
          `Start learning ${name} and build your programming skills.`}
      </p>

      {/* =====================================================
          DIFFICULTY
      ===================================================== */}
      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[12px] font-semibold tracking-wide text-[#8696c6]">
            DIFFICULTY
          </span>

          <span className="font-mono text-[12px] font-bold text-[#bfa9ff]">
            {difficulty}/5
          </span>
        </div>

        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < difficulty
                  ? "bg-[#9d72e6] shadow-[0_0_8px_rgba(157,114,230,0.5)]"
                  : "bg-[#20294d]"
              }`}
            />
          ))}
        </div>
      </div>
    </button>
  );
}