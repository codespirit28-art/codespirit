"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Coins,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

// ============================================================
// MAIN PAGE
// ============================================================

export default function TheoryPage() {
  const params = useParams();
  const router = useRouter();

  const chapterId = params?.id;

  const [chapter, setChapter] =
    useState(null);

  const [chapters, setChapters] =
    useState([]);

  const [topics, setTopics] =
    useState([]);

  const [theories, setTheories] =
    useState([]);

  const [coins, setCoins] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    if (!chapterId) return;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");

        // ======================================================
        // USER
        // ======================================================

        try {
          const userRes =
            await fetch(
              "/api/user/me",
              {
                cache: "no-store",
                credentials: "include",
              }
            );

          const userData =
            await userRes.json();

          console.log(
            "USER DATA:",
            userData
          );

          if (userRes.ok) {
            setCoins(
              Number(
                userData?.user
                  ?.progress?.coins || 0
              )
            );
          }
        } catch (err) {
          console.error(
            "USER LOAD ERROR:",
            err
          );
        }

        // ======================================================
        // CHAPTERS
        // ======================================================

        const chaptersRes =
          await fetch(
            "/api/chapters",
            {
              cache: "no-store",
            }
          );

        if (!chaptersRes.ok) {
          throw new Error(
            "Unable to load chapters."
          );
        }

        const chaptersData =
          await chaptersRes.json();

        console.log(
          "ALL CHAPTERS:",
          chaptersData
        );

        const allChapters =
          Array.isArray(
            chaptersData
          )
            ? chaptersData
            : chaptersData?.chapters ||
              [];

        // ======================================================
        // CURRENT CHAPTER
        // ======================================================

        const currentChapter =
          allChapters.find(
            (item) =>
              String(item._id) ===
              String(chapterId)
          );

        console.log(
          "CURRENT CHAPTER:",
          currentChapter
        );

        if (!currentChapter) {
          throw new Error(
            "Chapter not found."
          );
        }

        setChapter(
          currentChapter
        );

        // ======================================================
        // CHAPTERS FROM SAME SUBJECT
        // ======================================================

        const sameSubject =
          allChapters
            .filter(
              (item) =>
                String(
                  item.subjectId
                ) ===
                String(
                  currentChapter.subjectId
                )
            )
            .sort(
              (a, b) =>
                Number(
                  a.order || 0
                ) -
                Number(
                  b.order || 0
                )
            );

        setChapters(
          sameSubject
        );

        // ======================================================
        // TOPICS
        // ======================================================

        const topicsRes =
          await fetch(
            `/api/topics?chapterId=${chapterId}`,
            {
              cache: "no-store",
            }
          );

        if (!topicsRes.ok) {
          throw new Error(
            "Unable to load topics."
          );
        }

        const topicsData =
          await topicsRes.json();

        console.log(
          "TOPICS API RESPONSE:",
          topicsData
        );

        const chapterTopics =
          Array.isArray(
            topicsData
          )
            ? topicsData
            : topicsData?.topics ||
              [];

        console.log(
          "CHAPTER TOPICS:",
          chapterTopics
        );

        setTopics(
          chapterTopics
        );

        // ======================================================
        // LOAD THEORIES
        // ======================================================

        let allTheories = [];

        for (
          const topic of chapterTopics
        ) {
          try {
            const theoryUrl =
              `/api/theories?mainTopicId=${topic._id}`;

            console.log(
              "REQUESTING THEORY:",
              theoryUrl
            );

            const theoryRes =
              await fetch(
                theoryUrl,
                {
                  cache:
                    "no-store",
                }
              );

            let theoryData =
              null;

            try {
              theoryData =
                await theoryRes.json();
            } catch {
              theoryData =
                null;
            }

            console.log(
              "THEORY RESPONSE:",
              {
                topicId:
                  topic._id,

                topicTitle:
                  topic.title,

                status:
                  theoryRes.status,

                ok:
                  theoryRes.ok,

                data:
                  theoryData,
              }
            );

            if (!theoryRes.ok) {
              console.error(
                "THEORY API ERROR:",
                theoryData
              );

              continue;
            }

            const topicTheories =
              Array.isArray(
                theoryData
              )
                ? theoryData
                : theoryData?.theories ||
                  [];

            console.log(
              "TOPIC THEORIES:",
              topic.title,
              topicTheories
            );

            allTheories.push(
              ...topicTheories
            );
          } catch (err) {
            console.error(
              "THEORY FETCH ERROR:",
              topic._id,
              err
            );
          }
        }

        // ======================================================
        // FINAL THEORIES
        // ======================================================

        console.log(
          "FINAL THEORIES:",
          allTheories
        );

        setTheories(
          allTheories
        );
      } catch (err) {
        console.error(
          "THEORY PAGE ERROR:",
          err
        );

        setError(
          err.message ||
            "Unable to load theory."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [chapterId]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080a11] text-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2
            size={18}
            className="animate-spin text-indigo-500"
          />

          Loading theory...
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !chapter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080a11] px-6 text-slate-200">
        <BookOpen
          size={40}
          className="mb-4 text-red-400"
        />

        <h1 className="text-xl font-bold text-white">
          Unable to load theory
        </h1>

        <p className="mt-2 max-w-md text-center text-sm text-slate-500">
          {error ||
            "The requested chapter could not be loaded."}
        </p>

        <button
          onClick={() =>
            router.push("/topic")
          }
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Back to Topics
        </button>
      </div>
    );
  }

  // ==========================================================
  // PREVIOUS / NEXT
  // ==========================================================

  const currentIndex =
    chapters.findIndex(
      (item) =>
        String(item._id) ===
        String(chapter._id)
    );

  const previousChapter =
    currentIndex > 0
      ? chapters[
          currentIndex - 1
        ]
      : null;

  const nextChapter =
    currentIndex >= 0 &&
      currentIndex <
        chapters.length - 1
      ? chapters[
          currentIndex + 1
        ]
      : null;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#080a11] text-slate-200">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-900 bg-[#080a11]/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            onClick={() =>
              router.push("/topic")
            }
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Topics
          </button>

          {/* COINS */}

          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">

            <Coins
              size={16}
              className="text-yellow-400"
            />

            <span className="text-sm font-bold text-yellow-400">
              {coins.toLocaleString()}
            </span>

          </div>

        </div>

      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="hidden w-60 shrink-0 lg:block">

          <div className="sticky top-24">

            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Chapters
            </p>

            <div className="space-y-1">

              {chapters.map(
                (
                  item,
                  index
                ) => {

                  const active =
                    String(
                      item._id
                    ) ===
                    String(
                      chapter._id
                    );

                  return (
                    <button
                      key={
                        item._id
                      }
                      onClick={() =>
                        router.push(
                          `/theory/${item._id}`
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                      }`}
                    >

                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold">
                        {index + 1}
                      </span>

                      <span className="truncate">
                        {item.title}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </aside>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="min-w-0 max-w-4xl flex-1">

          {/* CHAPTER HEADER */}

          <div className="mb-10">

            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">

              <BookOpen
                size={14}
              />

              Theory

            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {chapter.title}
            </h1>

            {chapter.description && (
              <p className="mt-4 text-base leading-7 text-slate-400">
                {
                  chapter.description
                }
              </p>
            )}

          </div>

          {/* =================================================
              THEORY CONTENT
          ================================================= */}

          {theories.length ===
          0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#0d111c] p-8 text-center">

              <BookOpen
                size={32}
                className="mx-auto mb-3 text-slate-600"
              />

              <h2 className="text-lg font-bold text-white">
                Theory not available
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                No theory content was returned
                for the topics in this chapter.
              </p>

              <p className="mt-3 text-xs text-slate-700">
                Check the browser console for
                the /api/theories response.
              </p>

            </div>
          ) : (
            <div className="space-y-12">

              {topics.map(
                (topic) => {

                  const topicTheories =
                    theories.filter(
                      (theory) =>
                        String(
                          theory.mainTopicId
                        ) ===
                        String(
                          topic._id
                        )
                    );

                  if (
                    topicTheories.length ===
                    0
                  ) {
                    return null;
                  }

                  return (
                    <section
                      key={
                        topic._id
                      }
                    >

                      <div className="mb-6">

                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
                          Subtopic
                        </p>

                        <h2 className="text-2xl font-bold text-white">
                          {
                            topic.title
                          }
                        </h2>

                      </div>

                      <div className="space-y-10">

                        {topicTheories.map(
                          (
                            theory
                          ) => (
                            <article
                              key={
                                theory._id
                              }
                            >

                              <h3 className="mb-8 text-3xl font-extrabold text-white">
                                {
                                  theory.title
                                }
                              </h3>

                              <TheoryBlocks
                                blocks={
                                  theory.blocks ||
                                  []
                                }
                              />

                            </article>
                          )
                        )}

                      </div>

                    </section>
                  );
                }
              )}

            </div>
          )}

          {/* =================================================
              PREVIOUS / NEXT
          ================================================= */}

          <div className="mt-14 grid grid-cols-1 gap-4 border-t border-slate-900 pt-8 sm:grid-cols-2">

            {previousChapter ? (
              <button
                onClick={() =>
                  router.push(
                    `/theory/${previousChapter._id}`
                  )
                }
                className="rounded-xl border border-slate-800 bg-[#0d111c] p-5 text-left transition hover:border-indigo-500/30"
              >

                <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">

                  <ArrowLeft
                    size={12}
                  />

                  Previous

                </p>

                <p className="text-sm font-semibold text-slate-300">
                  {
                    previousChapter.title
                  }
                </p>

              </button>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <button
                onClick={() =>
                  router.push(
                    `/theory/${nextChapter._id}`
                  )
                }
                className="rounded-xl border border-slate-800 bg-[#0d111c] p-5 text-right transition hover:border-indigo-500/30"
              >

                <p className="mb-2 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">

                  Next

                  <ArrowRight
                    size={12}
                  />

                </p>

                <p className="text-sm font-semibold text-slate-300">
                  {
                    nextChapter.title
                  }
                </p>

              </button>
            ) : (
              <div />
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

// ============================================================
// THEORY BLOCKS
// ============================================================

function TheoryBlocks({
  blocks = [],
}) {
  if (!Array.isArray(blocks)) {
    return null;
  }

  return (
    <div className="space-y-8">

      {blocks.map(
        (block, index) => (
          <TheoryBlock
            key={
              block.id ||
              block._id ||
              `block-${index}`
            }
            block={block}
          />
        )
      )}

    </div>
  );
}

// ============================================================
// SINGLE THEORY BLOCK
// ============================================================

function TheoryBlock({
  block,
}) {
  if (!block) {
    return null;
  }

  switch (block.type) {

    // ========================================================
    // HEADING
    // ========================================================

    case "heading":
      return (
        <h2 className="mt-10 text-2xl font-bold text-white">
          {block.text}
        </h2>
      );

    // ========================================================
    // SUBHEADING
    // ========================================================

    case "subheading":
      return (
        <h3 className="text-xl font-semibold text-slate-100">
          {block.text}
        </h3>
      );

    // ========================================================
    // PARAGRAPH
    // ========================================================

    case "paragraph":
      return (
        <p className="whitespace-pre-wrap text-base leading-8 text-slate-400">
          {block.text}
        </p>
      );

    // ========================================================
    // BULLET
    // ========================================================

    case "bulletList":
      return (
        <ul className="list-disc space-y-2 pl-6 text-slate-400">
          {(block.items || [])
            .filter(Boolean)
            .map(
              (item, index) => (
                <li
                  key={index}
                >
                  {item}
                </li>
              )
            )}
        </ul>
      );

    // ========================================================
    // NUMBER
    // ========================================================

    case "numberList":
      return (
        <ol className="list-decimal space-y-2 pl-6 text-slate-400">
          {(block.items || [])
            .filter(Boolean)
            .map(
              (item, index) => (
                <li
                  key={index}
                >
                  {item}
                </li>
              )
            )}
        </ol>
      );

    // ========================================================
    // IMAGE
    // ========================================================

    case "image":
      return (
        <figure>

          <img
            src={block.url}
            alt={
              block.alt ||
              "Theory image"
            }
            className="max-h-[600px] w-full rounded-xl border border-slate-800 object-contain"
          />

          {block.caption && (
            <figcaption className="mt-2 text-center text-xs text-slate-600">
              {
                block.caption
              }
            </figcaption>
          )}

        </figure>
      );

    // ========================================================
    // IMAGE CAROUSEL
    // ========================================================

    case "imageCarousel":
      return (
        <ImageCarousel
          images={
            block.images ||
            []
          }
        />
      );

    // ========================================================
    // VIDEO
    // ========================================================

    case "video":
      return (
        <VideoBlock
          block={block}
        />
      );

    // ========================================================
    // LINK
    // ========================================================

    case "link":
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/20"
        >
          {block.label ||
            block.url}
        </a>
      );

    // ========================================================
    // CODE
    // ========================================================

    case "code":
      return (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#05070c]">

          <div className="border-b border-slate-800 px-4 py-2 text-xs text-slate-600">
            {block.language ||
              "code"}
          </div>

          <pre className="overflow-x-auto p-5">
            <code className="font-mono text-sm leading-7 text-emerald-300">
              {block.code}
            </code>
          </pre>

        </div>
      );

    // ========================================================
    // CALLOUT
    // ========================================================

    case "callout":
      return (
        <div
          className={`rounded-xl border p-5 ${
            block.tone ===
            "success"
              ? "border-emerald-500/20 bg-emerald-500/5"
              : block.tone ===
                "warning"
              ? "border-yellow-500/20 bg-yellow-500/5"
              : "border-indigo-500/20 bg-indigo-500/5"
          }`}
        >

          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
            {block.text}
          </p>

        </div>
      );

    // ========================================================
    // QUESTION
    // ========================================================

    case "question":
      return (
        <QuestionBlock
          block={block}
        />
      );

    // ========================================================
    // DIVIDER
    // ========================================================

    case "divider":
      return (
        <hr className="border-slate-800" />
      );

    default:
      console.warn(
        "Unknown theory block type:",
        block.type,
        block
      );

      return null;
  }
}

// ============================================================
// VIDEO BLOCK
// ============================================================

function VideoBlock({
  block,
}) {
  const getEmbedUrl = (
    url
  ) => {
    if (!url) return "";

    try {
      const parsed =
        new URL(url);

      if (
        parsed.hostname.includes(
          "youtube.com"
        )
      ) {
        const id =
          parsed.searchParams.get(
            "v"
          );

        return id
          ? `https://www.youtube.com/embed/${id}`
          : url;
      }

      if (
        parsed.hostname.includes(
          "youtu.be"
        )
      ) {
        const id =
          parsed.pathname.slice(1);

        return id
          ? `https://www.youtube.com/embed/${id}`
          : url;
      }

      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d111c]">

      <div className="aspect-video">

        <iframe
          src={getEmbedUrl(
            block.url
          )}
          title={
            block.title ||
            "Theory video"
          }
          className="h-full w-full"
          allowFullScreen
        />

      </div>

      {(block.title ||
        block.description) && (
        <div className="p-5">

          {block.title && (
            <h3 className="text-lg font-bold text-white">
              {block.title}
            </h3>
          )}

          {block.description && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {
                block.description
              }
            </p>
          )}

        </div>
      )}

    </div>
  );
}

