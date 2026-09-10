"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Loader2,
  Trophy,
  XCircle,
  Send,
  RotateCcw,
  Play,
  Terminal,
  Coins,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Convert different representations of true/false
 * into a real boolean.
 */
function isTruthyCorrect(value) {
  if (value === true) return true;
  if (value === 1) return true;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return [
      "true",
      "1",
      "yes",
      "y",
      "correct",
    ].includes(normalized);
  }

  return false;
}

/**
 * Check whether an OPTION itself is marked correct.
 *
 * Supported:
 * option.correct
 * option.isCorrect
 * option.is_correct
 * option.correctAnswer
 * option.correct_answer
 * option.answer
 */
function isOptionCorrect(option) {
  if (!option || typeof option !== "object") {
    return false;
  }

  const possibleFields = [
    "correct",
    "isCorrect",
    "is_correct",
    "correctAnswer",
    "correct_answer",
    "answer",
  ];

  for (const field of possibleFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        option,
        field
      )
    ) {
      return isTruthyCorrect(option[field]);
    }
  }

  return false;
}

/**
 * Get correct option indexes.
 *
 * Supports BOTH:
 *
 * 1. Option-level:
 *
 * options: [
 *   { text: "A", correct: false },
 *   { text: "B", correct: true }
 * ]
 *
 * 2. Question-level:
 *
 * options: [
 *   { text: "A" },
 *   { text: "B" }
 * ],
 * correctAnswer: 1
 *
 * Also supports:
 * correctAnswers: [1, 3]
 */
function getCorrectOptionIndexes(question) {
  if (!question) {
    return [];
  }

  const options = Array.isArray(question.options)
    ? question.options
    : [];

  /* =======================================================
     QUESTION LEVEL CORRECT ANSWER
  ======================================================= */

  const questionLevelFields = [
    "correctAnswer",
    "correct_answer",
    "correctOption",
    "correct_option",
  ];

  for (const field of questionLevelFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        question,
        field
      )
    ) {
      const value = question[field];

      /*
       * Example:
       * correctAnswer: 1
       */
      if (
        typeof value === "number" &&
        Number.isInteger(value)
      ) {
        return [value];
      }

      /*
       * Example:
       * correctAnswer: "1"
       */
      if (
        typeof value === "string" &&
        value.trim() !== ""
      ) {
        /*
         * Numeric string
         */
        if (/^\d+$/.test(value.trim())) {
          return [Number(value)];
        }

        /*
         * Letter answer:
         * "A", "B", "C", "D"
         */
        if (/^[A-Za-z]$/.test(value.trim())) {
          const letter =
            value.trim().toUpperCase();

          return [
            letter.charCodeAt(0) - 65,
          ];
        }

        /*
         * Text answer:
         * correctAnswer: "London"
         */
        const textIndex = options.findIndex(
          (option) =>
            String(
              option?.text ?? option ?? ""
            )
              .trim()
              .toLowerCase() ===
            value.trim().toLowerCase()
        );

        if (textIndex >= 0) {
          return [textIndex];
        }
      }

      /*
       * Array answer:
       *
       * correctAnswer: [1, 3]
       */
      if (Array.isArray(value)) {
        return value
          .map((item) => {
            if (
              typeof item === "number" &&
              Number.isInteger(item)
            ) {
              return item;
            }

            if (
              typeof item === "string" &&
              /^\d+$/.test(item.trim())
            ) {
              return Number(item);
            }

            if (
              typeof item === "string" &&
              /^[A-Za-z]$/.test(item.trim())
            ) {
              return (
                item
                  .trim()
                  .toUpperCase()
                  .charCodeAt(0) - 65
              );
            }

            return null;
          })
          .filter(
            (index) => index !== null
          )
          .sort((a, b) => a - b);
      }
    }
  }

  /*
   * Some databases use:
   *
   * correctAnswers: [1, 3]
   */
  if (
    Array.isArray(
      question.correctAnswers
    )
  ) {
    return question.correctAnswers
      .map(Number)
      .filter(Number.isInteger)
      .sort((a, b) => a - b);
  }

  /*
   * Some databases use:
   *
   * correct_answers: [1, 3]
   */
  if (
    Array.isArray(
      question.correct_answers
    )
  ) {
    return question.correct_answers
      .map(Number)
      .filter(Number.isInteger)
      .sort((a, b) => a - b);
  }

  /* =======================================================
     OPTION LEVEL CORRECT FLAGS
  ======================================================= */

  return options
    .map((option, index) =>
      isOptionCorrect(option)
        ? index
        : null
    )
    .filter(
      (index) => index !== null
    )
    .sort((a, b) => a - b);
}

/**
 * Safely compare arrays.
 */
function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every(
    (value, index) =>
      Number(value) === Number(b[index])
  );
}

/**
 * Check MCQ / multiple question.
 */
function checkQuestionAnswer(
  question,
  answer
) {
  if (!question) {
    return false;
  }

  /* ============================
     MCQ
  ============================ */

  if (question.type === "mcq") {
    if (
      answer === undefined ||
      answer === null
    ) {
      return false;
    }

    const selectedIndex = Number(answer);

    if (!Number.isInteger(selectedIndex)) {
      return false;
    }

    const correctIndexes =
      getCorrectOptionIndexes(
        question
      );

    return correctIndexes.includes(
      selectedIndex
    );
  }

  /* ============================
     MULTIPLE
  ============================ */

  if (question.type === "multiple") {
    if (!Array.isArray(answer)) {
      return false;
    }

    const selected = answer
      .map(Number)
      .filter(Number.isInteger)
      .sort((a, b) => a - b);

    const correct =
      getCorrectOptionIndexes(
        question
      );

    return arraysEqual(
      selected,
      correct
    );
  }

  return false;
}

/**
 * Normalize output for comparison.
 */
function normalizeOutput(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/\r\n/g, "\n")
    .trim()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}

/**
 * Determine whether code execution passed.
 */
