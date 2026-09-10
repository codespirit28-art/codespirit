"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

import {
  HelpCircle,
  ListChecks,
  Code2,
  Info,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  X,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Settings2,
  TestTube2,
  BookOpen,
  Tag,
  CheckCircle2,
  Coins,
} from "lucide-react";

/* =========================================================
   QUESTION TYPES
========================================================= */

const QUESTION_TYPES = [
  {
    type: "mcq",
    label: "Single Correct MCQ",
    description: "One correct answer",
    icon: HelpCircle,
  },
  {
    type: "multiple",
    label: "Multiple Correct",
    description: "More than one correct answer",
    icon: ListChecks,
  },
  {
    type: "coding",
    label: "Coding Question",
    description: "Programming problem",
    icon: Code2,
  },
];

/* =========================================================
   DIFFICULTIES
========================================================= */

const DIFFICULTIES = [
  "Easy",
  "Medium",
  "Hard",
];

/* =========================================================
   LANGUAGES
========================================================= */

const LANGUAGES = [
  {
    value: "javascript",
    label: "JavaScript",
  },
  {
    value: "python",
    label: "Python",
  },
  {
    value: "java",
    label: "Java",
  },
  {
    value: "cpp",
    label: "C++",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function createQuestionId() {
  return `question-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function createOptionId(questionId) {
  return `${questionId}-option-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/* =========================================================
   EMPTY QUESTION
========================================================= */

function emptyQuestion(type = "mcq") {
  const id = createQuestionId();

  /* =======================================================
     CODING QUESTION
  ======================================================= */

  if (type === "coding") {
    return {
      id,

      type: "coding",

      title: "",

      statement: "",

      difficulty: "Easy",

      marks: 10,

      negativeMarks: 0,

      /*
       * COINS
       *
       * This is the number of coins awarded
       * when the user correctly solves this
       * coding question.
       */
      coins: 20,

      tags: [],

      inputFormat: "",

      outputFormat: "",

      constraints: "",

      language: "java",

      examples: [
        {
          input: "",
          output: "",
          explanation: "",
        },
      ],

      starterCode: {
        javascript: "",
        python: "",
        java: "",
        cpp: "",
      },

      testCases: [
        {
          input: "",
          output: "",
          explanation: "",
          hidden: true,
        },
      ],

      explanation: "",
    };
  }

  /* =======================================================
     MCQ / MULTIPLE QUESTION
  ======================================================= */

  return {
    id,

    type,

    title: "",

    statement: "",

    difficulty: "Easy",

    marks: 1,

    negativeMarks: 0,

    /*
     * COINS
     *
     * Default coin reward for this question.
     */
    coins: 5,

    tags: [],

    options: [
      {
        id: createOptionId(id),
        text: "",
        correct: false,
      },

      {
        id: createOptionId(id),
        text: "",
        correct: false,
      },

      {
        id: createOptionId(id),
        text: "",
        correct: false,
      },

      {
        id: createOptionId(id),
        text: "",
        correct: false,
      },
    ],

    explanation: "",

    code: "",

    inputFormat: "",

    outputFormat: "",

    constraints: "",

    examples: [
      {
        input: "",
        output: "",
        explanation: "",
      },
    ],
  };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function QuizBuilderPage() {
  const [subjects, setSubjects] = useState([]);

  const [chapters, setChapters] = useState([]);

  const [topics, setTopics] = useState([]);

  const [isLoadingRefs, setIsLoadingRefs] =
    useState(true);

  const [activeSubject, setActiveSubject] =
    useState("");

  const [activeChapter, setActiveChapter] =
    useState("");

  const [mainTopicId, setMainTopicId] =
    useState("");

  const [quizTitle, setQuizTitle] =
    useState("");

  const [quizDescription, setQuizDescription] =
    useState("");

  const [quizDuration, setQuizDuration] =
    useState(30);

  const [quizTotalMarks, setQuizTotalMarks] =
    useState(0);

  /*
   * Total coins possible in this quiz.
   */
  const [quizTotalCoins, setQuizTotalCoins] =
    useState(0);

  const [questions, setQuestions] =
    useState([]);

  const [status, setStatus] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [quizId, setQuizId] =
    useState(null);

  const [dragId, setDragId] =
    useState(null);

  /* =========================================================
     CHAPTERS FOR SUBJECT
  ========================================================= */

  const chaptersForSubject = useMemo(() => {
    return chapters.filter(
      (chapter) =>
        String(chapter.subjectId) ===
        String(activeSubject)
    );
  }, [
    chapters,
    activeSubject,
  ]);

  /* =========================================================
     TOPICS FOR CHAPTER
  ========================================================= */

  const topicsForChapter = useMemo(() => {
    return topics
      .filter(
        (topic) =>
          String(topic.chapterId) ===
          String(activeChapter)
      )
      .sort(
        (a, b) =>
          Number(a.order || 0) -
          Number(b.order || 0)
      );
  }, [
    topics,
    activeChapter,
  ]);

  /* =========================================================
     CALCULATE TOTAL MARKS + TOTAL COINS
  ========================================================= */

  useEffect(() => {
    const totalMarks = questions.reduce(
      (sum, question) =>
        sum +
        Number(question.marks || 0),
      0
    );

    const totalCoins = questions.reduce(
      (sum, question) =>
        sum +
        Number(question.coins || 0),
      0
    );

    setQuizTotalMarks(totalMarks);

    setQuizTotalCoins(totalCoins);
  }, [questions]);

  /* =========================================================
     LOAD REFERENCES
  ========================================================= */

  useEffect(() => {
    async function loadReferences() {
      setIsLoadingRefs(true);

      try {
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

          setActiveSubject(
            (previous) =>
              previous ||
              data[0]?._id ||
              ""
          );
        }

        if (chaptersRes.ok) {
          const data =
            await chaptersRes.json();

          setChapters(data);
        }

        if (topicsRes.ok) {
          const data =
            await topicsRes.json();

          setTopics(data);
        }
      } catch (error) {
        console.error(
          "Failed to load references:",
          error
        );

        showStatus(
          "Failed to load subjects/topics"
        );
      } finally {
        setIsLoadingRefs(false);
      }
    }

    loadReferences();
  }, []);

  /* =========================================================
     AUTO SELECT CHAPTER
  ========================================================= */

  useEffect(() => {
    if (
      chaptersForSubject.length ===
      0
    ) {
      setActiveChapter("");
      return;
    }

    const exists =
      chaptersForSubject.some(
        (chapter) =>
          String(chapter._id) ===
          String(activeChapter)
      );

    if (!exists) {
      setActiveChapter(
        chaptersForSubject[0]._id
      );
    }
  }, [
    chaptersForSubject,
    activeChapter,
  ]);

  /* =========================================================
     AUTO SELECT TOPIC
  ========================================================= */

  useEffect(() => {
    if (
      topicsForChapter.length ===
      0
    ) {
      setMainTopicId("");
      return;
    }

    const exists =
      topicsForChapter.some(
        (topic) =>
          String(topic._id) ===
          String(mainTopicId)
      );

    if (!exists) {
      setMainTopicId(
        topicsForChapter[0]._id
      );
    }
  }, [
    topicsForChapter,
    mainTopicId,
  ]);

  /* =========================================================
     ADD QUESTION
  ========================================================= */

  const addQuestion = useCallback(
    (type = "mcq") => {
      setQuestions((previous) => [
        ...previous,
        emptyQuestion(type),
      ]);
    },
    []
  );

  /* =========================================================
     UPDATE QUESTION
  ========================================================= */

  const updateQuestion = useCallback(
    (id, patch) => {
      setQuestions((previous) =>
        previous.map((question) =>
          question.id === id
            ? {
                ...question,
                ...patch,
              }
            : question
        )
      );
    },
    []
  );

  /* =========================================================
     REMOVE QUESTION
  ========================================================= */

  const removeQuestion = useCallback(
    (id) => {
      setQuestions((previous) =>
        previous.filter(
          (question) =>
            question.id !== id
        )
      );
    },
    []
  );

  /* =========================================================
     MOVE QUESTION
  ========================================================= */

  const moveQuestion = useCallback(
    (id, direction) => {
      setQuestions((previous) => {
        const index =
          previous.findIndex(
            (question) =>
              question.id === id
          );

        if (index < 0) {
          return previous;
        }

        const newIndex =
          direction === "up"
            ? index - 1
            : index + 1;

        if (
          newIndex < 0 ||
          newIndex >=
            previous.length
        ) {
          return previous;
        }

        const next = [
          ...previous,
        ];

        [
          next[index],
          next[newIndex],
        ] = [
          next[newIndex],
          next[index],
        ];

        return next;
      });
    },
    []
  );

  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const handleDrop = (targetId) => {
    if (
      !dragId ||
      dragId === targetId
    ) {
      return;
    }

    setQuestions((previous) => {
      const from =
        previous.findIndex(
          (question) =>
            question.id === dragId
        );

      const to =
        previous.findIndex(
          (question) =>
            question.id === targetId
        );

      if (
        from < 0 ||
        to < 0
      ) {
        return previous;
      }

      const next = [
        ...previous,
      ];

      const [moved] =
        next.splice(from, 1);

      next.splice(
        to,
        0,
        moved
      );

      return next;
    });

    setDragId(null);
  };

  /* =========================================================
     SAVE QUIZ
  ========================================================= */

  async function handleSave(publish) {
    if (!quizTitle.trim()) {
      showStatus(
        "Add a quiz title first"
      );

      return;
    }

    if (!mainTopicId) {
      showStatus(
        "Pick a subtopic first"
      );

      return;
    }

    if (
      questions.length === 0
    ) {
      showStatus(
        "Add at least one question"
      );

      return;
    }

    /*
     * Validate questions before saving.
     */

    for (
      let index = 0;
      index < questions.length;
      index++
    ) {
      const question =
        questions[index];

      if (!question.title?.trim()) {
        showStatus(
          `Add a title for question ${
            index + 1
          }`
        );

        return;
      }

      if (
        question.type ===
        "coding"
      ) {
        if (
          Number(
            question.coins || 0
          ) < 0
        ) {
          showStatus(
            `Invalid coins for question ${
              index + 1
            }`
          );

          return;
        }
      }
    }

    setSaving(true);

    /* =======================================================
       NORMALIZE QUESTIONS
    ======================================================= */

    const normalizedQuestions =
      questions.map(
        (question) => {
          return {
            type:
              question.type,

            title:
              question.title ||
              "",

            question:
              question.title ||
              "",

            statement:
              question.statement ||
              "",

            explanation:
              question.explanation ||
              "",

            marks: Number(
              question.marks || 0
            ),

            points: Number(
              question.marks || 0
            ),

            negativeMarks:
              Number(
                question.negativeMarks ||
                  0
              ),

            /*
             * IMPORTANT:
             * Save coins with every question.
             */
            coins: Number(
              question.coins || 0
            ),

            difficulty:
              question.difficulty ||
              "Easy",

            tags:
              Array.isArray(
                question.tags
              )
                ? question.tags
                : [],

            inputFormat:
              question.inputFormat ||
              "",

            outputFormat:
              question.outputFormat ||
              "",

            constraints:
              question.constraints ||
              "",

            options:
              Array.isArray(
                question.options
              )
                ? question.options.map(
                    (option) => ({
                      text:
                        option.text ||
                        "",

                      isCorrect:
                        Boolean(
                          option.correct ??
                            option.isCorrect ??
                            false
                        ),
                    })
                  )
                : [],

            language:
              question.language ||
              "java",

            starterCode:
              normalizeStarterCode(
                question.starterCode
              ),

            testCases:
              normalizeTestCases(
                question.testCases
              ),

            examples:
              normalizeExamples(
                question.examples
              ),

            problemStatement:
              question.statement ||
              "",
          };
        }
      );

    /* =======================================================
       PAYLOAD
    ======================================================= */

    const payload = {
      mainTopicId,

      title:
        quizTitle.trim(),

      description:
        quizDescription.trim(),

      duration: Number(
        quizDuration || 30
      ),

      timeLimit: Number(
        quizDuration || 30
      ),

      totalMarks:
        quizTotalMarks,

      /*
       * Total possible coins in this quiz.
       */
      totalCoins:
        quizTotalCoins,

      questionCount:
        normalizedQuestions.length,

      status: publish
        ? "published"
        : "draft",

      questions:
        normalizedQuestions,
    };

    console.log(
      "QUIZ PAYLOAD:",
      payload
    );

    /* =======================================================
       SAVE
    ======================================================= */

    try {
      let response;

      if (quizId) {
        response = await fetch(
          "/api/quizzes",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: quizId,
              ...payload,
            }),
          }
        );
      } else {
        response = await fetch(
          "/api/quizzes",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      /*
       * Protect against HTML error pages.
       */
      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data = {};

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        console.error(
          "NON JSON RESPONSE:",
          text
        );

        showStatus(
          "Server returned an invalid response"
        );

        return;
      }

      if (!response.ok) {
        console.error(
          "SAVE QUIZ ERROR:",
          data
        );

        showStatus(
          data.message ||
            data.error ||
            "Save failed"
        );

        return;
      }

      setQuizId(
        data._id ||
          data.quiz?._id ||
          quizId
      );

      showStatus(
        publish
          ? "Quiz published successfully"
          : "Draft saved successfully"
      );
    } catch (error) {
      console.error(
        "Quiz save error:",
        error
      );

      showStatus(
        error?.message ||
          "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     STATUS
  ========================================================= */

  function showStatus(message) {
    setStatus(message);

    setTimeout(() => {
      setStatus("");
    }, 3000);
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0b0e14]/95 px-6 py-3 backdrop-blur">

        <div className="flex items-center gap-2 text-sm text-slate-400">

          <span className="font-semibold text-slate-100">
            Quiz Builder
          </span>

          <span className="text-slate-600">
            /
          </span>

          <span>
            Assessments
          </span>

          <span className="text-slate-600">
            /
          </span>

          <span className="text-violet-300">
            {quizId
              ? "Editing"
              : "New quiz"}
          </span>

        </div>

        <div className="flex items-center gap-3">

          {status && (
            <span className="text-xs font-medium text-emerald-400">
              {status}
            </span>
          )}

          <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">

            <span>
              {questions.length}{" "}
              questions
            </span>

            <span>•</span>

            <span>
              {quizTotalMarks} marks
            </span>

            <span>•</span>

            <span>
              {quizTotalCoins} coins
            </span>

            <span>•</span>

            <span>
              {quizDuration} min
            </span>

          </div>

          <button
            type="button"
            onClick={() =>
              handleSave(false)
            }
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
          >

            {saving && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            Save draft

          </button>

          <button
            type="button"
            onClick={() =>
              handleSave(true)
            }
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >

            {saving && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            Publish

          </button>

        </div>

      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">

        {/* ===================================================
            LEFT TOOLBAR
        =================================================== */}

        <aside className="sticky top-[64px] h-[calc(100vh-88px)] w-64 shrink-0 overflow-y-auto pr-2">

          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Add question
          </p>

          <div className="space-y-2">

            {QUESTION_TYPES.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() =>
                      addQuestion(
                        item.type
                      )
                    }
                    className="group flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-left hover:border-violet-500/30 hover:bg-violet-500/5"
                  >

                    <div className="mt-0.5 rounded-md bg-violet-500/10 p-2 text-violet-400">

                      <Icon
                        size={17}
                      />

                    </div>

                    <div className="min-w-0">

                      <div className="text-sm font-medium text-slate-200">
                        {item.label}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        {
                          item.description
                        }
                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>

          <div className="my-6 border-t border-white/10" />

          {/* =================================================
              QUIZ SETTINGS
          ================================================= */}

          <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">

            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-violet-300">

              <Settings2
                size={14}
              />

              Quiz settings

            </div>

            <div className="space-y-3">

              {/* DURATION */}

              <div>

                <label className="mb-1 block text-[11px] text-slate-500">
                  Duration
                </label>

                <div className="flex items-center gap-2">

                  <input
                    type="number"
                    min="1"
                    value={
                      quizDuration
                    }
                    onChange={(e) =>
                      setQuizDuration(
                        Math.max(
                          1,
                          Number(
                            e.target
                              .value
                          ) || 1
                        )
                      )
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-2 py-1.5 text-sm outline-none focus:border-violet-500"
                  />

                  <span className="text-xs text-slate-600">
                    min
                  </span>

                </div>

              </div>

              {/* TOTAL MARKS */}

              <div>

                <label className="mb-1 block text-[11px] text-slate-500">
                  Total marks
                </label>

                <div className="rounded-md border border-white/10 bg-[#0b0e14] px-2 py-1.5 text-sm text-slate-300">
                  {quizTotalMarks}
                </div>

              </div>

              {/* TOTAL COINS */}

              <div>

                <label className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">

                  <Coins
                    size={12}
                  />

                  Total possible coins

                </label>

                <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-sm font-medium text-amber-300">

                  {quizTotalCoins}

                </div>

              </div>

            </div>

          </div>

        </aside>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="min-w-0 flex-1 space-y-4">

          {/* =================================================
              QUIZ DETAILS
          ================================================= */}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

            <div className="mb-4 flex items-center gap-2">

              <BookOpen
                size={17}
                className="text-violet-400"
              />

              <h2 className="text-sm font-semibold text-slate-200">
                Quiz details
              </h2>

            </div>

            {/* TITLE */}

            <label className="mb-1.5 block text-xs text-slate-500">
              Quiz title
            </label>

            <input
              value={quizTitle}
              onChange={(e) =>
                setQuizTitle(
                  e.target.value
                )
              }
              placeholder="Java Programming Quiz"
              className="mb-4 w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-lg font-semibold text-slate-100 outline-none focus:border-violet-500"
            />

            {/* DESCRIPTION */}

            <label className="mb-1.5 block text-xs text-slate-500">
              Description
            </label>

            <textarea
              value={
                quizDescription
              }
              onChange={(e) =>
                setQuizDescription(
                  e.target.value
                )
              }
              placeholder="Test your understanding of Java programming..."
              rows={3}
              className="mb-4 w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm leading-relaxed outline-none focus:border-violet-500"
            />

            {/* SUBJECT / CHAPTER / TOPIC */}

            <div className="grid gap-3 sm:grid-cols-3">

              {/* SUBJECT */}

              <div>

                <label className="mb-1.5 block text-xs text-slate-500">
                  Subject
                </label>

                <select
                  value={
                    activeSubject
                  }
                  onChange={(e) =>
                    setActiveSubject(
                      e.target.value
                    )
                  }
                  disabled={
                    isLoadingRefs ||
                    subjects.length ===
                      0
                  }
                  className={selectClass}
                >

                  {subjects.length ===
                    0 && (
                    <option value="">
                      No subjects
                    </option>
                  )}

                  {subjects.map(
                    (subject) => (
                      <option
                        key={
                          subject._id
                        }
                        value={
                          subject._id
                        }
                      >
                        {subject.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* CHAPTER */}

              <div>

                <label className="mb-1.5 block text-xs text-slate-500">
                  Main Topic
                </label>

                <select
                  value={
                    activeChapter
                  }
                  onChange={(e) =>
                    setActiveChapter(
                      e.target.value
                    )
                  }
                  disabled={
                    chaptersForSubject.length ===
                    0
                  }
                  className={selectClass}
                >

                  {chaptersForSubject.length ===
                    0 && (
                    <option value="">
                      No main topics
                    </option>
                  )}

                  {chaptersForSubject.map(
                    (chapter) => (
                      <option
                        key={
                          chapter._id
                        }
                        value={
                          chapter._id
                        }
                      >
                        {
                          chapter.title
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SUBTOPIC */}

              <div>

                <label className="mb-1.5 block text-xs text-slate-500">
                  Subtopic
                </label>

                <select
                  value={
                    mainTopicId
                  }
                  onChange={(e) =>
                    setMainTopicId(
                      e.target.value
                    )
                  }
                  disabled={
                    topicsForChapter.length ===
                    0
                  }
                  className={selectClass}
                >

                  {topicsForChapter.length ===
                    0 && (
                    <option value="">
                      No subtopics
                    </option>
                  )}

                  {topicsForChapter.map(
                    (topic) => (
                      <option
                        key={
                          topic._id
                        }
                        value={
                          topic._id
                        }
                      >
                        {
                          topic.title
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </section>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {questions.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-white/15 p-12 text-center">

              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">

                <HelpCircle
                  size={22}
                />

              </div>

              <h3 className="text-sm font-medium text-slate-300">
                No questions yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                Add an MCQ, multiple-correct
                question, or coding problem
                using the buttons on the left.
              </p>

            </div>
          )}

          {/* =================================================
              QUESTIONS
          ================================================= */}

          {questions.map(
            (question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                isFirst={
                  index === 0
                }
                isLast={
                  index ===
                  questions.length - 1
                }
                onChange={(patch) =>
                  updateQuestion(
                    question.id,
                    patch
                  )
                }
                onRemove={() =>
                  removeQuestion(
                    question.id
                  )
                }
                onMove={(direction) =>
                  moveQuestion(
                    question.id,
                    direction
                  )
                }
                onDragStart={() =>
                  setDragId(
                    question.id
                  )
                }
                onDragOver={(e) =>
                  e.preventDefault()
                }
                onDrop={() =>
                  handleDrop(
                    question.id
                  )
                }
              />
            )
          )}

          {/* =================================================
              ADD QUESTION
          ================================================= */}

          {questions.length >
            0 && (
            <AddQuestionBar
              onAdd={
                addQuestion
              }
            />
          )}

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   QUESTION CARD
========================================================= */

function QuestionCard({
  question,
  index,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [collapsed, setCollapsed] =
    useState(false);

  const typeInfo =
    QUESTION_TYPES.find(
      (item) =>
        item.type === question.type
    );

  return (
    <section
      draggable
      onDragStart={
        onDragStart
      }
      onDragOver={
        onDragOver
      }
      onDrop={onDrop}
      className="group rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20"
    >

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">

        <div className="flex min-w-0 items-center gap-2">

          <GripVertical
            size={17}
            className="shrink-0 cursor-grab text-slate-600"
          />

          <span className="text-xs text-slate-600">
            Q{index + 1}
          </span>

          <span className="rounded border border-violet-500/20 bg-violet-500/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-300">
            {typeInfo?.label ||
              question.type}
          </span>

          <span className="hidden text-xs text-slate-600 sm:block">
            {question.marks} marks
          </span>

          <span className="hidden text-xs text-slate-600 sm:block">
            •
          </span>

          <span className="hidden items-center gap-1 text-xs text-amber-400 sm:flex">
            <Coins
              size={12}
            />
            {question.coins ??
              0}
          </span>

          <span className="hidden text-xs text-slate-600 sm:block">
            •
          </span>

          <span className="hidden text-xs text-slate-600 sm:block">
            {question.difficulty}
          </span>

        </div>

        <div className="flex items-center gap-1">

          <IconButton
            title="Move up"
            disabled={isFirst}
            onClick={() =>
              onMove("up")
            }
          >
            <ArrowUp size={14} />
          </IconButton>

          <IconButton
            title="Move down"
            disabled={isLast}
            onClick={() =>
              onMove("down")
            }
          >
            <ArrowDown size={14} />
          </IconButton>

          <IconButton
            title={
              collapsed
                ? "Expand"
                : "Collapse"
            }
            onClick={() =>
              setCollapsed(
                (value) =>
                  !value
              )
            }
          >
            {collapsed ? (
              <ChevronDown
                size={14}
              />
            ) : (
              <ChevronUp
                size={14}
              />
            )}
          </IconButton>

          <IconButton
            title="Delete question"
            danger
            onClick={
              onRemove
            }
          >
            <Trash2 size={14} />
          </IconButton>

        </div>

      </div>

      {!collapsed && (
        <div className="p-5">

          <QuestionEditor
            question={
              question
            }
            onChange={
              onChange
            }
          />

        </div>
      )}

    </section>
  );
}

/* =========================================================
   QUESTION EDITOR
========================================================= */

function QuestionEditor({
  question,
  onChange,
}) {
  return (
    <div className="space-y-5">

      {/* BASIC QUESTION */}

      <div>

        <div className="mb-3 flex items-center gap-2">

          <Info
            size={15}
            className="text-violet-400"
          />

          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Question
          </span>

        </div>

        <input
          value={
            question.title || ""
          }
          onChange={(e) =>
            onChange({
              title:
                e.target.value,
            })
          }
          placeholder="Question title"
          className="mb-3 w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-base font-semibold text-slate-100 outline-none focus:border-violet-500"
        />

        <textarea
          value={
            question.statement ||
            ""
          }
          onChange={(e) =>
            onChange({
              statement:
                e.target.value,
            })
          }
          placeholder="Write the complete question here..."
          rows={5}
          className="w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm leading-relaxed text-slate-200 outline-none focus:border-violet-500"
        />

      </div>

      {/* ===================================================
          SETTINGS
      =================================================== */}

      <div className="grid gap-3 sm:grid-cols-5">

        {/* QUESTION TYPE */}

        <Field label="Question type">

          <select
            value={
              question.type
            }
            onChange={(e) => {
              const nextType =
                e.target.value;

              if (
                nextType ===
                question.type
              ) {
                return;
              }

              const next =
                emptyQuestion(
                  nextType
                );

              /*
               * Keep existing question ID.
               */
              onChange({
                ...next,
                id: question.id,
              });
            }}
            className={selectClass}
          >

            {QUESTION_TYPES.map(
              (item) => (
                <option
                  key={item.type}
                  value={
                    item.type
                  }
                >
                  {item.label}
                </option>
              )
            )}

          </select>

        </Field>

        {/* DIFFICULTY */}

        <Field label="Difficulty">

          <select
            value={
              question.difficulty
            }
            onChange={(e) =>
              onChange({
                difficulty:
                  e.target.value,
              })
            }
            className={selectClass}
          >

            {DIFFICULTIES.map(
              (difficulty) => (
                <option
                  key={difficulty}
                  value={
                    difficulty
                  }
                >
                  {difficulty}
                </option>
              )
            )}

          </select>

        </Field>

        {/* MARKS */}

        <Field label="Marks">

          <input
            type="number"
            min="0"
            value={
              question.marks ?? 0
            }
            onChange={(e) =>
              onChange({
                marks: Math.max(
                  0,
                  Number(
                    e.target.value
                  ) || 0
                ),
              })
            }
            className={inputClass}
          />

        </Field>

        {/* NEGATIVE MARKS */}

        <Field label="Negative marks">

          <input
            type="number"
            min="0"
            step="0.25"
            value={
              question.negativeMarks ??
              0
            }
            onChange={(e) =>
              onChange({
                negativeMarks:
                  Math.max(
                    0,
                    Number(
                      e.target.value
                    ) || 0
                  ),
              })
            }
            className={inputClass}
          />

        </Field>

        {/* =================================================
            COINS
        ================================================= */}

        <Field label="Coins">

          <div className="relative">

            <Coins
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400"
            />

            <input
              type="number"
              min="0"
              step="1"
              value={
                question.coins ?? 0
              }
              onChange={(e) =>
                onChange({
                  coins: Math.max(
                    0,
                    Number(
                      e.target.value
                    ) || 0
                  ),
                })
              }
              className={`${inputClass} pl-8`}
              placeholder="5"
            />

          </div>

        </Field>

      </div>

      {/* TAGS */}

      <TagEditor
        tags={
          question.tags || []
        }
        onChange={(tags) =>
          onChange({
            tags,
          })
        }
      />

      {/* MCQ */}

      {(question.type ===
        "mcq" ||
        question.type ===
          "multiple") && (
        <MCQEditor
          question={
            question
          }
          onChange={
            onChange
          }
        />
      )}

      {/* CODING */}

      {question.type ===
        "coding" && (
        <CodingEditor
          question={
            question
          }
          onChange={
            onChange
          }
        />
      )}

      {/* NON CODING DETAILS */}

      {question.type !==
        "coding" && (
        <QuestionDetailsEditor
          question={
            question
          }
          onChange={
            onChange
          }
        />
      )}

      {/* EXPLANATION */}

      <div>

        <label className="mb-1.5 block text-xs text-slate-500">
          Explanation / solution
        </label>

        <textarea
          value={
            question.explanation ||
            ""
          }
          onChange={(e) =>
            onChange({
              explanation:
                e.target.value,
            })
          }
          placeholder="Explain the correct answer or solution..."
          rows={4}
          className="w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm leading-relaxed outline-none focus:border-violet-500"
        />

      </div>

    </div>
  );
}

/* =========================================================
   MCQ EDITOR
========================================================= */

function MCQEditor({
  question,
  onChange,
}) {
  const isMultiple =
    question.type ===
    "multiple";

  const options =
    Array.isArray(
      question.options
    )
      ? question.options
      : [];

  const updateOption = (
    index,
    patch
  ) => {
    const next =
      options.map(
        (option, i) =>
          i === index
            ? {
                ...option,
                ...patch,
              }
            : option
      );

    onChange({
      options: next,
    });
  };

  const toggleCorrect = (
    index
  ) => {
    const next =
      options.map(
        (option, i) => {
          if (isMultiple) {
            return i === index
              ? {
                  ...option,
                  correct:
                    !option.correct,
                }
              : option;
          }

          return {
            ...option,
            correct:
              i === index,
          };
        }
      );

    onChange({
      options: next,
    });
  };

  const addOption = () => {
    onChange({
      options: [
        ...options,

        {
          id: createOptionId(
            question.id
          ),
          text: "",
          correct: false,
        },
      ],
    });
  };

  const removeOption = (
    index
  ) => {
    if (options.length <= 2) {
      return;
    }

    onChange({
      options:
        options.filter(
          (_, i) =>
            i !== index
        ),
    });
  };

  return (
    <div>

      <div className="mb-3 flex items-center justify-between">

        <div>

          <div className="text-xs font-medium text-slate-400">
            Answer options
          </div>

          <div className="mt-0.5 text-[11px] text-slate-600">
            {isMultiple
              ? "Select all correct answers."
              : "Select one correct answer."}
          </div>

        </div>

        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-500">
          {options.length}{" "}
          options
        </span>

      </div>

      <div className="space-y-2">

        {options.map(
          (option, index) => (
            <div
              key={
                option.id ||
                index
              }
              className={`flex items-center gap-2 rounded-lg border p-2 transition ${
                option.correct
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-white/10 bg-[#0b0e14]"
              }`}
            >

              <button
                type="button"
                onClick={() =>
                  toggleCorrect(
                    index
                  )
                }
                title={
                  option.correct
                    ? "Correct answer"
                    : "Mark as correct"
                }
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                  option.correct
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-white/15 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400"
                }`}
              >

                {option.correct ? (
                  <CheckCircle2
                    size={15}
                  />
                ) : (
                  String.fromCharCode(
                    65 + index
                  )
                )}

              </button>

              <input
                value={
                  option.text || ""
                }
                onChange={(e) =>
                  updateOption(
                    index,
                    {
                      text: e
                        .target
                        .value,
                    }
                  )
                }
                placeholder={`Option ${
                  index + 1
                }`}
                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-200 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  removeOption(
                    index
                  )
                }
                disabled={
                  options.length <=
                  2
                }
                className="rounded p-1.5 text-slate-600 hover:text-red-400 disabled:opacity-20"
              >
                <X
                  size={15}
                />
              </button>

            </div>
          )
        )}

      </div>

      <button
        type="button"
        onClick={addOption}
        className="mt-3 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
      >
        <Plus size={13} />
        Add option
      </button>

    </div>
  );
}

/* =========================================================
   CODING EDITOR
========================================================= */

function CodingEditor({
  question,
  onChange,
}) {
  const starterCode =
    normalizeStarterCode(
      question.starterCode
    );

  const updateStarterCode = (
    language,
    value
  ) => {
    onChange({
      starterCode: {
        ...starterCode,

        [language]: value,
      },
    });
  };

  return (
    <div className="space-y-5">

      {/* LANGUAGE */}

      <div>

        <label className="mb-1.5 block text-xs text-slate-500">
          Default language
        </label>

        <select
          value={
            question.language ||
            "java"
          }
          onChange={(e) =>
            onChange({
              language:
                e.target.value,
            })
          }
          className={selectClass}
        >

          {LANGUAGES.map(
            (language) => (
              <option
                key={
                  language.value
                }
                value={
                  language.value
                }
              >
                {
                  language.label
                }
              </option>
            )
          )}

        </select>

      </div>

      {/* INPUT / OUTPUT */}

      <div className="grid gap-4 md:grid-cols-2">

        <TextAreaField
          label="Input format"
          value={
            question.inputFormat ||
            ""
          }
          onChange={(value) =>
            onChange({
              inputFormat:
                value,
            })
          }
          placeholder="Describe the input format..."
        />

        <TextAreaField
          label="Output format"
          value={
            question.outputFormat ||
            ""
          }
          onChange={(value) =>
            onChange({
              outputFormat:
                value,
            })
          }
          placeholder="Describe the expected output..."
        />

      </div>

      {/* CONSTRAINTS */}

      <TextAreaField
        label="Constraints"
        value={
          question.constraints ||
          ""
        }
        onChange={(value) =>
          onChange({
            constraints:
              value,
          })
        }
        placeholder={
          "1 ≤ N ≤ 100000\n1 ≤ A[i] ≤ 10^9"
        }
      />

      {/* EXAMPLES */}

      <ExamplesEditor
        examples={
          Array.isArray(
            question.examples
          )
            ? question.examples
            : []
        }
        onChange={(
          examples
        ) =>
          onChange({
            examples,
          })
        }
      />

      {/* STARTER CODE */}

      <StarterCodeEditor
        starterCode={
          starterCode
        }
        onChange={(
          nextStarterCode
        ) =>
          onChange({
            starterCode:
              nextStarterCode,
          })
        }
      />

      {/* TEST CASES */}

      <TestCasesEditor
        testCases={
          Array.isArray(
            question.testCases
          )
            ? question.testCases
            : []
        }
        onChange={(
          testCases
        ) =>
          onChange({
            testCases,
          })
        }
      />

    </div>
  );
}

/* =========================================================
   QUESTION DETAILS
========================================================= */

function QuestionDetailsEditor({
  question,
  onChange,
}) {
  return (
    <div className="space-y-4">

      <div className="border-t border-white/10 pt-4">

        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Optional problem details
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <TextAreaField
            label="Input format"
            value={
              question.inputFormat ||
              ""
            }
            onChange={(value) =>
              onChange({
                inputFormat:
                  value,
              })
            }
            placeholder="Optional input description..."
          />

          <TextAreaField
            label="Output format"
            value={
              question.outputFormat ||
              ""
            }
            onChange={(value) =>
              onChange({
                outputFormat:
                  value,
              })
            }
            placeholder="Optional output description..."
          />

        </div>

        <div className="mt-4">

          <TextAreaField
            label="Constraints"
            value={
              question.constraints ||
              ""
            }
            onChange={(value) =>
              onChange({
                constraints:
                  value,
              })
            }
            placeholder="Optional constraints..."
          />

        </div>

      </div>

      <ExamplesEditor
        examples={
          Array.isArray(
            question.examples
          )
            ? question.examples
            : []
        }
        onChange={(examples) =>
          onChange({
            examples,
          })
        }
      />

      {question.code !==
        undefined && (
        <div>

          <label className="mb-1.5 block text-xs text-slate-500">
            Reference code / explanation
          </label>

          <textarea
            value={
              question.code ||
              ""
            }
            onChange={(e) =>
              onChange({
                code:
                  e.target.value,
              })
            }
            rows={6}
            spellCheck={false}
            placeholder="// Optional code snippet"
            className="w-full resize-y rounded-md border border-white/10 bg-black px-3 py-2 font-mono text-sm text-emerald-300 outline-none focus:border-violet-500"
          />

        </div>
      )}

    </div>
  );
}

/* =========================================================
   EXAMPLES EDITOR
========================================================= */

function ExamplesEditor({
  examples,
  onChange,
}) {
  const safeExamples =
    Array.isArray(examples)
      ? examples
      : [];

  const addExample = () => {
    onChange([
      ...safeExamples,

      {
        input: "",
        output: "",
        explanation: "",
      },
    ]);
  };

  const removeExample = (
    index
  ) => {
    onChange(
      safeExamples.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  const updateExample = (
    index,
    patch
  ) => {
    onChange(
      safeExamples.map(
        (example, i) =>
          i === index
            ? {
                ...example,
                ...patch,
              }
            : example
      )
    );
  };

  return (
    <div>

      <div className="mb-3 flex items-center justify-between">

        <div>

          <div className="text-xs font-medium text-slate-400">
            Sample test cases
          </div>

          <div className="mt-0.5 text-[11px] text-slate-600">
            Examples shown to learners.
          </div>

        </div>

        <button
          type="button"
          onClick={
            addExample
          }
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
        >
          <Plus size={13} />
          Add example
        </button>

      </div>

      {safeExamples.length ===
        0 && (
        <button
          type="button"
          onClick={
            addExample
          }
          className="rounded-md border border-dashed border-white/10 px-3 py-2 text-xs text-slate-500 hover:border-violet-500/30 hover:text-violet-400"
        >
          <Plus
            size={13}
            className="mr-1 inline"
          />
          Add first example
        </button>
      )}

      <div className="space-y-3">

        {safeExamples.map(
          (example, index) => (
            <div
              key={index}
              className="rounded-lg border border-white/10 bg-[#0b0e14] p-3"
            >

              <div className="mb-3 flex items-center justify-between">

                <span className="text-xs font-medium text-slate-500">
                  Example{" "}
                  {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removeExample(
                      index
                    )
                  }
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>

              </div>

              <div className="grid gap-3 md:grid-cols-2">

                <CodeTextArea
                  label="Input"
                  value={
                    example.input ||
                    ""
                  }
                  onChange={(
                    value
                  ) =>
                    updateExample(
                      index,
                      {
                        input:
                          value,
                      }
                    )
                  }
                />

                <CodeTextArea
                  label="Output"
                  value={
                    example.output ||
                    ""
                  }
                  onChange={(
                    value
                  ) =>
                    updateExample(
                      index,
                      {
                        output:
                          value,
                      }
                    )
                  }
                />

              </div>

              <div className="mt-3">

                <input
                  value={
                    example.explanation ||
                    ""
                  }
                  onChange={(e) =>
                    updateExample(
                      index,
                      {
                        explanation:
                          e.target
                            .value,
                      }
                    )
                  }
                  placeholder="Example explanation (optional)"
                  className={inputClass}
                />

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   STARTER CODE EDITOR
========================================================= */

function StarterCodeEditor({
  starterCode,
  onChange,
}) {
  const safeStarterCode =
    normalizeStarterCode(
      starterCode
    );

  const update = (
    language,
    value
  ) => {
    onChange({
      ...safeStarterCode,

      [language]: value,
    });
  };

  return (
    <div>

      <div className="mb-3 flex items-center gap-2">

        <Code2
          size={15}
          className="text-violet-400"
        />

        <div>

          <div className="text-xs font-medium text-slate-400">
            Starter code
          </div>

          <div className="text-[11px] text-slate-600">
            Optional templates shown to learners.
          </div>

        </div>

      </div>

      <div className="grid gap-3">

        {LANGUAGES.map(
          (language) => (
            <div
              key={
                language.value
              }
            >

              <label className="mb-1 block text-[11px] capitalize text-slate-600">
                {
                  language.label
                }
              </label>

              <textarea
                value={
                  safeStarterCode[
                    language.value
                  ] || ""
                }
                onChange={(e) =>
                  update(
                    language.value,
                    e.target.value
                  )
                }
                rows={6}
                spellCheck={false}
                placeholder={`// ${language.label} starter code`}
                className="w-full resize-y rounded-md border border-white/10 bg-black px-3 py-2 font-mono text-xs text-emerald-300 outline-none focus:border-violet-500"
              />

            </div>
          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   TEST CASE EDITOR
========================================================= */

function TestCasesEditor({
  testCases,
  onChange,
}) {
  const safeTestCases =
    Array.isArray(testCases)
      ? testCases
      : [];

  const addTestCase = () => {
    onChange([
      ...safeTestCases,

      {
        input: "",
        output: "",
        explanation: "",
        hidden: true,
      },
    ]);
  };

  const removeTestCase = (
    index
  ) => {
    onChange(
      safeTestCases.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  const updateTestCase = (
    index,
    patch
  ) => {
    onChange(
      safeTestCases.map(
        (testCase, i) =>
          i === index
            ? {
                ...testCase,
                ...patch,
              }
            : testCase
      )
    );
  };

  return (
    <div>

      <div className="mb-3 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <TestTube2
            size={15}
            className="text-violet-400"
          />

          <div>

            <div className="text-xs font-medium text-slate-400">
              Judge test cases
            </div>

            <div className="text-[11px] text-slate-600">
              Hidden cases used to evaluate submissions.
            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={
            addTestCase
          }
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
        >
          <Plus size={13} />
          Add test case
        </button>

      </div>

      {safeTestCases.length ===
        0 && (
        <button
          type="button"
          onClick={
            addTestCase
          }
          className="mb-3 rounded-md border border-dashed border-white/10 px-3 py-2 text-xs text-slate-500 hover:border-violet-500/30 hover:text-violet-400"
        >
          <Plus
            size={13}
            className="mr-1 inline"
          />
          Add first test case
        </button>
      )}

      <div className="space-y-3">

        {safeTestCases.map(
          (
            testCase,
            index
          ) => (
            <div
              key={index}
              className="rounded-lg border border-white/10 bg-[#0b0e14] p-3"
            >

              <div className="mb-3 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span className="text-xs font-medium text-slate-500">
                    Test case{" "}
                    {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateTestCase(
                        index,
                        {
                          hidden:
                            !testCase.hidden,
                        }
                      )
                    }
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      testCase.hidden
                        ? "bg-violet-500/10 text-violet-300"
                        : "bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    {testCase.hidden
                      ? "Hidden"
                      : "Visible"}
                  </button>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeTestCase(
                      index
                    )
                  }
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>

              </div>

              <div className="grid gap-3 md:grid-cols-2">

                <CodeTextArea
                  label="Input"
                  value={
                    testCase.input ||
                    ""
                  }
                  onChange={(
                    value
                  ) =>
                    updateTestCase(
                      index,
                      {
                        input:
                          value,
                      }
                    )
                  }
                />

                <CodeTextArea
                  label="Expected output"
                  value={
                    testCase.output ||
                    ""
                  }
                  onChange={(
                    value
                  ) =>
                    updateTestCase(
                      index,
                      {
                        output:
                          value,
                      }
                    )
                  }
                />

              </div>

              <div className="mt-3">

                <input
                  value={
                    testCase.explanation ||
                    ""
                  }
                  onChange={(e) =>
                    updateTestCase(
                      index,
                      {
                        explanation:
                          e.target
                            .value,
                      }
                    )
                  }
                  placeholder="Internal note / explanation"
                  className={inputClass}
                />

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   TAG EDITOR
========================================================= */

function TagEditor({
  tags,
  onChange,
}) {
  const safeTags =
    Array.isArray(tags)
      ? tags
      : [];

  const [value, setValue] =
    useState("");

  const addTag = () => {
    const tag =
      value.trim();

    if (!tag) {
      return;
    }

    if (
      safeTags.some(
        (item) =>
          item.toLowerCase() ===
          tag.toLowerCase()
      )
    ) {
      setValue("");
      return;
    }

    onChange([
      ...safeTags,
      tag,
    ]);

    setValue("");
  };

  const removeTag = (
    index
  ) => {
    onChange(
      safeTags.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  return (
    <div>

      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500">

        <Tag size={13} />

        Tags

      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-[#0b0e14] p-2">

        {safeTags.map(
          (tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-300"
            >

              {tag}

              <button
                type="button"
                onClick={() =>
                  removeTag(
                    index
                  )
                }
                className="hover:text-white"
              >
                <X
                  size={11}
                />
              </button>

            </span>
          )
        )}

        <input
          value={value}
          onChange={(e) =>
            setValue(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key ===
              "Enter"
            ) {
              e.preventDefault();

              addTag();
            }
          }}
          onBlur={
            addTag
          }
          placeholder={
            safeTags.length
              ? "Add tag..."
              : "java, arrays, loops..."
          }
          className="min-w-[160px] flex-1 bg-transparent px-1 py-1 text-xs outline-none"
        />

      </div>

    </div>
  );
}

/* =========================================================
   ADD QUESTION BAR
========================================================= */

function AddQuestionBar({
  onAdd,
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4">

      <div className="mb-3 text-center text-xs text-slate-600">
        Add another question
      </div>

      <div className="flex flex-wrap justify-center gap-2">

        <button
          type="button"
          onClick={() =>
            onAdd("mcq")
          }
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-violet-500/30 hover:bg-violet-500/5"
        >
          <HelpCircle
            size={14}
          />
          MCQ
        </button>

        <button
          type="button"
          onClick={() =>
            onAdd("multiple")
          }
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-violet-500/30 hover:bg-violet-500/5"
        >
          <ListChecks
            size={14}
          />
          Multiple Correct
        </button>

        <button
          type="button"
          onClick={() =>
            onAdd("coding")
          }
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-violet-500/30 hover:bg-violet-500/5"
        >
          <Code2
            size={14}
          />
          Coding
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs text-slate-500">
        {label}
      </label>

      {children}

    </div>
  );
}

/* =========================================================
   TEXTAREA FIELD
========================================================= */

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs text-slate-500">
        {label}
      </label>

      <textarea
        value={value || ""}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        rows={4}
        className="w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm leading-relaxed outline-none focus:border-violet-500"
      />

    </div>
  );
}

/* =========================================================
   CODE TEXTAREA
========================================================= */

function CodeTextArea({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-1 block text-[11px] text-slate-600">
        {label}
      </label>

      <textarea
        value={value || ""}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        rows={5}
        spellCheck={false}
        className="w-full resize-y rounded-md border border-white/10 bg-black px-3 py-2 font-mono text-xs text-emerald-300 outline-none focus:border-violet-500"
      />

    </div>
  );
}

/* =========================================================
   ICON BUTTON
========================================================= */

function IconButton({
  children,
  onClick,
  disabled,
  danger,
  title,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md border border-white/10 p-1.5 text-slate-500 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-20 ${
        danger
          ? "hover:border-red-500/40 hover:text-red-400"
          : "hover:text-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   NORMALIZE STARTER CODE
========================================================= */

function normalizeStarterCode(
  starterCode
) {
  if (!starterCode) {
    return {
      javascript: "",
      python: "",
      java: "",
      cpp: "",
    };
  }

  /*
   * Supports old quizzes where
   * starterCode was a string.
   */

  if (
    typeof starterCode ===
    "string"
  ) {
    return {
      javascript:
        starterCode,

      python: "",

      java: "",

      cpp: "",
    };
  }

  return {
    javascript: String(
      starterCode.javascript ||
        ""
    ),

    python: String(
      starterCode.python ||
        ""
    ),

    java: String(
      starterCode.java ||
        ""
    ),

    cpp: String(
      starterCode.cpp ||
        ""
    ),
  };
}

/* =========================================================
   NORMALIZE TEST CASES
========================================================= */

function normalizeTestCases(
  testCases
) {
  if (
    !Array.isArray(
      testCases
    )
  ) {
    return [];
  }

  return testCases.map(
    (testCase) => ({
      input: String(
        testCase?.input ||
          ""
      ),

      output: String(
        testCase?.output ||
          ""
      ),

      explanation: String(
        testCase?.explanation ||
          ""
      ),

      hidden: Boolean(
        testCase?.hidden
      ),
    })
  );
}

/* =========================================================
   NORMALIZE EXAMPLES
========================================================= */

function normalizeExamples(
  examples
) {
  if (
    !Array.isArray(
      examples
    )
  ) {
    return [];
  }

  return examples.map(
    (example) => ({
      input: String(
        example?.input ||
          ""
      ),

      output: String(
        example?.output ||
          ""
      ),

      explanation: String(
        example?.explanation ||
          ""
      ),
    })
  );
}

/* =========================================================
   COMMON CLASSES
========================================================= */

const inputClass =
  "w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500";

const selectClass =
  "w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500";