// ============================================================
// IMAGE CAROUSEL
// ============================================================

function ImageCarousel({
  images = [],
}) {
  const validImages =
    Array.isArray(images)
      ? images.filter(
          (image) =>
            image?.url
        )
      : [];

  const [
    current,
    setCurrent,
  ] = useState(0);

  if (
    validImages.length ===
    0
  ) {
    return null;
  }

  const image =
    validImages[current];

  const previous =
    () => {
      setCurrent(
        current === 0
          ? validImages.length - 1
          : current - 1
      );
    };

  const next = () => {
    setCurrent(
      current ===
        validImages.length - 1
        ? 0
        : current + 1
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d111c]">

      <div className="relative">

        <img
          src={image.url}
          alt={
            image.alt ||
            "Carousel image"
          }
          className="h-auto max-h-[600px] w-full object-contain"
        />

        {validImages.length >
          1 && (
          <>
            <button
              onClick={
                previous
              }
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <ChevronLeft
                size={20}
              />
            </button>

            <button
              onClick={next}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <ChevronRight
                size={20}
              />
            </button>
          </>
        )}

      </div>

      <div className="flex items-center justify-between p-4">

        <div>

          {image.caption && (
            <p className="text-sm text-slate-400">
              {
                image.caption
              }
            </p>
          )}

          {validImages.length >
            1 && (
            <p className="mt-1 text-xs text-slate-600">
              {current + 1} /{" "}
              {
                validImages.length
              }
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

// ============================================================
// INTERACTIVE QUESTION
// ============================================================

function QuestionBlock({
  block,
}) {
  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const options =
    block.options || [];

  const submitAnswer = () => {
    if (
      selected === null
    ) {
      return;
    }

    setSubmitted(true);
  };

  const reset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">

      <div className="mb-5">

        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
          Quick Question
        </p>

        <h3 className="text-xl font-bold leading-8 text-white">
          {
            block.question
          }
        </h3>

      </div>

      <div className="space-y-3">

        {options.map(
          (option, index) => {

            const isCorrect =
              Number(
                block.correctAnswer
              ) === index;

            const isSelected =
              selected ===
              index;

            let style =
              "border-slate-800 bg-[#0b0e14] text-slate-300";

            if (
              submitted &&
              isCorrect
            ) {
              style =
                "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
            } else if (
              submitted &&
              isSelected &&
              !isCorrect
            ) {
              style =
                "border-red-500/40 bg-red-500/10 text-red-300";
            } else if (
              isSelected
            ) {
              style =
                "border-indigo-500 bg-indigo-500/10 text-indigo-300";
            }

            return (
              <button
                key={index}
                disabled={
                  submitted
                }
                onClick={() =>
                  setSelected(
                    index
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${style}`}
              >

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {String.fromCharCode(
                    65 + index
                  )}
                </span>

                <span className="flex-1">
                  {option}
                </span>

                {submitted &&
                  isCorrect && (
                    <CheckCircle2
                      size={19}
                    />
                  )}

                {submitted &&
                  isSelected &&
                  !isCorrect && (
                    <XCircle
                      size={19}
                    />
                  )}

              </button>
            );
          }
        )}

      </div>

      {!submitted ? (
        <button
          onClick={
            submitAnswer
          }
          disabled={
            selected === null
          }
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Check Answer
        </button>
      ) : (
        <div className="mt-5">

          <div
            className={`rounded-xl border p-4 ${
              selected ===
              Number(
                block.correctAnswer
              )
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5"
            }`}
          >

            <p className="font-semibold text-white">
              {selected ===
              Number(
                block.correctAnswer
              )
                ? "Correct! 🎉"
                : "Not quite."}
            </p>

            {block.explanation && (
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {
                  block.explanation
                }
              </p>
            )}

          </div>

          <button
            onClick={reset}
            className="mt-4 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
          >
            Try again
          </button>

        </div>
      )}

    </div>
  );
}