function executionPassed(
  data,
  question,
  output,
  executionError
) {
  if (executionError) {
    return false;
  }

  /*
   * Explicit API result.
   */
  if (
    typeof data?.passed === "boolean"
  ) {
    return data.passed;
  }

  /*
   * Test cases configured.
   */
  const testCases = Array.isArray(
    question?.testCases
  )
    ? question.testCases
    : [];

  /*
   * No configured tests.
   */
  if (testCases.length === 0) {
    return data?.statusId === 3;
  }

  /*
   * Per-test results.
   */
  const resultCases =
    data?.testCases ||
    data?.results ||
    data?.testResults ||
    data?.testcases;

  if (Array.isArray(resultCases)) {
    return (
      resultCases.length > 0 &&
      resultCases.every((test) => {
        if (
          typeof test?.passed ===
          "boolean"
        ) {
          return test.passed;
        }

        if (
          typeof test?.correct ===
          "boolean"
        ) {
          return test.correct;
        }

        if (
          typeof test?.success ===
          "boolean"
        ) {
          return test.success;
        }

        return false;
      })
    );
  }

  /*
   * Expected output directly from API.
   */
  const expectedOutput =
    data?.expectedOutput ??
    data?.expected ??
    null;

  if (expectedOutput !== null) {
    return (
      normalizeOutput(output) ===
      normalizeOutput(expectedOutput)
    );
  }

  /*
   * Single test case fallback.
   */
  if (testCases.length === 1) {
    const test = testCases[0];

    const expected =
      test?.expectedOutput ??
      test?.expected ??
      test?.output ??
      null;

    if (expected !== null) {
      return (
        normalizeOutput(output) ===
        normalizeOutput(expected)
      );
    }
  }

  return false;
}

/**
 * Determine whether a question is correct.
 */
