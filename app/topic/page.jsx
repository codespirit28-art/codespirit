"use client";

import { useEffect, useMemo, useState } from "react";
import {
AlertCircle,
ArrowLeft,
BookOpen,
CheckCircle2,
ChevronRight,
Circle,
Coins,
Layers,
Loader2,
Lock,
Play,
Search,
Target,
Unlock,
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
let cancelled = false;


async function loadData() {
  try {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
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

    if (cancelled) {
      return;
    }

    // ======================================================
    // SUBJECTS
    // ======================================================

    const subjectsResult = results[0];

    if (subjectsResult.status === "fulfilled") {
      const response = subjectsResult.value;

      if (response.ok) {
        const data = await readJsonResponse(response);

        const subjectList = normalizeArray(
          data,
          "subjects"
        );

        setSubjects(subjectList);

        if (subjectList.length > 0) {
          setSelectedSubject(
            String(subjectList[0]?._id || "")
          );
        }
      }
    }

    // ======================================================
    // CHAPTERS
    // ======================================================

    const chaptersResult = results[1];

    if (chaptersResult.status === "fulfilled") {
      const response = chaptersResult.value;

      if (response.ok) {
        const data = await readJsonResponse(response);

        const chapterList = normalizeArray(
          data,
          "chapters"
        );

        setChapters(chapterList);
      }
    }

    // ======================================================
    // TOPICS
    // ======================================================

    const topicsResult = results[2];

    if (topicsResult.status === "fulfilled") {
      const response = topicsResult.value;

      if (response.ok) {
        const data = await readJsonResponse(response);

        const topicList = normalizeArray(
          data,
          "topics"
        );

        setTopics(topicList);
      }
    }

    // ======================================================
    // USER
    // ======================================================

    const userResult = results[3];

    if (userResult.status === "fulfilled") {
      const response = userResult.value;

      if (response.ok) {
        const data = await readJsonResponse(response);

        const user = data?.user;

        setCoins(
          Number(
            user?.progress?.coins ?? 0
          )
        );

        setUnlockedTopics(
          Array.isArray(
            user?.progress?.unlockedTopics
          )
            ? user.progress.unlockedTopics
            : []
        );
      } else if (response.status === 401) {
        setError(
          "Please log in to unlock concepts."
        );
      }
    }
  } catch (err) {
    console.error(
      "LOAD TOPIC PAGE ERROR:",
      err
    );

    if (!cancelled) {
      setError(
        err?.message ||
          "Unable to load topic data."
      );
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

loadData();

return () => {
  cancelled = true;
};


}, []);

// ==========================================================
// CHAPTERS FOR SELECTED SUBJECT
// ==========================================================

const chaptersForSubject = useMemo(() => {
return chapters
.filter((chapter) => {
return (
String(chapter?.subjectId ?? "") ===
String(selectedSubject ?? "")
);
})
.sort((a, b) => {
return (
Number(a?.order ?? 0) -
Number(b?.order ?? 0)
);
});
}, [
chapters,
selectedSubject,
]);

// ==========================================================
// TOPICS FOR SELECTED CHAPTER
// ==========================================================

const topicsForChapter = useMemo(() => {
return topics
.filter((topic) => {
return (
String(topic?.chapterId ?? "") ===
String(selectedChapter ?? "")
);
})
.sort((a, b) => {
return (
Number(a?.order ?? 0) -
Number(b?.order ?? 0)
);
});
}, [
topics,
selectedChapter,
]);

// ==========================================================
// FILTERED TOPICS
// ==========================================================

const filteredTopics = useMemo(() => {
const query = search
.trim()
.toLowerCase();


if (!query) {
  return topicsForChapter;
}

return topicsForChapter.filter((topic) => {
  const title =
    String(topic?.title || "")
      .toLowerCase();

  const description =
    String(topic?.description || "")
      .toLowerCase();

  return (
    title.includes(query) ||
    description.includes(query)
  );
});


}, [
topicsForChapter,
search,
]);

// ==========================================================
// CHECK UNLOCKED
// ==========================================================

function isTopicUnlocked(topicId) {
if (!topicId) {
return false;
}


return unlockedTopics.some((item) => {
  const id =
    typeof item === "object"
      ? item?._id
      : item;

  return (
    String(id ?? "") ===
    String(topicId)
  );
});


}

// ==========================================================
// SUBJECT CHANGE
// ==========================================================

function handleSubjectChange(subjectId) {
setSelectedSubject(
String(subjectId || "")
);


setSelectedChapter("");
setSearch("");
setError("");


}

// ==========================================================
// CHAPTER CHANGE
// ==========================================================

function handleChapterChange(chapterId) {
setSelectedChapter(
String(chapterId || "")
);


setSearch("");
setError("");


}

// ==========================================================
// PAYMENT SETTINGS
// ==========================================================

function getTopicPayment(topic) {
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
  0;

const numericCost =
  Number(rawCost);

const cost =
  Number.isFinite(numericCost)
    ? Math.max(0, numericCost)
    : 0;

return {
  free: cost <= 0,
  cost,
};


}

// ==========================================================
// OPEN THEORY
// ==========================================================
//
// IMPORTANT:
//
// We pass BOTH:
//
// /theory/chapterId?topicId=topicId
//
// This lets the theory page know exactly which
// topic was selected.
//
// Therefore it does NOT have to display every
// topic/subtopic in that chapter.
//
// ==========================================================

function startTopic(topic) {
const topicId = topic?._id;
const chapterId = topic?.chapterId;


if (!topicId) {
  setError(
    "This concept does not have a valid ID."
  );
  return;
}

if (!chapterId) {
  setError(
    "This concept is not connected to a chapter."
  );
  return;
}

const target =
  "/theory/" +
  encodeURIComponent(
    String(chapterId)
  ) +
  "?topicId=" +
  encodeURIComponent(
    String(topicId)
  );

window.location.assign(target);


}

// ==========================================================
// UNLOCK TOPIC
// ==========================================================

async function unlockTopic(topic) {
if (!topic?._id) {
return;
}


// --------------------------------------------------------
// ALREADY UNLOCKED
// --------------------------------------------------------

if (
  isTopicUnlocked(topic._id)
) {
  startTopic(topic);
  return;
}

const payment =
  getTopicPayment(topic);

// --------------------------------------------------------
// CHECK LOGIN
// --------------------------------------------------------

if (error === "Please log in to unlock concepts.") {
  setError(
    "Please log in before unlocking a concept."
  );
  return;
}

// --------------------------------------------------------
// PAID - CHECK BALANCE
// --------------------------------------------------------

if (
  !payment.free &&
  coins < payment.cost
) {
  setError(
    "You need " +
      payment.cost.toLocaleString() +
      " coins. You currently have " +
      coins.toLocaleString() +
      "."
  );

  return;
}

// --------------------------------------------------------
// PAID - CONFIRM
// --------------------------------------------------------

if (!payment.free) {
  const confirmed =
    window.confirm(
      'Unlock "' +
        String(
          topic?.title || "this concept"
        ) +
        '" for ' +
        payment.cost.toLocaleString() +
        " coins?"
    );

  if (!confirmed) {
    return;
  }
}

// --------------------------------------------------------
// REQUEST
// --------------------------------------------------------

try {
  setUnlockingId(
    String(topic._id)
  );

  setError("");

  const response =
    await fetch(
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

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Unable to unlock concept. Status: " +
          response.status
    );
  }

  // ------------------------------------------------------
  // UPDATE COINS
  // ------------------------------------------------------

  if (
    data?.coins !== undefined
  ) {
    setCoins(
      Number(data.coins)
    );
  } else if (!payment.free) {
    setCoins((previous) => {
      return Math.max(
        0,
        previous - payment.cost
      );
    });
  }

  // ------------------------------------------------------
  // UPDATE UNLOCKED TOPICS
  // ------------------------------------------------------

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
      (previous) => {
        const exists =
          previous.some(
            (item) => {
              const id =
                typeof item ===
                "object"
                  ? item?._id
                  : item;

              return (
                String(
                  id ?? ""
                ) ===
                String(
                  topic._id
                )
              );
            }
          );

        if (exists) {
          return previous;
        }

        return [
          ...previous,
          topic._id,
        ];
      }
    );
  }

  // ------------------------------------------------------
  // OPEN THE SELECTED TOPIC ONLY
  // ------------------------------------------------------

  startTopic(topic);
} catch (err) {
  console.error(
    "UNLOCK TOPIC ERROR:",
    err
  );

  setError(
    err?.message ||
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
return ( <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-gray-300"> <div className="flex items-center gap-3 text-sm text-gray-400"> <Loader2
         size={20}
         className="animate-spin text-indigo-400"
       />


      <span>
        Loading concepts...
      </span>
    </div>
  </div>
);


}

// ==========================================================
// PAGE
// ==========================================================

return ( <div className="min-h-screen bg-[#0b0f19] font-sans text-gray-300">


  {/* ====================================================
      HEADER
  ==================================================== */}

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
            href="/topic"
            className="border-b-2 border-indigo-500 pb-4 text-white"
          >
            Concepts
          </a>
          <a
            href="/games"
            className="border-b-2 border-indigo-500 pb-4 text-white"
          >
            Games
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

  {/* ====================================================
      MAIN
  ==================================================== */}

  <main className="mx-auto max-w-7xl px-6 py-10">

    <a
      href="/dashboard"
      className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
    >
      <ArrowLeft size={16} />
      Back to dashboard
    </a>

    {/* ==================================================
        HERO
    ================================================== */}

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
              Explore subjects, chapters, and concepts.
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

    {/* ==================================================
        ERROR
    ================================================== */}

    {error && (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">

        <AlertCircle size={18} />

        <span className="flex-1">
          {error}
        </span>

        <button
          type="button"
          onClick={() =>
            setError("")
          }
          className="text-lg text-red-400 hover:text-white"
        >
          ×
        </button>

      </div>
    )}

    {/* ==================================================
        SUBJECTS
    ================================================== */}

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
            (subject, index) => {

              const subjectId =
                subject?._id;

              const active =
                String(
                  selectedSubject
                ) ===
                String(
                  subjectId
                );

              return (
                <button
                  type="button"
                  key={
                    subjectId ||
                    "subject-" +
                      index
                  }
                  onClick={() =>
                    handleSubjectChange(
                      subjectId
                    )
                  }
                  className={
                    "group rounded-xl border p-5 text-left transition " +
                    (active
                      ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.12)]"
                      : "border-gray-800 bg-[#0d1222] hover:border-gray-700 hover:bg-[#10172a]")
                  }
                >

                  <div className="mb-4 flex items-center justify-between">

                    <div
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-lg " +
                        (active
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-800 text-gray-400 group-hover:text-white")
                      }
                    >
                      <BookOpen size={19} />
                    </div>

                    {active && (
                      <CheckCircle2
                        size={18}
                        className="text-indigo-400"
                      />
                    )}

                  </div>

                  <h3 className="font-bold text-white">
                    {subject?.name ||
                      subject?.title ||
                      "Unnamed subject"}
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

    {/* ==================================================
        CHAPTERS
    ================================================== */}

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
            No chapters available for this subject.
          </div>
        ) : (
          <div className="space-y-2">

            {chaptersForSubject.map(
              (chapter, index) => {

                const chapterId =
                  chapter?._id;

                const active =
                  String(
                    selectedChapter
                  ) ===
                  String(
                    chapterId
                  );

                const count =
                  topics.filter(
                    (topic) => {
                      return (
                        String(
                          topic?.chapterId ??
                            ""
                        ) ===
                        String(
                          chapterId ??
                            ""
                        )
                      );
                    }
                  ).length;

                return (
                  <button
                    type="button"
                    key={
                      chapterId ||
                      "chapter-" +
                        index
                    }
                    onClick={() =>
                      handleChapterChange(
                        chapterId
                      )
                    }
                    className={
                      "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition " +
                      (active
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-gray-800 bg-[#0d1222] hover:border-gray-700 hover:bg-[#10172a]")
                    }
                  >

                    <div
                      className={
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold " +
                        (active
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-800 text-gray-500")
                      }
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
                        {chapter?.title ||
                          "Unnamed chapter"}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {count}{" "}
                        concepts available
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

    {/* ==================================================
        CONCEPTS / TOPICS
    ================================================== */}

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
              Select a concept to unlock or start it.
            </p>

          </div>

          <div className="relative w-full md:w-72">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
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
              (topic, index) => {

                const topicId =
                  topic?._id;

                const unlocked =
                  isTopicUnlocked(
                    topicId
                  );

                return (
                  <ConceptCard
                    key={
                      topicId ||
                      "topic-" +
                        index
                    }
                    topic={topic}
                    unlocked={unlocked}
                    coins={coins}
                    unlocking={
                      String(
                        unlockingId ??
                          ""
                      ) ===
                      String(
                        topicId ??
                          ""
                      )
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

  {/* ====================================================
      FOOTER
  ==================================================== */}

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
// SAFE JSON READER
// ============================================================

async function readJsonResponse(response) {
const contentType =
response.headers.get(
"content-type"
) || "";

if (
!contentType.includes(
"application/json"
)
) {
return null;
}

try {
return await response.json();
} catch {
return null;
}
}

// ============================================================
// NORMALIZE API ARRAY
// ============================================================

function normalizeArray(data, key) {
if (Array.isArray(data)) {
return data;
}

if (
data &&
Array.isArray(data[key])
) {
return data[key];
}

return [];
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
const payment =
getPaymentForTopic(topic);

const canAfford =
payment.free ||
coins >= payment.cost;

return (
<div
className={
"group relative overflow-hidden rounded-xl border p-5 transition " +
(unlocked
? "border-emerald-500/30 bg-emerald-500/5"
: "border-gray-800 bg-[#0d1222] hover:border-gray-700 hover:bg-[#10172a]")
}
>


  {/* TOP */}

  <div className="mb-5 flex items-start justify-between">

    <div
      className={
        "flex h-11 w-11 items-center justify-center rounded-xl " +
        (unlocked
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-indigo-500/10 text-indigo-400")
      }
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
    {topic?.title ||
      "Untitled concept"}
  </h3>

  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">
    {topic?.description ||
      "Learn this concept and strengthen your programming fundamentals."}
  </p>

  {/* BOTTOM */}

  <div className="mt-5 border-t border-gray-800 pt-4">

    {unlocked ? (

      // --------------------------------------------------
      // UNLOCKED
      // --------------------------------------------------

      <div>

        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-400">

          <CheckCircle2
            size={15}
          />

          Unlocked

        </div>

        <button
          type="button"
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

      // --------------------------------------------------
      // FREE
      // --------------------------------------------------

      <div>

        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-400">

          <BookOpen
            size={15}
          />

          Free concept

        </div>

        <button
          type="button"
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

      // --------------------------------------------------
      // PAID
      // --------------------------------------------------

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
          type="button"
          onClick={onUnlock}
          disabled={
            unlocking ||
            !canAfford
          }
          className={
            "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition " +
            (canAfford
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "cursor-not-allowed bg-gray-800 text-gray-600")
          }
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
              <Unlock size={16} />

              Unlock Concept
            </>
          ) : (
            <>
              <Lock size={16} />

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

// ============================================================
// PAYMENT HELPER
// ============================================================

function getPaymentForTopic(topic) {
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
0;

const numericCost =
Number(rawCost);

const cost =
Number.isFinite(numericCost)
? Math.max(0, numericCost)
: 0;

return {
free: cost <= 0,
cost,
};
}
