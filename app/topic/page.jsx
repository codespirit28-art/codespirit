"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  ChevronRight,
  Search,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Layers,
  Target,
  Loader2,
  Coins,
  Lock,
  Unlock,
  AlertCircle,
  Play,
} from "lucide-react";

export default function TopicsPage() {
  // ==========================================================
  // DATA
  // ==========================================================

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  // ==========================================================
  // USER
  // ==========================================================

  const [coins, setCoins] = useState(0);
  const [unlockedTopics, setUnlockedTopics] = useState([]);

  // ==========================================================
  // UI
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        subjectsRes,
        chaptersRes,
        topicsRes,
        userRes,
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

        fetch("/api/user/me", {
          cache: "no-store",
          credentials: "include",
        }),
      ]);

      // ========================================================
      // SUBJECTS
      // ========================================================

      if (subjectsRes.ok) {
        const data = await subjectsRes.json();

        setSubjects(
          Array.isArray(data)
            ? data
            : data?.subjects || []
        );

        if (
          Array.isArray(data) &&
          data.length > 0
        ) {
          setSelectedSubject(data[0]._id);
        }
      }

      // ========================================================
      // CHAPTERS
      // ========================================================

      if (chaptersRes.ok) {
        const data = await chaptersRes.json();

        setChapters(
          Array.isArray(data)
            ? data
            : data?.chapters || []
        );
      }

      // ========================================================
      // TOPICS
      // ========================================================

      if (topicsRes.ok) {
        const data = await topicsRes.json();

        setTopics(
          Array.isArray(data)
            ? data
            : data?.topics || []
        );
      }

      // ========================================================
      // USER
      // ========================================================

      if (userRes.ok) {
        const data = await userRes.json();

        const user = data?.user;

        // IMPORTANT:
        // coins are inside progress
        setCoins(
          Number(
            user?.progress?.coins ?? 0
          )
        );

        setUnlockedTopics(
          user?.progress?.unlockedTopics || []
        );
      } else if (userRes.status === 401) {
        setError(
          "Please log in to unlock concepts."
        );
      }
    } catch (err) {
      console.error(
        "LOAD TOPIC PAGE ERROR:",
        err
      );

      setError(
        "Unable to load topic data."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // CHAPTERS FOR SUBJECT
  // ==========================================================

  const chaptersForSubject = useMemo(() => {
    return chapters
      .filter(
        (chapter) =>
          String(chapter.subjectId) ===
          String(selectedSubject)
      )
      .sort(
        (a, b) =>
          Number(a.order || 0) -
          Number(b.order || 0)
      );
  }, [
    chapters,
    selectedSubject,
  ]);

  // ==========================================================
  // TOPICS FOR CHAPTER
  // ==========================================================

  const topicsForChapter = useMemo(() => {
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

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredTopics = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return topicsForChapter;
    }

    return topicsForChapter.filter(
      (topic) =>
        topic.title
          ?.toLowerCase()
          .includes(query) ||
        topic.description
          ?.toLowerCase()
          .includes(query)
    );
  }, [
    topicsForChapter,
    search,
  ]);

  // ==========================================================
  // CHECK UNLOCKED
  // ==========================================================

  function isTopicUnlocked(topicId) {
    return unlockedTopics.some(
      (id) =>
        String(
          typeof id === "object"
            ? id?._id
            : id
        ) ===
        String(topicId)
    );
  }

  // ==========================================================
  // SUBJECT CHANGE
  // ==========================================================

  function handleSubjectChange(subjectId) {
    setSelectedSubject(subjectId);
    setSelectedChapter("");
    setSearch("");
  }

  // ==========================================================
  // CHAPTER CHANGE
  // ==========================================================

  function handleChapterChange(chapterId) {
    setSelectedChapter(chapterId);
    setSearch("");
  }

  // ==========================================================
  // GET TOPIC PAYMENT SETTINGS
  // ==========================================================

  function getTopicPayment(topic) {
    /*
      Admin should control these fields.

      Supported examples:

      {
        isFree: true
      }

      OR

      {
        isPaid: false
      }

      OR

      {
        unlockCost: 50
      }

      OR

      {
        price: 50
      }
    */

    const isFree =
      topic?.isFree === true ||
      topic?.isPaid === false ||
      topic?.free === true;

    if (isFree) {
      return {
        free: true,
        cost: 0,
      };
    }

    const rawCost =
      topic?.unlockCost ??
      topic?.price ??
      topic?.coinCost ??
      null;

    const cost =
      rawCost === null ||
      rawCost === undefined ||
      rawCost === ""
        ? 0
        : Number(rawCost);

    return {
      free: cost <= 0,
      cost: Math.max(0, cost),
    };
  }

  // ==========================================================
  // START THEORY
  // ==========================================================

  function startTopic(topic) {
    if (!topic?._id) {
      return;
    }

    /*
      Your current theory page is:

      /theory/[id]/page.js

      and [id] is currently treated as chapterId.

      Therefore we send the user to the chapter.
    */

    if (topic.chapterId) {
      window.location.href =
        `/theory/${topic.chapterId}`;

      return;
    }

    setError(
      "Theory chapter is not configured for this concept."
    );
  }

  // ==========================================================
  // UNLOCK
  // ==========================================================

  async function unlockTopic(topic) {
    if (!topic?._id) {
      return;
    }

    // ========================================================
    // ALREADY UNLOCKED
    // ========================================================

    if (isTopicUnlocked(topic._id)) {
      startTopic(topic);
      return;
    }

    const payment =
      getTopicPayment(topic);

    // ========================================================
    // FREE
    // ========================================================

    if (payment.free) {
      try {
        setUnlockingId(topic._id);
        setError("");

        const res = await fetch(
          "/api/topics/unlock",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              topicId: topic._id,
            }),
          }
        );

        const contentType =
          res.headers.get(
            "content-type"
          ) || "";

        const data =
          contentType.includes(
            "application/json"
          )
            ? await res.json()
            : null;

        if (!res.ok) {
          throw new Error(
            data?.message ||
              `Unable to start concept. (${res.status})`
          );
        }

        // Update returned balance if API returns it
        if (
          data?.coins !== undefined
        ) {
          setCoins(
            Number(data.coins)
          );
        }

        if (
          Array.isArray(
            data?.unlockedTopics
          )
        ) {
          setUnlockedTopics(
            data.unlockedTopics
          );
        } else {
          setUnlockedTopics(
            (prev) => [
              ...prev,
              topic._id,
            ]
          );
        }

        // Immediately open theory
        startTopic(topic);
      } catch (err) {
        console.error(
          "START FREE TOPIC ERROR:",
          err
        );

        setError(
          err.message ||
            "Unable to start concept."
        );
      } finally {
        setUnlockingId(null);
      }

      return;
    }

    // ========================================================
    // PAID
    // ========================================================

    if (coins < payment.cost) {
      setError(
        `You need ${payment.cost} coins. You currently have ${coins}.`
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Unlock "${topic.title}" for ${payment.cost} coins?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUnlockingId(topic._id);
      setError("");

      const res = await fetch(
        "/api/topics/unlock",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            topicId: topic._id,
          }),
        }
      );

      // ======================================================
      // NEVER blindly call res.json()
      // This prevents:
      // Unexpected token '<'
      // ======================================================

      const contentType =
        res.headers.get(
          "content-type"
        ) || "";

      const data =
        contentType.includes(
          "application/json"
        )
          ? await res.json()
          : null;

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Unable to unlock concept. (${res.status})`
        );
      }

      // ======================================================
      // UPDATE COINS
      // ======================================================

      if (
        data?.coins !== undefined
      ) {
        setCoins(
          Number(data.coins)
        );
      } else {
        // Fallback if API doesn't return coins
        setCoins(
          (prev) =>
            Math.max(
              0,
              prev - payment.cost
            )
        );
      }

      // ======================================================
      // UPDATE UNLOCKED TOPICS
      // ======================================================

      if (
        Array.isArray(
          data?.unlockedTopics
        )
      ) {
        setUnlockedTopics(
          data.unlockedTopics
        );
      } else {
        setUnlockedTopics(
          (prev) => [
            ...prev,
            topic._id,
          ]
        );
      }

      // ======================================================
      // IMPORTANT
      // Immediately change to Start
      // ======================================================

      // Don't reload the whole page.
      // React state above changes the card.

    } catch (err) {
      console.error(
        "UNLOCK TOPIC ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to unlock concept."
      );
    } finally {
      setUnlockingId(null);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-gray-300">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2
            size={20}
            className="animate-spin text-indigo-400"
          />
          Loading concepts...
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#0b0f19] font-sans text-gray-300">

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-gray-800 bg-[#0d1222]/95 px-6 py-4 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div className="flex items-center gap-8">

            <a
              href="/"
              className="text-lg font-bold tracking-wide text-white"
            >
              CodeSpirit
            </a>

            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">

              <a
                href="/dashboard"
                className="text-gray-400 hover:text-white"
              >
                Dashboard
              </a>

              <a
                href="/problems"
                className="text-gray-400 hover:text-white"
              >
                Problems
              </a>

              <a
                href="/topic"
                className="border-b-2 border-indigo-500 pb-4 text-white"
              >
                Concepts
              </a>

              <a
                href="/resources"
                className="text-gray-400 hover:text-white"
              >
                Resources
              </a>

              <a
                href="/leaderboard"
                className="text-gray-400 hover:text-white"
              >
                Leaderboard
              </a>

            </nav>

          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5">

              <Coins
                size={15}
                className="text-yellow-400"
              />

              <span className="text-xs font-bold text-yellow-400">
                {coins.toLocaleString()}
              </span>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              U
            </div>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        <a
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </a>

        {/* HERO */}

        <section className="mb-10">

          <div className="flex items-start justify-between gap-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">

                <Target
                  size={22}
                  className="text-indigo-400"
                />

              </div>

              <div>

                <h1 className="text-3xl font-extrabold text-white md:text-4xl">
                  Learn Concepts
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Earn coins by solving problems and spend them to unlock concepts.
                </p>

              </div>

            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 sm:flex">

              <Coins
                size={20}
                className="text-yellow-400"
              />

              <div>

                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                  Your balance
                </p>

                <p className="font-bold text-yellow-400">
                  {coins.toLocaleString()} coins
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">

            <AlertCircle size={18} />

            <span className="flex-1">
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
              className="text-red-400 hover:text-white"
            >
              ×
            </button>

          </div>
        )}

        {/* SUBJECTS */}

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
                        {subject.name}
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

        {/* CHAPTERS */}

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

            {chaptersForSubject.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 bg-[#0d1222] p-8 text-center text-sm text-gray-500">
                No chapters available.
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

                    const count =
                      topics.filter(
                        (topic) =>
                          String(
                            topic.chapterId
                          ) ===
                          String(
                            chapter._id
                          )
                      ).length;

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
                            {chapter.title}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            {count} concepts available
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

        {/* CONCEPTS */}

        {selectedChapter && (
          <section>

            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                  Step 3
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Learn Concepts
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Unlock paid concepts or start free concepts.
                </p>

              </div>

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
                  placeholder="Search concepts..."
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1222] py-2.5 pl-10 pr-4 text-sm text-gray-300 outline-none placeholder:text-gray-600 focus:border-indigo-500"
                />

              </div>

            </div>

            {filteredTopics.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 bg-[#0d1222] p-10 text-center">

                <Layers
                  size={30}
                  className="mx-auto mb-3 text-gray-700"
                />

                <p className="text-sm text-gray-500">
                  No concepts found.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                {filteredTopics.map(
                  (topic) => {

                    const unlocked =
                      isTopicUnlocked(
                        topic._id
                      );

                    return (
                      <ConceptCard
                        key={
                          topic._id
                        }
                        topic={
                          topic
                        }
                        unlocked={
                          unlocked
                        }
                        coins={
                          coins
                        }
                        unlocking={
                          unlockingId ===
                          topic._id
                        }
                        onUnlock={() =>
                          unlockTopic(
                            topic
                          )
                        }
                        onStart={() =>
                          startTopic(
                            topic
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

      </main>

      {/* FOOTER */}

      <footer className="border-t border-gray-800 bg-[#0b0f19] px-6 py-6">

        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-gray-600">

          <span>
            © 2026 CodeSpirit
          </span>

          <span className="font-medium text-gray-400">
            Learn. Solve. Unlock.
          </span>

        </div>

      </footer>

    </div>
  );
}


// ============================================================
// CONCEPT CARD
// ============================================================

function ConceptCard({
  topic,
  unlocked,
  coins,
  unlocking,
  onUnlock,
  onStart,
}) {
  const getPayment = () => {
    const free =
      topic?.isFree === true ||
      topic?.isPaid === false ||
      topic?.free === true;

    if (free) {
      return {
        free: true,
        cost: 0,
      };
    }

    const rawCost =
      topic?.unlockCost ??
      topic?.price ??
      topic?.coinCost ??
      null;

    const cost =
      rawCost === null ||
      rawCost === undefined ||
      rawCost === ""
        ? 0
        : Number(rawCost);

    return {
      free: cost <= 0,
      cost: Math.max(
        0,
        cost
      ),
    };
  };

  const payment =
    getPayment();

  const canAfford =
    payment.free ||
    coins >= payment.cost;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-5 transition ${
        unlocked
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-gray-800 bg-[#0d1222] hover:border-gray-700 hover:bg-[#10172a]"
      }`}
    >

      {/* TOP */}

      <div className="mb-5 flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            unlocked
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-indigo-500/10 text-indigo-400"
          }`}
        >
          {unlocked ? (
            <Unlock size={21} />
          ) : payment.free ? (
            <BookOpen size={21} />
          ) : (
            <Lock size={21} />
          )}
        </div>

        {unlocked ? (
          <CheckCircle2
            size={19}
            className="text-emerald-400"
          />
        ) : payment.free ? (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Free
          </span>
        ) : (
          <Circle
            size={19}
            className="text-gray-700"
          />
        )}

      </div>

      {/* CONTENT */}

      <h3 className="text-lg font-bold text-white">
        {topic.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">
        {topic.description ||
          "Learn this concept and strengthen your programming fundamentals."}
      </p>

      {/* BOTTOM */}

      <div className="mt-5 border-t border-gray-800 pt-4">

        {/* ====================================================
            UNLOCKED
        ==================================================== */}

        {unlocked ? (
          <div>

            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-400">

              <CheckCircle2
                size={15}
              />

              Unlocked

            </div>

            <button
              onClick={onStart}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <Play
                size={16}
                fill="currentColor"
              />

              Start Concept

              <ChevronRight
                size={15}
              />
            </button>

          </div>
        ) : payment.free ? (

          /* ==================================================
             FREE
          ================================================== */

          <div>

            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-400">

              <BookOpen
                size={15}
              />

              Free concept

            </div>

            <button
              onClick={onUnlock}
              disabled={unlocking}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {unlocking ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Starting...
                </>
              ) : (
                <>
                  <Play
                    size={16}
                    fill="currentColor"
                  />

                  Start Concept
                </>
              )}

            </button>

          </div>

        ) : (

          /* ==================================================
             PAID
          ================================================== */

          <div>

            <div className="mb-3 flex items-center justify-between">

              <span className="flex items-center gap-1.5 text-xs text-gray-500">

                <Coins
                  size={14}
                  className="text-yellow-400"
                />

                Unlock cost

              </span>

              <span className="font-bold text-yellow-400">
                {payment.cost.toLocaleString()} coins
              </span>

            </div>

            <button
              onClick={onUnlock}
              disabled={
                unlocking ||
                !canAfford
              }
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                canAfford
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "cursor-not-allowed bg-gray-800 text-gray-600"
              }`}
            >

              {unlocking ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Unlocking...
                </>
              ) : canAfford ? (
                <>
                  <Unlock
                    size={16}
                  />

                  Unlock Concept
                </>
              ) : (
                <>
                  <Lock
                    size={16}
                  />

                  Need{" "}
                  {(
                    payment.cost -
                    coins
                  ).toLocaleString()}{" "}
                  more
                </>
              )}

            </button>

          </div>
        )}

      </div>

    </div>
  );
}