function isQuestionCorrect(
  question,
  answer,
  codingAnswer
) {
  if (!question) {
    return false;
  }

  if (
    question.type === "mcq" ||
    question.type === "multiple"
  ) {
    return checkQuestionAnswer(
      question,
      answer
    );
  }

  if (question.type === "coding") {
    return codingAnswer?.passed === true;
  }

  return false;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MCQQuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(0);

  const [answers, setAnswers] =
    useState({});

  const [
    codingAnswers,
    setCodingAnswers,
  ] = useState({});

  const [flagged, setFlagged] =
    useState({});

  const [timeLeft, setTimeLeft] =
    useState(null);

  const [submitted, setSubmitted] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [submitting, setSubmitting] =
    useState(false);

  const [rewardCoins, setRewardCoins] =
    useState(0);

  const [coinStatus, setCoinStatus] =
    useState("");

  const [coinError, setCoinError] =
    useState("");

  const [rewardSaved, setRewardSaved] =
    useState(false);

  /* =======================================================
     TOPIC
  ======================================================= */

  const topicId =
    typeof window !== "undefined"
      ? new URLSearchParams(
          window.location.search
        ).get("topic")
      : null;

  /* =======================================================
     LOAD QUIZ
  ======================================================= */

  useEffect(() => {
    async function loadQuiz() {
      if (!topicId) {
        setError(
          "No topic selected."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/quizzes?topic=${encodeURIComponent(
              topicId
            )}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          throw new Error(
            `Quiz API returned ${response.status}: ${text.slice(
              0,
              200
            )}`
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to load quiz."
          );
        }

        let loadedQuiz = null;

        if (Array.isArray(data)) {
          loadedQuiz =
            data.find(
              (item) =>
                item?.status ===
                "published"
            ) || data[0];
        } else if (
          Array.isArray(
            data?.quizzes
          )
        ) {
          loadedQuiz =
            data.quizzes.find(
              (item) =>
                item?.status ===
                "published"
            ) ||
            data.quizzes[0];
        } else if (data?.quiz) {
          loadedQuiz = data.quiz;
        } else if (
          data &&
          typeof data === "object"
        ) {
          loadedQuiz = data;
        }

        if (!loadedQuiz) {
          throw new Error(
            "No quiz available for this topic."
          );
        }

        const normalizedQuiz = {
          ...loadedQuiz,
          questions:
            Array.isArray(
              loadedQuiz.questions
            )
              ? loadedQuiz.questions
              : [],
        };

        /*
         * DEBUG
         */
        console.log(
          "[quiz] Loaded quiz:",
          normalizedQuiz
        );

        normalizedQuiz.questions.forEach(
          (q, index) => {
            if (
              q?.type === "mcq" ||
              q?.type === "multiple"
            ) {
              console.log(
                `[quiz] Q${index + 1}:`,
                q
              );

              console.log(
                `[quiz] Q${index + 1} options:`,
                q.options
              );

              console.log(
                `[quiz] Q${index + 1} correct indexes:`,
                getCorrectOptionIndexes(
                  q
                )
              );
            }
          }
        );

        setQuiz(normalizedQuiz);

        const duration =
          Math.max(
            1,
            Number(
              normalizedQuiz.duration ||
                30
            )
          );

        setTimeLeft(
          duration * 60
        );
      } catch (err) {
        console.error(
          "QUIZ LOAD ERROR:",
          err
        );

        setError(
          err?.message ||
            "Failed to load quiz."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [topicId]);

  /* =======================================================
     QUESTIONS
  ======================================================= */

  const questions = useMemo(() => {
    if (
      !quiz ||
      !Array.isArray(
        quiz.questions
      )
    ) {
      return [];
    }

    return quiz.questions;
  }, [quiz]);

  /* =======================================================
     CURRENT QUESTION SAFETY
  ======================================================= */

  useEffect(() => {
    if (
      questions.length > 0 &&
      currentQuestion >=
        questions.length
    ) {
      setCurrentQuestion(
        questions.length - 1
      );
    }
  }, [
    currentQuestion,
    questions.length,
  ]);

  const question =
    questions[currentQuestion] ||
    null;

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (
      loading ||
      submitted ||
      timeLeft === null
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (previous) => {
          if (
            previous === null ||
            previous <= 0
          ) {
            return 0;
          }

          return previous - 1;
        }
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    loading,
    submitted,
    timeLeft,
  ]);

  /* =======================================================
     FORMAT TIME
  ======================================================= */

  function formatTime(seconds) {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "00:00";
    }

    const safe = Math.max(
      0,
      Number(seconds) || 0
    );

    const mins =
      Math.floor(safe / 60);

    const secs = safe % 60;

    return `${String(
      mins
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;
  }

  /* =======================================================
     MCQ
  ======================================================= */

  function selectAnswer(index) {
    if (
      submitted ||
      !question
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [currentQuestion]:
          index,
      })
    );
  }

  /* =======================================================
     MULTIPLE
  ======================================================= */

  function toggleMultipleAnswer(
    index
  ) {
    if (
      submitted ||
      !question
    ) {
      return;
    }

    setAnswers(
      (previous) => {
        const current =
          Array.isArray(
            previous[
              currentQuestion
            ]
          )
            ? previous[
                currentQuestion
              ]
            : [];

        const exists =
          current.includes(index);

        const updated =
          exists
            ? current.filter(
                (item) =>
                  item !== index
              )
            : [
                ...current,
                index,
              ];

        return {
          ...previous,
          [currentQuestion]:
            updated,
        };
      }
    );
  }

  /* =======================================================
     CODING
  ======================================================= */

  function updateCodingAnswer(
    questionIndex,
    value
  ) {
    if (submitted) {
      return;
    }

    setCodingAnswers(
      (previous) => ({
        ...previous,
        [questionIndex]: {
          ...(previous[
            questionIndex
          ] || {}),
          ...value,
        },
      })
    );
  }

  /* =======================================================
     FLAG
  ======================================================= */

  function toggleFlag() {
    if (!question) {
      return;
    }

    setFlagged(
      (previous) => ({
        ...previous,
        [currentQuestion]:
          !previous[
            currentQuestion
          ],
      })
    );
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function nextQuestion() {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      );
    }
  }

  function previousQuestion() {
    if (
      currentQuestion > 0
    ) {
      setCurrentQuestion(
        (previous) =>
          previous - 1
      );
    }
  }

  /* =======================================================
     ANSWERED
  ======================================================= */

  function isQuestionAnswered(
    index
  ) {
    const q =
      questions[index];

    if (!q) {
      return false;
    }

    if (
      q.type === "coding"
    ) {
      const coding =
        codingAnswers[index];

      return Boolean(
        coding?.code?.trim()
      );
    }

    const answer =
      answers[index];

    if (
      answer === undefined ||
      answer === null
    ) {
      return false;
    }

    if (
      Array.isArray(answer)
    ) {
      return (
        answer.length > 0
      );
    }

    if (
      typeof answer === "string" &&
      answer.trim() === ""
    ) {
      return false;
    }

    return true;
  }

  /* =======================================================
     SCORE
  ======================================================= */

  function calculateScore() {
    let total = 0;

    questions.forEach(
      (q, index) => {
        if (!q) {
          return;
        }

        const marks =
          Math.max(
            0,
            Number(
              q.marks ?? 1
            )
          );

        const correct =
          isQuestionCorrect(
            q,
            answers[index],
            codingAnswers[index]
          );

        console.log(
          `[quiz] Q${index + 1} result:`,
          {
            type: q.type,
            selectedAnswer:
              answers[index],
            coding:
              codingAnswers[index],
            correct,
            correctIndexes:
              getCorrectOptionIndexes(
                q
              ),
          }
        );

        if (correct) {
          total += marks;
        }
      }
    );

    return total;
  }

  /* =======================================================
     COIN REWARD
  ======================================================= */

  function calculateRewardCoins(
    percentage,
    passed
  ) {
    if (!passed) {
      return 0;
    }

    if (percentage >= 90) {
      return 50;
    }

    if (percentage >= 80) {
      return 40;
    }

    if (percentage >= 70) {
      return 30;
    }

    if (percentage >= 60) {
      return 20;
    }

    return 10;
  }

  /* =======================================================
     SAVE COINS
  ======================================================= */

  async function saveCoins(
    coins,
    calculatedScore,
    percentage
  ) {
    if (
      !coins ||
      coins <= 0
    ) {
      setRewardCoins(0);

      setCoinStatus(
        "No coins earned for this result."
      );

      return false;
    }

    try {
      setCoinError("");

      setCoinStatus(
        "Adding coins..."
      );

      setRewardCoins(coins);

      const response =
        await fetch(
          "/api/user/coins",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials:
              "include",
            body: JSON.stringify(
              {
                coins,
                amount: coins,
                reward: coins,
                score:
                  calculatedScore,
                percentage,
                quizId:
                  quiz?._id ||
                  quiz?.id ||
                  null,
                quizTitle:
                  quiz?.title ||
                  "Quiz",
                type: "quiz",
              }
            ),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data = null;
      let rawText = "";

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        rawText =
          await response.text();
      }

      if (!response.ok) {
        const message =
          data?.message ||
          data?.error ||
          (response.status ===
          404
            ? "Unable to find your user account or coin API route."
            : rawText?.slice(
                0,
                200
              )) ||
          `Coin request failed (${response.status}).`;

        throw new Error(
          message
        );
      }

      const newBalance =
        data?.coins ??
        data?.balance ??
        data?.user?.progress
          ?.coins ??
        null;

      setRewardSaved(true);

      if (
        newBalance !== null
      ) {
        setCoinStatus(
          `+${coins} coins added. Your balance is ${newBalance} coins.`
        );
      } else {
        setCoinStatus(
          `+${coins} coins added successfully.`
        );
      }

      return true;
    } catch (err) {
      console.error(
        "COIN SAVE ERROR:",
        err
      );

      setRewardSaved(false);

      setCoinError(
        err?.message ||
          "Unable to add coins."
      );

      setCoinStatus("");

      return false;
    }
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    autoSubmit = false
  ) {
    if (
      submitted ||
      submitting
    ) {
      return;
    }

    if (!autoSubmit) {
      const unanswered =
        questions.filter(
          (_, index) =>
            !isQuestionAnswered(
              index
            )
        ).length;

      if (
        unanswered > 0
      ) {
        const confirmed =
          window.confirm(
            `You have ${unanswered} unanswered question${
              unanswered ===
              1
                ? ""
                : "s"
            }. Submit anyway?`
          );

        if (!confirmed) {
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      const calculatedScore =
        calculateScore();

      const totalPoints =
        questions.reduce(
          (total, q) =>
            total +
            Math.max(
              0,
              Number(
                q?.marks ?? 1
              )
            ),
          0
        );

      const calculatedPercentage =
        totalPoints > 0
          ? Math.round(
              (calculatedScore /
                totalPoints) *
                100
            )
          : 0;

      const calculatedPassed =
        calculatedPercentage >=
        50;

      console.log(
        "[quiz] FINAL RESULT:",
        {
          score:
            calculatedScore,
          total:
            totalPoints,
          percentage:
            calculatedPercentage,
          passed:
            calculatedPassed,
        }
      );

      setScore(
        calculatedScore
      );

      const coins =
        calculateRewardCoins(
          calculatedPercentage,
          calculatedPassed
        );

      setRewardCoins(coins);

      setSubmitted(true);

      if (coins > 0) {
        await saveCoins(
          coins,
          calculatedScore,
          calculatedPercentage
        );
      } else {
        setCoinStatus(
          "Complete 50% or more to earn coins."
        );
      }
    } catch (err) {
      console.error(
        "SUBMIT ERROR:",
        err
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     RESTART
  ======================================================= */

  function restartQuiz() {
    setAnswers({});
    setCodingAnswers({});
    setFlagged({});

    setCurrentQuestion(0);

    setSubmitted(false);
    setScore(0);

    setRewardCoins(0);
    setRewardSaved(false);
    setCoinStatus("");
    setCoinError("");

    setTimeLeft(
      Math.max(
        1,
        Number(
          quiz?.duration ||
            30
        )
      ) * 60
    );
  }

  /* =======================================================
     TOTAL
  ======================================================= */

  const totalPoints =
    questions.reduce(
      (total, q) =>
        total +
        Math.max(
          0,
          Number(
            q?.marks ?? 1
          )
        ),
      0
    );

  const percentage =
    totalPoints > 0
      ? Math.round(
          (score /
            totalPoints) *
            100
        )
      : 0;

  const passed =
    percentage >= 50;

  const answeredCount =
    questions.filter(
      (_, index) =>
        isQuestionAnswered(
          index
        )
    ).length;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b12] text-gray-300">
        <div className="flex items-center gap-3">
          <Loader2
            size={20}
            className="animate-spin text-indigo-400"
          />
          Loading quiz...
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error ||
    !quiz
  ) {
    return (
      <div className="min-h-screen bg-[#080b12] px-6 py-20 text-gray-300">
        <div className="mx-auto max-w-lg text-center">
          <XCircle
            size={40}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-4 text-2xl font-bold text-white">
            Quiz unavailable
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "No quiz available."}
          </p>

          <a
            href="/games"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft
              size={16}
            />
            Back to Topics
          </a>
        </div>
      </div>
    );
  }

  /* =======================================================
     NO QUESTIONS
  ======================================================= */

  if (
    questions.length === 0
  ) {
    return (
      <div className="min-h-screen bg-[#080b12] px-6 py-20 text-gray-300">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-bold text-white">
            No questions
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This quiz has no questions.
          </p>

          <a
            href="/games"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-white"
          >
            Back to Topics
          </a>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[#080b12] px-6 py-20 text-center text-gray-300">
        Question unavailable.
      </div>
    );
  }

  /* =======================================================
     RESULT
  ======================================================= */

  if (submitted) {
    return (
      <ResultScreen
        quiz={quiz}
        score={score}
        totalPoints={totalPoints}
        percentage={percentage}
        passed={passed}
        answers={answers}
        codingAnswers={
          codingAnswers
        }
        questions={questions}
        restartQuiz={restartQuiz}
        rewardCoins={
          rewardCoins
        }
        coinStatus={
          coinStatus
        }
        coinError={
          coinError
        }
        rewardSaved={
          rewardSaved
        }
      />
    );
  }

  const currentAnswer =
    answers[currentQuestion];

  const currentCodingAnswer =
    codingAnswers[
      currentQuestion
    ] || {};

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#080b12] text-gray-300">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-[#0b0f19]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <a
              href="/games"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white"
            >
              <ArrowLeft
                size={17}
              />

              <span className="hidden sm:inline">
                Exit
              </span>
            </a>

            <div className="h-5 w-px bg-gray-800" />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {quiz.title}
              </p>

              <p className="text-xs text-gray-600">
                Question{" "}
                {currentQuestion +
                  1}{" "}
                of{" "}
                {questions.length}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm font-semibold ${
              timeLeft <= 60
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : timeLeft <=
                  300
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                : "border-gray-800 bg-[#0d1222] text-gray-300"
            }`}
          >
            <Clock3
              size={17}
            />

            {formatTime(
              timeLeft
            )}
          </div>
        </div>
      </header>

      <div className="h-1 bg-gray-900">
        <div
          className="h-full bg-indigo-600 transition-all"
          style={{
            width: `${
              ((currentQuestion +
                1) /
                questions.length) *
              100
            }%`,
          }}
        />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <section className="min-w-0">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400">
                    Question{" "}
                    {currentQuestion +
                      1}
                  </span>

                  <span className="rounded-md border border-gray-800 px-2 py-1 text-xs text-gray-500">
                    {question?.marks ??
                      1}{" "}
                    point
                    {Number(
                      question?.marks ??
                        1
                    ) !== 1
                      ? "s"
                      : ""}
                  </span>

                  {question?.difficulty && (
                    <span className="rounded-md border border-gray-800 px-2 py-1 text-xs text-gray-500">
                      {
                        question.difficulty
                      }
                    </span>
                  )}

                  {question.type ===
                    "coding" && (
                    <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-xs text-purple-400">
                      Coding
                    </span>
                  )}
                </div>

                {question?.title && (
                  <h1 className="mb-2 text-xl font-bold text-white md:text-2xl">
                    {
                      question.title
                    }
                  </h1>
                )}

                {question.type !==
                  "coding" && (
                  <p className="whitespace-pre-wrap text-lg font-semibold leading-relaxed text-white md:text-xl">
                    {question?.statement ||
                      "Question"}
                  </p>
                )}
              </div>

              <button
                onClick={
                  toggleFlag
                }
                className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                  flagged[
                    currentQuestion
                  ]
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    : "border-gray-800 text-gray-500 hover:text-white"
                }`}
              >
                <Flag
                  size={15}
                />

                <span className="hidden sm:inline">
                  {flagged[
                    currentQuestion
                  ]
                    ? "Flagged"
                    : "Flag"}
                </span>
              </button>
            </div>

            {/* MCQ */}

            {question.type ===
              "mcq" && (
              <div className="space-y-3">
                {(
                  question.options ||
                  []
                ).map(
                  (
                    option,
                    index
                  ) => {
                    const selected =
                      Number(
                        currentAnswer
                      ) === index;

                    const letter =
                      String.fromCharCode(
                        65 +
                          index
                      );

                    return (
                      <button
                        key={
                          index
                        }
                        onClick={() =>
                          selectAnswer(
                            index
                          )
                        }
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-gray-800 bg-[#0d1222] hover:border-gray-700"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-bold ${
                            selected
                              ? "border-indigo-500 bg-indigo-600 text-white"
                              : "border-gray-700 bg-gray-900 text-gray-500"
                          }`}
                        >
                          {
                            letter
                          }
                        </div>

                        <span className="flex-1 text-sm text-gray-300">
                          {String(
                            option?.text ??
                              option ??
                              ""
                          )}
                        </span>

                        {selected && (
                          <CheckCircle2
                            size={
                              19
                            }
                            className="text-indigo-400"
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}

            {/* MULTIPLE */}

            {question.type ===
              "multiple" && (
              <div>
                <p className="mb-4 text-sm text-gray-500">
                  Select all correct answers.
                </p>

                <div className="space-y-3">
                  {(
                    question.options ||
                    []
                  ).map(
                    (
                      option,
                      index
                    ) => {
                      const selected =
                        Array.isArray(
                          currentAnswer
                        ) &&
                        currentAnswer
                          .map(Number)
                          .includes(
                            index
                          );

                      const letter =
                        String.fromCharCode(
                          65 +
                            index
                        );

                      return (
                        <button
                          key={
                            index
                          }
                          onClick={() =>
                            toggleMultipleAnswer(
                              index
                            )
                          }
                          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left ${
                            selected
                              ? "border-indigo-500 bg-indigo-500/10"
                              : "border-gray-800 bg-[#0d1222] hover:border-gray-700"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-bold ${
                              selected
                                ? "border-indigo-500 bg-indigo-600 text-white"
                                : "border-gray-700 bg-gray-900 text-gray-500"
                            }`}
                          >
                            {
                              letter
                            }
                          </div>

                          <span className="flex-1 text-sm text-gray-300">
                            {String(
                              option?.text ??
                                option ??
                                ""
                            )}
                          </span>

                          {selected && (
                            <CheckCircle2
                              size={
                                19
                              }
                              className="text-indigo-400"
                            />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* CODING */}

            {question.type ===
              "coding" && (
              <CodingQuestion
                question={
                  question
                }
                value={
                  currentCodingAnswer
                }
                onChange={(
                  value
                ) =>
                  updateCodingAnswer(
                    currentQuestion,
                    value
                  )
                }
              />
            )}

            {/* NAVIGATION */}

            <div className="mt-8 flex items-center justify-between border-t border-gray-800 pt-6">
              <button
                onClick={
                  previousQuestion
                }
                disabled={
                  currentQuestion ===
                  0
                }
                className="flex items-center gap-2 rounded-lg border border-gray-800 bg-[#0d1222] px-4 py-2.5 text-sm text-gray-400 disabled:opacity-30"
              >
                <ChevronLeft
                  size={17}
                />
                Previous
              </button>

              {currentQuestion ===
              questions.length -
                1 ? (
                <button
                  onClick={() =>
                    handleSubmit(
                      false
                    )
                  }
                  disabled={
                    submitting
                  }
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2
                      size={
                        16
                      }
                      className="animate-spin"
                    />
                  ) : (
                    <Send
                      size={
                        16
                      }
                    />
                  )}

                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={
                    nextQuestion
                  }
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Next

                  <ChevronRight
                    size={17}
                  />
                </button>
              )}
            </div>
          </section>

          {/* SIDEBAR */}

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-gray-800 bg-[#0d1222] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Progress
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {
                      answeredCount
                    }{" "}
                    /{" "}
                    {
                      questions.length
                    }
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">
                  {Math.round(
                    (answeredCount /
                      questions.length) *
                      100
                  )}
                  %
                </div>
              </div>

              <p className="mb-3 text-xs font-medium text-gray-500">
                Questions
              </p>

              <div className="grid grid-cols-5 gap-2">
                {questions.map(
                  (_, index) => {
                    const answered =
                      isQuestionAnswered(
                        index
                      );

                    const current =
                      currentQuestion ===
                      index;

                    return (
                      <button
                        key={
                          index
                        }
                        onClick={() =>
                          setCurrentQuestion(
                            index
                          )
                        }
                        className={`relative flex h-9 items-center justify-center rounded-md text-xs font-semibold ${
                          current
                            ? "bg-indigo-600 text-white"
                            : answered
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border border-gray-800 bg-gray-900 text-gray-500"
                        }`}
                      >
                        {
                          index +
                            1
                        }

                        {flagged[
                          index
                        ] && (
                          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-yellow-400" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-gray-800 pt-4 text-xs">
                <Legend
                  color="bg-indigo-600"
                  label="Current"
                />

                <Legend
                  color="bg-emerald-500"
                  label="Answered"
                />

                <Legend
                  color="bg-gray-700"
                  label="Not answered"
                />

                <Legend
                  color="bg-yellow-400"
                  label="Flagged"
                />
              </div>

              <button
                onClick={() =>
                  handleSubmit(
                    false
                  )
                }
                disabled={
                  submitting
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-400 disabled:opacity-50"
              >
                <Send
                  size={15}
                />

                Submit Quiz
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function Legend({
  color,
  label,
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${color}`}
      />

      <span className="text-gray-500">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   CODING QUESTION
========================================================= */

function CodingQuestion({
  question,
  value,
  onChange,
}) {
  const [
    selectedLanguage,
    setSelectedLanguage,
  ] = useState(
    value?.language ||
      question?.language ||
      "python"
  );

  const [code, setCode] =
    useState(
      value?.code || ""
    );

  const [input, setInput] =
    useState(
      value?.input || ""
    );

  const [output, setOutput] =
    useState(
      value?.output || ""
    );

  const [error, setError] =
    useState(
      value?.error || ""
    );

  const [running, setRunning] =
    useState(false);

  const starterCode =
    question?.starterCode ||
    {};

  /* =======================================================
     STARTER CODE
  ======================================================= */

  useEffect(() => {
    const language =
      selectedLanguage;

    const savedCode =
      value?.code;

    if (
      savedCode !==
        undefined &&
      savedCode !== null &&
      savedCode !== ""
    ) {
      setCode(savedCode);
      return;
    }

    const starter =
      starterCode?.[
        language
      ] || "";

    setCode(
      typeof starter ===
        "string"
        ? starter
        : ""
    );
  }, [
    selectedLanguage,
    question?._id,
  ]);

  /* =======================================================
     SYNC
  ======================================================= */

  useEffect(() => {
    if (
      value?.input !==
      undefined
    ) {
      setInput(value.input);
    }

    if (
      value?.output !==
      undefined
    ) {
      setOutput(value.output);
    }

    if (
      value?.error !==
      undefined
    ) {
      setError(value.error);
    }

    if (value?.language) {
      setSelectedLanguage(
        value.language
      );
    }
  }, [value]);

  /* =======================================================
     CODE CHANGE
  ======================================================= */

  function handleCodeChange(
    newCode
  ) {
    setCode(newCode);

    onChange({
      code: newCode,
      language:
        selectedLanguage,
      input,
      output,
      error,
      passed: false,
    });
  }

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  function handleInputChange(
    newInput
  ) {
    setInput(newInput);

    onChange({
      code,
      language:
        selectedLanguage,
      input: newInput,
      output,
      error,
      passed: false,
    });
  }

  /* =======================================================
     LANGUAGE
  ======================================================= */

  function changeLanguage(
    language
  ) {
    setSelectedLanguage(
      language
    );

    const starter =
      starterCode?.[
        language
      ] || "";

    const nextCode =
      typeof starter ===
        "string"
        ? starter
        : "";

    setCode(nextCode);
    setOutput("");
    setError("");

    onChange({
      code: nextCode,
      language,
      input,
      output: "",
      error: "",
      passed: false,
    });
  }

  /* =======================================================
     RUN CODE
  ======================================================= */

  async function runCode() {
    if (!code.trim()) {
      setError(
        "Please write some code first."
      );

      onChange({
        code,
        language:
          selectedLanguage,
        input,
        output: "",
        error:
          "Please write some code first.",
        passed: false,
      });

      return;
    }

    try {
      setRunning(true);
      setOutput("");
      setError("");

      const response =
        await fetch(
          "/api/execute-code",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              {
                sourceCode:
                  code,
                language:
                  selectedLanguage,
                stdin: input,
                testCases:
                  question?.testCases ||
                  [],
                questionId:
                  question?._id ||
                  question?.id ||
                  null,
              }
            ),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data = null;

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

        throw new Error(
          `Code API returned ${response.status}: ${text.slice(
            0,
            150
          )}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Code execution failed."
        );
      }

      const programOutput =
        data?.output ??
        data?.stdout ??
        "";

      const executionError =
        data?.stderr ||
        data?.compileOutput ||
        data?.error ||
        "";

      const passed =
        executionPassed(
          data,
          question,
          programOutput,
          executionError
        );

      setOutput(
        String(
          programOutput || ""
        )
      );

      if (executionError) {
        setError(
          String(
            executionError
          )
        );
      }

      console.log(
        "[coding] execution:",
        {
          data,
          output:
            programOutput,
          error:
            executionError,
          passed,
        }
      );

      onChange({
        code,
        language:
          selectedLanguage,
        input,
        output:
          String(
            programOutput || ""
          ),
        error:
          executionError
            ? String(
                executionError
              )
            : "",
        passed,
      });
    } catch (err) {
      console.error(
        "CODE EXECUTION ERROR:",
        err
      );

      const message =
        err?.message ||
        "Code execution failed.";

      setError(message);

      onChange({
        code,
        language:
          selectedLanguage,
        input,
        output: "",
        error: message,
        passed: false,
      });
    } finally {
      setRunning(false);
    }
  }

  /* =======================================================
     FORMAT
  ======================================================= */

  function getValue(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value);
    }

    try {
      return JSON.stringify(
        value,
        null,
        2
      );
    } catch {
      return String(value);
    }
  }

  return (
    <div className="space-y-5">
      {/* PROBLEM */}

      <div className="rounded-xl border border-gray-800 bg-[#0d1222] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Terminal
            size={17}
            className="text-purple-400"
          />

          <h3 className="text-sm font-semibold text-white">
            Problem Statement
          </h3>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-400">
          {getValue(
            question?.statement
          )}
        </p>
      </div>

      {/* INPUT FORMAT */}

      {question?.inputFormat && (
        <div className="rounded-xl border border-gray-800 bg-[#0d1222] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">
            Input Format
          </h3>

          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-400">
            {getValue(
              question.inputFormat
            )}
          </p>
        </div>
      )}

      {/* OUTPUT FORMAT */}

      {question?.outputFormat && (
        <div className="rounded-xl border border-gray-800 bg-[#0d1222] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">
            Output Format
          </h3>

          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-400">
            {getValue(
              question.outputFormat
            )}
          </p>
        </div>
      )}

      {/* CONSTRAINTS */}

      {question?.constraints && (
        <div className="rounded-xl border border-gray-800 bg-[#0d1222] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">
            Constraints
          </h3>

          <pre className="whitespace-pre-wrap rounded-lg bg-black p-4 font-mono text-xs leading-6 text-gray-400">
            {getValue(
              question.constraints
            )}
          </pre>
        </div>
      )}

      {/* EXAMPLES */}

      {Array.isArray(
        question?.examples
      ) &&
        question.examples
          .length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Examples
            </h3>

            {question.examples.map(
              (
                example,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="rounded-xl border border-gray-800 bg-[#0d1222] p-5"
                >
                  <p className="mb-3 text-xs font-semibold text-gray-500">
                    Example{" "}
                    {index +
                      1}
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs text-gray-600">
                        Input
                      </p>

                      <pre className="overflow-x-auto rounded-lg bg-black p-4 font-mono text-xs text-gray-400">
                        {getValue(
                          example?.input
                        )}
                      </pre>
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-gray-600">
                        Output
                      </p>

                      <pre className="overflow-x-auto rounded-lg bg-black p-4 font-mono text-xs text-emerald-400">
                        {getValue(
                          example?.output
                        )}
                      </pre>
                    </div>
                  </div>

                  {example?.explanation && (
                    <p className="mt-3 text-xs text-gray-500">
                      {
                        example.explanation
                      }
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        )}

      {/* CODE */}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">
            Your Code
          </h3>

          <div className="flex flex-wrap gap-2">
            {[
              "python",
              "javascript",
              "java",
              "cpp",
            ].map(
              (
                language
              ) => (
                <button
                  key={
                    language
                  }
                  type="button"
                  onClick={() =>
                    changeLanguage(
                      language
                    )
                  }
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    selectedLanguage ===
                    language
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-800 bg-[#0d1222] text-gray-500 hover:text-white"
                  }`}
                >
                  {
                    language
                  }
                </button>
              )
            )}
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) =>
            handleCodeChange(
              e.target.value
            )
          }
          spellCheck={false}
          className="min-h-[350px] w-full resize-y rounded-xl border border-gray-800 bg-black p-5 font-mono text-sm leading-6 text-emerald-400 outline-none focus:border-indigo-500"
          placeholder={`Write your ${selectedLanguage} code here...`}
        />
      </div>

      {/* INPUT */}

      <div className="rounded-xl border border-gray-800 bg-[#0d1222] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Custom Input
            </h3>

            <p className="mt-1 text-xs text-gray-600">
              This value is sent to the program as stdin.
            </p>
          </div>

          <span className="rounded-md bg-gray-900 px-2 py-1 font-mono text-xs text-gray-500">
            stdin
          </span>
        </div>

        <textarea
          value={input}
          onChange={(e) =>
            handleInputChange(
              e.target.value
            )
          }
          spellCheck={false}
          className="min-h-[130px] w-full resize-y rounded-lg border border-gray-800 bg-black p-4 font-mono text-sm leading-6 text-gray-300 outline-none focus:border-indigo-500"
          placeholder={
            "Enter input here...\nExample:\n10 20"
          }
        />
      </div>

      {/* RUN */}

      <button
        type="button"
        onClick={runCode}
        disabled={running}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {running ? (
          <>
            <Loader2
              size={17}
              className="animate-spin"
            />
            Running...
          </>
        ) : (
          <>
            <Play
              size={17}
            />
            Run Code
          </>
        )}
      </button>

      {/* RESULT STATUS */}

      {value?.passed === true && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CheckCircle2
              size={18}
            />
            Correct answer
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Your solution passed the configured tests.
          </p>
        </div>
      )}

      {value?.passed === false &&
        value?.code &&
        output &&
        !error && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-sm font-semibold text-yellow-400">
              Code executed
            </p>

            <p className="mt-1 text-xs text-gray-500">
              The program ran successfully, but it has not been confirmed as a correct solution.
            </p>
          </div>
        )}

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <h3 className="mb-2 text-sm font-semibold text-red-400">
            Error
          </h3>

          <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-red-300">
            {error}
          </pre>
        </div>
      )}

      {/* OUTPUT */}

      <div className="rounded-xl border border-gray-800 bg-[#0d1222] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Program Output
          </h3>

          {output && (
            <span className="text-xs text-emerald-400">
              Output received
            </span>
          )}
        </div>

        <pre className="min-h-[130px] whitespace-pre-wrap rounded-lg bg-black p-4 font-mono text-sm leading-6 text-emerald-400">
          {output ||
            "Output will appear here after you run your code."}
        </pre>
      </div>

      {/* TEST CASE COUNT */}

      {Array.isArray(
        question?.testCases
      ) &&
        question.testCases
          .length > 0 && (
          <div className="rounded-lg border border-gray-800 bg-[#0d1222] p-4 text-xs text-gray-500">
            This problem has{" "}
            {
              question
                .testCases
                .length
            }{" "}
            configured test cases.
          </div>
        )}
    </div>
  );
}

