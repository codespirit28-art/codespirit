"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bell,
  Search,
  LayoutDashboard,
  Trophy,
  Users,
  Settings,
  Code2,
  CircleHelp,
  Globe2,
  Coins,
  Flame,
  ArrowRight,
  Star,
  FileText,
  Compass,
  ExternalLink,
  User,
  LogOut,
  Gamepad2,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          "/api/user/me",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          router.push("/login");
          return;
        }

        setUserData(data.user);
      } catch (error) {
        console.error(
          "FETCH USER ERROR:",
          error
        );

        setError(
          "Unable to load your dashboard. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      router.push("/login");
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08031f] text-[#dbe3ff]">
        <p className="font-mono text-sm text-[#b9bacb]">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08031f] text-center text-[#dbe3ff]">
        <p className="text-sm text-red-400">
          {error}
        </p>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const progress =
    userData?.progress || {};

  const activeCourse =
    progress.activeCourse || {};

  const recentActivity =
    progress.recentActivity || [];

  const problemsSolved =
    Number(
      progress.problemsSolved ?? 0
    );

  const totalProblems =
    Number(
      progress.totalProblems ?? 2419
    );

  const problemsPercent =
    totalProblems > 0
      ? Math.min(
          100,
          Math.round(
            (problemsSolved /
              totalProblems) *
              100
          )
        )
      : 0;

  const quizAverage =
    Number(
      progress.quizScoreAvg ?? 0
    );

  const coins =
    Number(
      progress.coins ?? 0
    );

  const rank =
    Number(
      progress.globalRank ?? 0
    );

  const streak =
    Number(
      progress.streak ?? 0
    );

  const level =
    Number(
      progress.level ?? 1
    );

  return (
    <div className="min-h-screen bg-[#08031f] text-[#dbe3ff]">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] border-r border-white/[0.04] bg-[#071024] lg:block">

        {/* LOGO */}

        <div className="flex h-[112px] items-center gap-3 border-b border-white/[0.04] px-5">

          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#d7b8ff] text-[#10162d]">
            <Code2
              size={20}
              strokeWidth={2.5}
            />
          </div>

          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-[#d9bfff]">
              CodeSpirit
            </h1>

            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#aaa7bc]">
              DEVELOPER PORTAL
            </p>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav>

          <SidebarItem
            icon={
              <LayoutDashboard size={20} />
            }
            label="Overview"
            active
          />

          <a href="/choose-language">
            <SidebarItem
              icon={
                <FileText size={20} />
              }
              label="Courses"
            />
          </a>

          <a href="/games">
            <SidebarItem
              icon={
                <Gamepad2 size={20} />
              }
              label="Games"
            />
          </a>

          <SidebarItem
            icon={
              <Trophy size={20} />
            }
            label="Achievements"
          />

          <SidebarItem
            icon={
              <Users size={20} />
            }
            label="Community"
          />

        </nav>

        {/* SETTINGS */}

        <div className="absolute bottom-8 left-0 w-full">

          <SidebarItem
            icon={
              <Settings size={20} />
            }
            label="Settings"
          />

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="lg:ml-[260px]">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-white/[0.04] bg-[#071024]/95 px-5 backdrop-blur-xl md:px-7">

          <div className="relative w-full max-w-[310px]">

            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa8bc]"
            />

            <input
              type="text"
              placeholder="Search problems, topics..."
              className="h-[40px] w-full rounded-full border border-white/[0.07] bg-[#18223a] pl-9 pr-4 text-sm text-white outline-none placeholder:text-[#777c91] focus:border-purple-500/40"
            />

          </div>

          <div className="ml-5 flex items-center gap-5">

            {/* DYNAMIC COINS */}

            <div className="hidden items-center gap-2 rounded-full bg-[#18233e] px-3 py-1.5 sm:flex">

              <Coins
                size={14}
                className="text-yellow-400"
              />

              <span className="font-mono text-[12px] font-bold text-yellow-400">
                {coins.toLocaleString()}
              </span>

            </div>

            <button className="text-[#bbb9c9] transition hover:text-white">
              <Bell size={20} />
            </button>

            <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-[#272d45]">

              <div className="flex h-full w-full items-center justify-center">

                <User
                  size={18}
                  className="text-[#b8a9d5]"
                />

              </div>

            </div>

            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="text-[#bbb9c9] transition hover:text-red-400"
            >
              <LogOut size={20} />
            </button>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="min-h-[calc(100vh-74px)] px-5 py-7 md:px-7 lg:px-6 xl:px-7">

          {/* =================================================
              HERO
          ================================================= */}

          <div className="mb-7">

            <div className="mb-2 flex items-center gap-2">

              <span className="rounded border border-purple-400/30 bg-purple-500/10 px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-[#c7a8f5]">
                LEVEL {level}
              </span>

              <span className="flex items-center gap-1 font-mono text-[12px] font-semibold text-[#d2cce1]">

                <Flame size={14} />

                {streak} Day Streak

              </span>

            </div>

            <h2 className="text-4xl font-extrabold tracking-[-1.5px] text-[#dce3ff] md:text-[44px]">

              Welcome Back,{" "}

              <span className="text-[#d3aaff]">
                {userData?.username ||
                  "Architect"}
              </span>

            </h2>

          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={
                <Code2 size={19} />
              }
              small={`${problemsSolved} solved`}
              title="Problems Solved"
              value={String(
                problemsSolved
              )}
              suffix={`/ ${totalProblems}`}
              progress={
                problemsPercent
              }
            />

            <StatCard
              icon={
                <CircleHelp size={19} />
              }
              small="Quiz Avg"
              title="Quiz Score Avg"
              value={`${quizAverage}%`}
              badge
            />

            <StatCard
              icon={
                <Globe2 size={19} />
              }
              small="Rank"
              title="Global Rank"
              value={
                rank > 0
                  ? `#${rank}`
                  : "Unranked"
              }
            />

            <div className="rounded-xl bg-[#222d48] p-5 text-center shadow-lg">

              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400/10">

                <Coins
                  size={28}
                  className="text-yellow-400"
                  fill="currentColor"
                />

              </div>

              <div className="text-3xl font-extrabold text-yellow-400">
                {coins.toLocaleString()}
              </div>

              <div className="mt-1 text-sm text-[#b7bacb]">
                Available Coins
              </div>

            </div>

          </div>

          {/* =================================================
              TWO COLUMNS
          ================================================= */}

          <div className="mt-7 grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_275px]">

            {/* LEFT */}

            <div className="min-w-0">

              {/* ACTIVE COURSE */}

              <section className="rounded-xl border border-purple-500/20 bg-[#101a31] p-5 shadow-[0_10px_35px_rgba(124,58,237,0.18)]">

                <div className="flex flex-col gap-5 md:flex-row md:items-center">

                  <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0b1429]">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-400/20 shadow-[0_0_25px_rgba(190,140,255,.35)]">

                      <Compass
                        size={31}
                        className="text-[#c8a4fa]"
                      />

                    </div>

                  </div>

                  <div className="flex-1">

                    <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#c7a7e8]">
                      ACTIVE COURSE • Module{" "}
                      {activeCourse.module ??
                        1}
                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-[#dce3ff] md:text-[30px]">
                      {activeCourse.title ||
                        "Start Your Journey"}
                    </h3>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">

                      <div className="flex-1">

                        <div className="mb-1 flex justify-between font-mono text-[11px]">

                          <span className="text-[#b6aec6]">
                            Progress
                          </span>

                          <span className="text-[#d5b4ff]">
                            {activeCourse.progress ??
                              0}
                            %
                          </span>

                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-[#202d49]">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#863cf2] to-[#d28aff]"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(
                                    activeCourse.progress ??
                                      0
                                  )
                                )
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                      <button className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#8438ed] px-5 font-mono text-[11px] font-bold tracking-wide text-white transition hover:bg-[#954df5]">

                        CONTINUE LEARNING

                        <ArrowRight
                          size={15}
                        />

                      </button>

                    </div>

                  </div>

                </div>

              </section>

              {/* RECOMMENDED */}

              <section className="mt-7">

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="text-[23px] font-bold text-[#dce3ff]">
                    Recommended Next
                  </h3>

                  <button className="font-mono text-[11px] font-semibold text-[#cba7f4] hover:text-white">
                    View All
                  </button>

                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <ProblemCard
                    difficulty="Easy"
                    title="Two Sum"
                    description="Given an array of integers nums and an integer target, return"
                    tags={[
                      "Arrays",
                      "Hash Table",
                    ]}
                  />

                  <ProblemCard
                    difficulty="Medium"
                    title="Reverse Linked List"
                    description="Given the head of a singly linked list, reverse"
                    tags={[
                      "Linked List",
                    ]}
                  />

                  <ProblemCard
                    difficulty="Medium"
                    title="Binary Tree Inversion"
                    description="Given the root of a binary tree, invert the..."
                    tags={[
                      "Trees",
                      "DFS",
                    ]}
                  />

                </div>

              </section>

              {/* DAILY CHALLENGE */}

              <section className="mt-7 flex flex-col gap-4 rounded-xl bg-[#19243d] p-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/10">

                    <Star
                      size={22}
                      className="text-yellow-400"
                      fill="currentColor"
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-[#dce3ff]">
                      Daily Challenge
                    </h3>

                    <p className="mt-1 text-sm text-[#b9bacb]">

                      Complete today's challenge
                      to earn{" "}

                      <span className="text-yellow-400">
                        +50 Coins
                      </span>

                    </p>

                  </div>

                </div>

                <button className="rounded-lg border border-[#c9a9ff] px-5 py-2.5 font-mono text-[11px] font-bold text-[#d8c1f6] transition hover:bg-purple-500/10">
                  START CHALLENGE
                </button>

              </section>

            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <aside className="space-y-5">

              {/* RECENT ACTIVITY */}

              <section className="rounded-xl bg-[#202b46] p-5">

                <h3 className="mb-5 text-lg font-bold text-[#dce3ff]">
                  Recent Activity
                </h3>

                {recentActivity.length ===
                0 ? (
                  <p className="text-sm text-[#8c91b1]">
                    No activity yet — solve
                    a problem to get started.
                  </p>
                ) : (
                  <div className="relative">

                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

                    {recentActivity
                      .slice(0, 5)
                      .map(
                        (
                          activity,
                          index
                        ) => (
                          <Activity
                            key={`${activity.createdAt}-${index}`}
                            active={
                              index === 0
                            }
                            time={formatRelativeTime(
                              activity.createdAt
                            )}
                            title={
                              activity.title
                            }
                            extra={
                              <>
                                {activity.difficulty && (
                                  <span className="rounded border border-orange-400/30 px-2 py-0.5 text-[9px] text-orange-300">
                                    {
                                      activity.difficulty
                                    }
                                  </span>
                                )}

                                {typeof activity.coins ===
                                  "number" && (
                                  <span className="text-yellow-400">
                                    🪙 +
                                    {
                                      activity.coins
                                    }
                                  </span>
                                )}

                                {typeof activity.score ===
                                  "number" && (
                                  <span className="font-mono text-[10px] font-bold text-[#c9b0ef]">
                                    Score:{" "}
                                    {
                                      activity.score
                                    }
                                    %
                                  </span>
                                )}
                              </>
                            }
                          />
                        )
                      )}

                  </div>
                )}

              </section>

              {/* RECENTLY UNLOCKED */}

              <section className="rounded-xl bg-[#202b46] p-5">

                <h3 className="mb-4 text-lg font-bold text-[#dce3ff]">
                  Recently Unlocked
                </h3>

                <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-white/10 bg-[#172139]">

                    <FileText
                      size={21}
                      className="text-[#b7a7c9]"
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-[#d6dcef]">
                      Mastering React...
                    </p>

                    <p className="truncate text-xs text-[#aaaec0]">
                      Advanced Hooks &...
                    </p>

                  </div>

                </div>

              </section>

              {/* CURRENT RANK */}

              <section className="rounded-xl bg-[#202b46] p-5">

                <div className="mb-5 flex items-center justify-between">

                  <h3 className="text-lg font-bold text-[#dce3ff]">
                    Your Ranking
                  </h3>

                  <ExternalLink
                    size={15}
                    className="text-[#a9adbf]"
                  />

                </div>

                <div className="rounded-lg bg-[#17223b] px-3 py-3">

                  <div className="flex items-center gap-3">

                    <span className="w-5 text-center font-mono text-[11px] text-[#d6d7df]">
                      {rank > 0
                        ? rank
                        : "-"}
                    </span>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-300/20 bg-purple-500/10">

                      <User
                        size={15}
                        className="text-[#c8a5f5]"
                      />

                    </div>

                    <span className="flex-1 text-sm text-[#cbd0df]">
                      {userData?.username ||
                        "You"}
                    </span>

                    <span className="font-mono text-[10px] text-yellow-400">
                      {coins.toLocaleString()}
                    </span>

                  </div>

                </div>

                <div className="mt-4 text-center">

                  <p className="text-xs text-[#9da3b9]">
                    Global Rank
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#d6b5ff]">

                    {rank > 0
                      ? `#${rank}`
                      : "Unranked"}

                  </p>

                </div>

              </section>

            </aside>

          </div>

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatRelativeTime(dateString) {
  if (!dateString) {
    return "";
  }

  const date =
    new Date(dateString);

  const diffMs =
    Date.now() -
    date.getTime();

  const diffHours =
    Math.floor(
      diffMs /
        (1000 * 60 * 60)
    );

  if (diffHours < 1) {
    return "Just now";
  }

  if (diffHours < 24) {
    return `${diffHours} hour${
      diffHours === 1
        ? ""
        : "s"
    } ago`;
  }

  const diffDays =
    Math.floor(
      diffHours / 24
    );

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

/* =========================================================
   SIDEBAR
========================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
}) {
  return (
    <button
      className={`relative flex h-[56px] w-full items-center gap-4 px-6 text-left transition ${
        active
          ? "bg-[#1a1744] text-[#ceb0f6]"
          : "text-[#b9bacb] hover:bg-white/[0.03] hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-0 h-full w-[3px] bg-[#d5b5ff]" />
      )}

      {icon}

      <span className="text-[15px] font-medium">
        {label}
      </span>
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  small,
  title,
  value,
  suffix,
  progress,
  badge,
}) {
  return (
    <div className="relative rounded-xl bg-[#222d48] p-5">

      <div className="mb-3 flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-300/20 bg-purple-500/10 text-[#c7a8f6]">
          {icon}
        </div>

        {badge ? (
          <span className="rounded border border-orange-400/30 bg-orange-400/10 px-2 py-1 font-mono text-[9px] text-orange-300">
            {small}
          </span>
        ) : (
          <span className="font-mono text-[11px] font-semibold text-[#cfb1eb]">
            {small}
          </span>
        )}

      </div>

      <p className="text-sm text-[#b9bacb]">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-2">

        <span className="text-[32px] font-bold text-[#dce3ff]">
          {value}
        </span>

        {suffix && (
          <span className="text-sm text-[#b8bbcc]">
            {suffix}
          </span>
        )}

      </div>

      {progress !== undefined && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#1b2947]">

          <div
            className="h-full rounded-full bg-gradient-to-r from-[#873df3] to-[#c87cff]"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  progress
                )
              )}%`,
            }}
          />

        </div>
      )}

    </div>
  );
}

/* =========================================================
   PROBLEM CARD
========================================================= */

function ProblemCard({
  difficulty,
  title,
  description,
  tags,
}) {
  return (
    <div className="rounded-xl bg-[#222d48] p-4 transition hover:-translate-y-0.5 hover:bg-[#273451]">

      <span
        className={`rounded border px-2 py-1 font-mono text-[9px] ${
          difficulty === "Easy"
            ? "border-blue-300/10 bg-blue-300/5 text-[#b8c8e8]"
            : "border-orange-300/30 bg-orange-300/5 text-orange-300"
        }`}
      >
        {difficulty}
      </span>

      <h4 className="mt-4 text-[17px] font-bold text-[#dce3ff]">
        {title}
      </h4>

      <p className="mt-2 min-h-[62px] text-sm leading-5 text-[#b8bacb]">
        {description}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">

        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-[#3a3157] px-2 py-1 font-mono text-[9px] text-[#c9b4df]"
          >
            {tag}
          </span>
        ))}

      </div>

    </div>
  );
}

/* =========================================================
   ACTIVITY
========================================================= */

function Activity({
  time,
  title,
  extra,
  active = false,
}) {
  return (
    <div className="relative flex gap-4 pb-6">

      <div
        className={`relative z-10 mt-1 h-[14px] w-[14px] shrink-0 rounded-full border-2 ${
          active
            ? "border-[#cda5ff] bg-[#cda5ff] shadow-[0_0_12px_rgba(205,165,255,.7)]"
            : "border-[#65708c] bg-[#202b46]"
        }`}
      />

      <div className="min-w-0">

        <p className="text-xs text-[#aeb0c1]">
          {time}
        </p>

        <p className="mt-1 text-sm leading-5 text-[#d0c6df]">
          {title}
        </p>

        {extra && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {extra}
          </div>
        )}

      </div>

    </div>
  );
}
