"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  ChevronRight,
  Code2,
  Search,
  Brain,
  ArrowLeft,
  Play,
  CheckCircle2,
  Circle,
  Layers,
  Target,
  Trophy,
  Loader2,
  Coins,
  Flame,
  User,
  LogOut,
} from "lucide-react";

import { useRouter } from "next/navigation";

/* =========================================================
   TOPIC SELECTION PAGE
========================================================= */

export default function TopicsPage() {
  const router = useRouter();

  /* =========================================================
     USER
  ========================================================= */

  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  /* =========================================================
     TOPIC DATA
  ========================================================= */

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [selectedChapter, setSelectedChapter] =
    useState("");

  const [selectedTopic, setSelectedTopic] =
    useState("");

  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    async function fetchUser() {
      try {
        setUserLoading(true);

        const res = await fetch("/api/user/me", {
          cache: "no-store",
        });

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

        setUserError(
          "Unable to load your profile."
        );
      } finally {
        setUserLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  /* =========================================================
     LOAD SUBJECTS / CHAPTERS / TOPICS
  ========================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [
          subjectsRes,
          chaptersRes,
          topicsRes,
        ] = await Promise.all([
          fetch("/api/subjects", {
            cache: "no-store",
          }),

          fetch("/api/chapters", {
            cache: "no-store",
          }),

          fetch("/api/topics", {
            cache: "no-store",
          }),
        ]);

        if (subjectsRes.ok) {
          const data =
            await subjectsRes.json();

          setSubjects(data);

          if (data.length > 0) {
            setSelectedSubject(
              data[0]._id
            );
          }
        }

        if (chaptersRes.ok) {
          setChapters(
            await chaptersRes.json()
          );
        }

        if (topicsRes.ok) {
          setTopics(
            await topicsRes.json()
          );
        }
      } catch (error) {
        console.error(
          "Failed to load topics:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* =========================================================
     USER PROGRESS
  ========================================================= */

  const progress =
    userData?.progress || {};

  const username =
    userData?.username || "User";

  const coins =
    Number(progress.coins ?? 0);

  const level =
    Number(progress.level ?? 1);

  const streak =
    Number(progress.streak ?? 0);

  const problemsSolved =
    Number(progress.problemsSolved ?? 0);

  const quizScoreAvg =
    Number(progress.quizScoreAvg ?? 0);

  /* =========================================================
     CHAPTERS FOR SELECTED SUBJECT
  ========================================================= */

  const chaptersForSubject =
    useMemo(() => {
      return chapters.filter(
        (chapter) =>
          String(chapter.subjectId) ===
          String(selectedSubject)
      );
    }, [
      chapters,
      selectedSubject,
    ]);

  /* =========================================================
     TOPICS FOR SELECTED CHAPTER
  ========================================================= */

  const topicsForChapter =
    useMemo(() => {
      return topics
        .filter(
          (topic) =>
            String(topic.chapterId) ===
            String(selectedChapter)
        )
        .sort(
          (a, b) =>
            Number(a.order || 0) -
            Number(b.order || 0)
        );
    }, [
      topics,
      selectedChapter,
    ]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredTopics =
    useMemo(() => {
      if (!search.trim()) {
        return topicsForChapter;
      }

      const query =
        search.toLowerCase();

      return topicsForChapter.filter(
        (topic) =>
          topic.title
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      topicsForChapter,
      search,
    ]);

  /* =========================================================
     SUBJECT CHANGE
  ========================================================= */

  const handleSubjectChange = (
    subjectId
  ) => {
    setSelectedSubject(subjectId);

    setSelectedChapter("");

    setSelectedTopic("");

    setSearch("");
  };

  /* =========================================================
     CHAPTER CHANGE
  ========================================================= */

  const handleChapterChange = (
    chapterId
  ) => {
    setSelectedChapter(chapterId);

    setSelectedTopic("");

    setSearch("");
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-gray-300">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2
            size={20}
            className="animate-spin text-indigo-400"
          />

          Loading your learning space...
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (userError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-red-400">
        {userError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] font-sans text-gray-300">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-gray-800 bg-[#0d1222]/95 px-6 py-4 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* =================================================
              LOGO
          ================================================= */}

          <div className="flex items-center gap-8">

            <a
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-wide text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Code2 size={18} />
              </div>

              <span>
                CodeSpirit
              </span>
            </a>

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">

              <a
                href="/dashboard"
                className="text-gray-400 transition hover:text-white"
              >
                Dashboard
              </a>

              <a
                href="/problems"
                className="text-gray-400 transition hover:text-white"
              >
                Problems
              </a>

              <a
                href="/mcqs"
                className="border-b-2 border-indigo-500 pb-4 text-white"
              >
                Quizzes
              </a>

              <a
                href="/resources"
                className="text-gray-400 transition hover:text-white"
              >
                Resources
              </a>

              <a
                href="/leaderboard"
                className="text-gray-400 transition hover:text-white"
              >
                Leaderboard
              </a>

            </nav>

          </div>

          {/* =================================================
              DYNAMIC USER AREA
          ================================================= */}

          <div className="flex items-center gap-3">

            {/* COINS */}

            <div className="hidden items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-400 sm:flex">

              <Coins size={14} />

              <span>
                {coins.toLocaleString()}
              </span>

            </div>

            {/* LEVEL */}

            <div className="hidden items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-xs text-indigo-300 sm:flex">

              <Trophy size={14} />

              <span>
                Level {level}
              </span>

            </div>

            {/* STREAK */}

            {streak > 0 && (
              <div className="hidden items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 text-xs text-orange-300 lg:flex">

                <Flame size={14} />

                <span>
                  {streak} day
                  {streak === 1
                    ? ""
                    : "s"} streak
                </span>

              </div>
            )}

            {/* USER */}

            <div className="group relative">

              <button className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-sm font-bold text-white">

                  <User size={17} />

                </div>

                <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-300 lg:block">
                  {username}
                </span>

              </button>

            </div>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              title="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}

        <a
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />

          Back to dashboard
        </a>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="mb-10">

          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">

              <Target
                size={22}
                className="text-indigo-400"
              />

            </div>

            <div>

              <h1 className="text-3xl font-extrabold text-white md:text-4xl">
                Choose a Topic
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Select a topic and start practicing.
              </p>

            </div>

          </div>

          {/* =================================================
              DYNAMIC USER SUMMARY
          ================================================= */}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

            <UserMiniStat
              icon={
                <Coins
                  size={16}
                />
              }
              label="Coins"
              value={coins.toLocaleString()}
              color="yellow"
            />

            <UserMiniStat
              icon={
                <Trophy
                  size={16}
                />
              }
              label="Level"
              value={level}
              color="indigo"
            />

            <UserMiniStat
              icon={
                <Code2
                  size={16}
                />
              }
              label="Solved"
              value={problemsSolved}
              color="purple"
            />

            <UserMiniStat
              icon={
                <Brain
                  size={16}
                />
              }
              label="Quiz Avg"
              value={`${quizScoreAvg}%`}
              color="green"
            />

          </div>

        </section>

        {/* ===================================================
            STEP 1 — SUBJECT
        =================================================== */}

        <section className="mb-8">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                Step 1
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Select Subject
              </h2>

            </div>

            <span className="text-xs text-gray-600">
              {subjects.length} subjects
            </span>

          </div>

          {subjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-800 bg-[#0d1222] p-8 text-center text-sm text-gray-500">
              No subjects available.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {subjects.map(
                (subject) => {

                  const active =
                    String(
                      selectedSubject
                    ) ===
                    String(
                      subject._id
                    );

                  return (
                    <button
                      key={
                        subject._id
                      }
                      onClick={() =>
                        handleSubjectChange(
                          subject._id
                        )
                      }
                      className={`group rounded-xl border p-5 text-left transition ${
                        active
                          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.12)]"
                          : "border-gray-800 bg-[#0d1222] hover:border-gray-700 hover:bg-[#10172a]"
                      }`}
                    >

                      <div className="mb-4 flex items-center justify-between">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            active
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-800 text-gray-400 group-hover:text-white"
                          }`}
                        >
                          <BookOpen
                            size={19}
                          />
                        </div>

                        {active && (
                          <CheckCircle2
                            size={18}
                            className="text-indigo-400"
                          />
                        )}

                      </div>

                      <h3 className="font-bold text-white">
                        {
                          subject.name
                        }
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Choose a chapter
                      </p>

                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            STEP 2 — CHAPTER
        =================================================== */}

        {selectedSubject && (
          <section className="mb-8">

            <div className="mb-4">

              <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                Step 2
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Select Chapter
              </h2>

            </div>

            {chaptersForSubject.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 bg-[#0d1222] p-8 text-center text-sm text-gray-500">
                No chapters available for this subject.
              </div>
            ) : (
              <div className="space-y-2">

                {chaptersForSubject.map(
                  (
                    chapter,
                    index
                  ) => {

                    const active =
                      String(
                        selectedChapter
                      ) ===
                      String(
                        chapter._id
                      );

                    return (
                      <button
                        key={
                          chapter._id
                        }
                        onClick={() =>
                          handleChapterChange(
                            chapter._id
                          )
                        }
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                          active
                            ? "border-indigo-500/50 bg-indigo-500/10"
                            : "border-gray-800 bg-[#0d1222] hover:border-gray-700 hover:bg-[#10172a]"
                        }`}
                      >

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                            active
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-800 text-gray-500"
                          }`}
                        >
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="font-semibold text-white">
                            {
                              chapter.title
                            }
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              topics.filter(
                                (
                                  topic
                                ) =>
                                  String(
                                    topic.chapterId
                                  ) ===
                                  String(
                                    chapter._id
                                  )
                              ).length
                            }{" "}
                            topics available
                          </p>

                        </div>

                        <ChevronRight
                          size={18}
                          className={
                            active
                              ? "text-indigo-400"
                              : "text-gray-600"
                          }
                        />

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </section>
        )}

        {/* ===================================================
            STEP 3 — TOPICS
        =================================================== */}

        {selectedChapter && (
          <section>

            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                  Step 3
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Choose a Topic
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Pick what you want to practice.
                </p>

              </div>

              {/* SEARCH */}

              <div className="relative w-full md:w-72">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search topics..."
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1222] py-2.5 pl-10 pr-4 text-sm text-gray-300 outline-none transition placeholder:text-gray-600 focus:border-indigo-500"
                />

              </div>

            </div>

            {filteredTopics.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 bg-[#0d1222] p-10 text-center">

                <Layers
                  size={30}
                  className="mx-auto mb-3 text-gray-700"
                />

                <p className="text-sm text-gray-500">
                  No topics found.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                {filteredTopics.map(
                  (topic) => {

                    const active =
                      String(
                        selectedTopic
                      ) ===
                      String(
                        topic._id
                      );

                    return (
                      <TopicCard
                        key={
                          topic._id
                        }
                        topic={topic}
                        active={
                          active
                        }
                        onSelect={() =>
                          setSelectedTopic(
                            topic._id
                          )
                        }
                      />
                    );
                  }
                )}

              </div>
            )}

          </section>
        )}

        {/* ===================================================
            SELECTED TOPIC ACTION
        =================================================== */}

        {selectedTopic && (
          <SelectedTopicPanel
            topic={
              topics.find(
                (topic) =>
                  String(
                    topic._id
                  ) ===
                  String(
                    selectedTopic
                  )
              )
            }
          />
        )}

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-gray-800 bg-[#0b0f19] px-6 py-6">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-600 md:flex-row">

          <span>
            © 2026 CodeSpirit. All rights reserved.
          </span>

          <div className="flex gap-5">

            <a
              href="#"
              className="hover:text-gray-300"
            >
              Support
            </a>

            <a
              href="#"
              className="hover:text-gray-300"
            >
              Privacy
            </a>

            <a
              href="#"
              className="hover:text-gray-300"
            >
              Terms
            </a>

          </div>

          <span className="font-medium text-gray-400">
            {username}
          </span>

        </div>

      </footer>

    </div>
  );
}

/* =========================================================
   USER MINI STAT
========================================================= */

function UserMiniStat({
  icon,
  label,
  value,
  color,
}) {
  const colors = {
    yellow:
      "border-yellow-500/10 bg-yellow-500/5 text-yellow-400",

    indigo:
      "border-indigo-500/10 bg-indigo-500/5 text-indigo-400",

    purple:
      "border-purple-500/10 bg-purple-500/5 text-purple-400",

    green:
      "border-green-500/10 bg-green-500/5 text-green-400",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${colors[color]}`}
    >
      <div className="flex items-center gap-2">

        {icon}

        <span className="text-xs text-gray-500">
          {label}
        </span>

      </div>

      <div className="mt-1 text-lg font-bold text-white">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   TOPIC CARD
========================================================= */

function TopicCard({
  topic,
  active,
  onSelect,
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border p-5 text-left transition ${
        active
          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.12)]"
          : "border-gray-800 bg-[#0d1222] hover:-translate-y-0.5 hover:border-gray-700 hover:bg-[#10172a]"
      }`}
    >

      {/* TOP */}

      <div className="mb-5 flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            active
              ? "bg-indigo-600 text-white"
              : "bg-indigo-500/10 text-indigo-400"
          }`}
        >
          <Code2 size={21} />
        </div>

        {active ? (
          <CheckCircle2
            size={19}
            className="text-indigo-400"
          />
        ) : (
          <Circle
            size={19}
            className="text-gray-700 transition group-hover:text-gray-500"
          />
        )}

      </div>

      {/* CONTENT */}

      <h3 className="text-lg font-bold text-white">
        {topic.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
        {topic.description ||
          "Practice questions and improve your understanding of this topic."}
      </p>

      {/* BOTTOM */}

      <div className="mt-5 flex items-center justify-between border-t border-gray-800 pt-4">

        <div className="flex items-center gap-2 text-xs text-gray-500">

          <Brain size={14} />

          <span>
            Practice
          </span>

        </div>

        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            active
              ? "text-indigo-400"
              : "text-gray-600 group-hover:text-indigo-400"
          }`}
        >
          Select

          <ChevronRight
            size={14}
          />
        </span>

      </div>

    </button>
  );
}

/* =========================================================
   SELECTED TOPIC PANEL
========================================================= */

function SelectedTopicPanel({
  topic,
}) {
  if (!topic) {
    return null;
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-[#0d1222] to-[#0d1222]">

      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-7">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">

            <Target size={22} />

          </div>

          <div>

            <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
              Selected Topic
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              {topic.title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Ready to start practicing?
            </p>

          </div>

        </div>

        <div className="flex flex-col gap-3 sm:flex-row">

          <a
            href={`/problems?topic=${topic._id}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#0b0f19] px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
          >
            <Code2 size={17} />

            Coding Problems
          </a>

          <a
            href={`/mcqs?topic=${topic._id}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Play size={17} />

            Start Quiz
          </a>

        </div>

      </div>

    </section>
  );
}