/* =========================================================
   RESULT SCREEN
========================================================= */

function ResultScreen({
  quiz,
  score,
  totalPoints,
  percentage,
  passed,
  answers,
  codingAnswers,
  questions,
  restartQuiz,
  rewardCoins,
  coinStatus,
  coinError,
  rewardSaved,
}) {
  return (
    <div className="min-h-screen bg-[#080b12] text-gray-300">
      <header className="border-b border-gray-800 bg-[#0b0f19]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a
            href="/games"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-white"
          >
            <ArrowLeft
              size={17}
            />
            Topics
          </a>

          <span className="font-semibold text-white">
            Quiz Result
          </span>

          <span className="text-sm text-gray-600">
            CodeQuest
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <section className="overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1222]">
          <div
            className={`p-8 text-center ${
              passed
                ? "bg-emerald-500/5"
                : "bg-red-500/5"
            }`}
          >
            <div
              className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
                passed
                  ? "bg-emerald-500/10"
                  : "bg-red-500/10"
              }`}
            >
              {passed ? (
                <Trophy
                  size={38}
                  className="text-emerald-400"
                />
              ) : (
                <XCircle
                  size={38}
                  className="text-red-400"
                />
              )}
            </div>

            <p
              className={`text-sm font-semibold uppercase tracking-wider ${
                passed
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {passed
                ? "Quiz Passed"
                : "Keep Practicing"}
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-white">
              {percentage}%
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {quiz.title}
            </p>
          </div>

          <div className="grid grid-cols-3 border-t border-gray-800">
            <ResultStat
              value={`${score}/${totalPoints}`}
              label="Score"
            />

            <ResultStat
              value={
                questions.filter(
                  (_, index) =>
                    isQuestionAnsweredForResult(
                      questions[index],
                      answers[index],
                      codingAnswers[index]
                    )
                ).length
              }
              label="Answered"
            />

            <ResultStat
              value={
                questions.length -
                questions.filter(
                  (_, index) =>
                    isQuestionAnsweredForResult(
                      questions[index],
                      answers[index],
                      codingAnswers[index]
                    )
                ).length
              }
              label="Skipped"
            />
          </div>

          {/* COINS */}

          <div className="border-t border-gray-800 p-6">
            <div
              className={`rounded-xl border p-5 ${
                rewardSaved
                  ? "border-yellow-500/20 bg-yellow-500/5"
                  : coinError
                  ? "border-red-500/20 bg-red-500/5"
                  : "border-gray-800 bg-black/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    rewardSaved
                      ? "bg-yellow-500/10"
                      : "bg-gray-800"
                  }`}
                >
                  <Coins
                    size={24}
                    className={
                      rewardSaved
                        ? "text-yellow-400"
                        : "text-gray-500"
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Quiz Reward
                  </p>

                  {rewardSaved ? (
                    <>
                      <h3 className="mt-1 text-xl font-bold text-yellow-400">
                        +{rewardCoins}{" "}
                        coins
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {
                          coinStatus
                        }
                      </p>
                    </>
                  ) : coinError ? (
                    <>
                      <h3 className="mt-1 text-base font-semibold text-red-400">
                        Coin reward failed
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {
                          coinError
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-1 text-base font-semibold text-gray-300">
                        No coins earned
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {
                          coinStatus
                        }
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-800 p-6 sm:flex-row sm:justify-center">
            <button
              onClick={
                restartQuiz
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#0b0f19] px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white"
            >
              <RotateCcw
                size={16}
              />
              Try Again
            </button>

            <a
              href="/games"
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Choose Another Topic

              <ChevronRight
                size={16}
              />
            </a>
          </div>
        </section>

        {/* REVIEW */}

        <section className="mt-8">
          <h2 className="text-lg font-bold text-white">
            Answer Review
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Review your submitted answers.
          </p>

          <div className="mt-4 space-y-3">
            {questions.map(
              (q, index) => {
                if (!q) {
                  return null;
                }

                const selected =
                  answers[index];

                const coding =
                  codingAnswers[
                    index
                  ];

                const isCorrect =
                  isQuestionCorrect(
                    q,
                    selected,
                    coding
                  );

                return (
                  <div
                    key={
                      q._id ||
                      q.id ||
                      index
                    }
                    className={`rounded-xl border p-5 ${
                      isCorrect
                        ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                        : "border-red-500/20 bg-red-500/[0.02]"
                    }`}
                  >
                    <div className="flex gap-3">
                      {isCorrect ? (
                        <CheckCircle2
                          size={
                            19
                          }
                          className="mt-0.5 shrink-0 text-emerald-400"
                        />
                      ) : (
                        <XCircle
                          size={
                            19
                          }
                          className="mt-0.5 shrink-0 text-red-400"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            {index +
                              1}
                            .{" "}
                            {q.title ||
                              q.statement ||
                              "Question"}
                          </p>

                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              isCorrect
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {isCorrect
                              ? "Correct"
                              : "Wrong"}
                          </span>
                        </div>

                        {/* MCQ */}

                        {q.type ===
                          "mcq" &&
                          selected !==
                            undefined &&
                          selected !==
                            null && (
                            <p className="mt-2 text-xs text-gray-500">
                              Your answer:{" "}
                              <span className="text-gray-300">
                                {
                                  q.options?.[
                                    Number(
                                      selected
                                    )
                                  ]?.text
                                }
                              </span>
                            </p>
                          )}

                        {/* MULTIPLE */}

                        {q.type ===
                          "multiple" &&
                          Array.isArray(
                            selected
                          ) && (
                            <div className="mt-2 space-y-1">
                              {selected.map(
                                (
                                  optionIndex
                                ) => (
                                  <p
                                    key={
                                      optionIndex
                                    }
                                    className="text-xs text-gray-500"
                                  >
                                    Your answer:{" "}
                                    <span className="text-gray-300">
                                      {
                                        q.options?.[
                                          Number(
                                            optionIndex
                                          )
                                        ]?.text
                                      }
                                    </span>
                                  </p>
                                )
                              )}
                            </div>
                          )}

                        {/* CORRECT ANSWER */}

                        {(q.type ===
                          "mcq" ||
                          q.type ===
                            "multiple") && (
                          <div className="mt-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
                            <p className="mb-1 text-xs font-semibold text-emerald-400">
                              Correct answer
                            </p>

                            <div className="space-y-1">
                              {getCorrectOptionIndexes(
                                q
                              ).map(
                                (
                                  optionIndex
                                ) => (
                                  <p
                                    key={
                                      optionIndex
                                    }
                                    className="text-xs text-gray-400"
                                  >
                                    {
                                      q.options?.[
                                        optionIndex
                                      ]?.text
                                    }
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* CODING */}

                        {q.type ===
                          "coding" && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">
                              Language:{" "}
                              <span className="text-gray-300">
                                {coding?.language ||
                                  q.language ||
                                  "python"}
                              </span>
                            </p>

                            <pre className="mt-2 max-h-60 overflow-auto rounded-lg bg-black p-4 font-mono text-xs text-emerald-400">
                              {coding?.code ||
                                "No code submitted."}
                            </pre>

                            {coding?.input && (
                              <pre className="mt-2 rounded-lg bg-black p-4 font-mono text-xs text-gray-400">
                                Input:
                                {"\n"}
                                {
                                  coding.input
                                }
                              </pre>
                            )}

                            {coding?.output && (
                              <pre className="mt-2 rounded-lg bg-black p-4 font-mono text-xs text-emerald-400">
                                Output:
                                {"\n"}
                                {
                                  coding.output
                                }
                              </pre>
                            )}
                          </div>
                        )}

                        {q.explanation && (
                          <div className="mt-3 rounded-lg border border-gray-800 bg-black/20 p-3 text-xs text-gray-500">
                            <span className="font-semibold text-gray-400">
                              Explanation:
                            </span>{" "}
                            {
                              q.explanation
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   RESULT ANSWERED HELPER
========================================================= */

function isQuestionAnsweredForResult(
  question,
  answer,
  coding
) {
  if (!question) {
    return false;
  }

  if (
    question.type === "coding"
  ) {
    return Boolean(
      coding?.code?.trim()
    );
  }

  if (
    answer === undefined ||
    answer === null
  ) {
    return false;
  }

  if (
    Array.isArray(answer)
  ) {
    return answer.length > 0;
  }

  if (
    typeof answer === "string" &&
    answer.trim() === ""
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   RESULT STAT
========================================================= */

function ResultStat({
  value,
  label,
}) {
  return (
    <div className="p-5 text-center">
      <p className="text-xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-600">
        {label}
      </p>
    </div>
  );
}
