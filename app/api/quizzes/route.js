import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Quiz from "@/models/Quiz";

export const dynamic = "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function jsonError(
  message,
  status = 500,
  extra = {}
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...extra,
    },
    { status }
  );
}

function isValidObjectId(id) {
  return (
    id &&
    mongoose.Types.ObjectId.isValid(
      String(id)
    )
  );
}

/* =========================================================
   BOOLEAN / CORRECT ANSWER HELPERS
========================================================= */

/**
 * Converts different representations of true/false
 * into a real boolean.
 *
 * Supports:
 *
 * true
 * "true"
 * "TRUE"
 * 1
 * "1"
 * "yes"
 * "y"
 * "correct"
 */
function isTruthyCorrect(value) {
  if (value === true) {
    return true;
  }

  if (value === 1) {
    return true;
  }

  if (typeof value === "string") {
    const normalized =
      value.trim().toLowerCase();

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
 * Detect correct answer from multiple
 * possible database/client formats.
 */
function isOptionCorrect(option) {
  if (
    !option ||
    typeof option !== "object"
  ) {
    return false;
  }

  /* correct */
  if (
    Object.prototype.hasOwnProperty.call(
      option,
      "correct"
    )
  ) {
    return isTruthyCorrect(
      option.correct
    );
  }

  /* isCorrect */
  if (
    Object.prototype.hasOwnProperty.call(
      option,
      "isCorrect"
    )
  ) {
    return isTruthyCorrect(
      option.isCorrect
    );
  }

  /* is_correct */
  if (
    Object.prototype.hasOwnProperty.call(
      option,
      "is_correct"
    )
  ) {
    return isTruthyCorrect(
      option.is_correct
    );
  }

  /* correctAnswer */
  if (
    Object.prototype.hasOwnProperty.call(
      option,
      "correctAnswer"
    )
  ) {
    return isTruthyCorrect(
      option.correctAnswer
    );
  }

  return false;
}

/* =========================================================
   NORMALIZE OPTION
========================================================= */

function normalizeOption(option) {
  if (
    !option ||
    typeof option !== "object"
  ) {
    return {
      text: "",
      correct: false,
    };
  }

  return {
    text:
      option?.text == null
        ? ""
        : String(option.text),

    /*
     * IMPORTANT:
     *
     * Do NOT use:
     *
     * option.correct === true
     *
     * because the client/database may send:
     *
     * "true"
     * 1
     * "1"
     * "yes"
     * isCorrect
     * is_correct
     */
    correct:
      isOptionCorrect(option),
  };
}

/* =========================================================
   NORMALIZE TEST CASE
========================================================= */

function normalizeTestCase(
  testCase
) {
  if (
    !testCase ||
    typeof testCase !== "object"
  ) {
    return {
      input: "",
      output: "",
      explanation: "",
      hidden: true,
    };
  }

  return {
    input:
      testCase?.input == null
        ? ""
        : String(
            testCase.input
          ),

    output:
      testCase?.output == null
        ? ""
        : String(
            testCase.output
          ),

    explanation:
      testCase?.explanation == null
        ? ""
        : String(
            testCase.explanation
          ),

    hidden:
      testCase?.hidden !== false,
  };
}

/* =========================================================
   NORMALIZE EXAMPLE
========================================================= */

function normalizeExample(
  example
) {
  if (
    !example ||
    typeof example !== "object"
  ) {
    return {
      input: "",
      output: "",
      explanation: "",
    };
  }

  return {
    input:
      example?.input == null
        ? ""
        : String(
            example.input
          ),

    output:
      example?.output == null
        ? ""
        : String(
            example.output
          ),

    explanation:
      example?.explanation == null
        ? ""
        : String(
            example.explanation
          ),
  };
}

/* =========================================================
   NORMALIZE STARTER CODE
========================================================= */

function normalizeStarterCode(
  starterCode
) {
  const source =
    starterCode &&
    typeof starterCode ===
      "object"
      ? starterCode
      : {};

  return {
    javascript:
      source?.javascript == null
        ? ""
        : String(
            source.javascript
          ),

    python:
      source?.python == null
        ? ""
        : String(
            source.python
          ),

    java:
      source?.java == null
        ? ""
        : String(
            source.java
          ),

    cpp:
      source?.cpp == null
        ? ""
        : String(
            source.cpp
          ),
  };
}

/* =========================================================
   NORMALIZE QUESTION
========================================================= */

function normalizeQuestion(
  question
) {
  if (
    !question ||
    typeof question !== "object"
  ) {
    return {
      type: "mcq",
      clientId: "",
      title: "",
      statement: "",
      difficulty: "Easy",
      marks: 1,
      coins: 0,
      negativeMarks: 0,
      tags: [],
      options: [],
      inputFormat: "",
      outputFormat: "",
      constraints: "",
      examples: [],
      starterCode: {
        javascript: "",
        python: "",
        java: "",
        cpp: "",
      },
      language: "python",
      testCases: [],
      explanation: "",
    };
  }

  /* -------------------------------------------------------
     OPTIONS
  ------------------------------------------------------- */

  const options =
    Array.isArray(
      question.options
    )
      ? question.options.map(
          normalizeOption
        )
      : [];

  /* -------------------------------------------------------
     DEBUG CORRECT ANSWERS
  ------------------------------------------------------- */

  console.log(
    "[quiz API] Normalizing question:",
    {
      type: question.type,
      originalOptions:
        question.options,
      normalizedOptions:
        options,
    }
  );

  /* -------------------------------------------------------
     STARTER CODE
  ------------------------------------------------------- */

  const starterCode =
    normalizeStarterCode(
      question.starterCode
    );

  /* -------------------------------------------------------
     EXAMPLES
  ------------------------------------------------------- */

  const examples =
    Array.isArray(
      question.examples
    )
      ? question.examples.map(
          normalizeExample
        )
      : [];

  /* -------------------------------------------------------
     TEST CASES
  ------------------------------------------------------- */

  const testCases =
    Array.isArray(
      question.testCases
    )
      ? question.testCases.map(
          normalizeTestCase
        )
      : [];

  /* -------------------------------------------------------
     TYPE
  ------------------------------------------------------- */

  const questionType = [
    "mcq",
    "multiple",
    "coding",
  ].includes(question?.type)
    ? question.type
    : "mcq";

  /* -------------------------------------------------------
     DIFFICULTY
  ------------------------------------------------------- */

  const questionDifficulty = [
    "Easy",
    "Medium",
    "Hard",
  ].includes(
    question?.difficulty
  )
    ? question.difficulty
    : "Easy";

  /* -------------------------------------------------------
     MARKS
  ------------------------------------------------------- */

  const marksNumber = Number(
    question?.marks ?? 1
  );

  /* -------------------------------------------------------
     COINS
  ------------------------------------------------------- */

  const coinsNumber = Number(
    question?.coins ?? 0
  );

  /* -------------------------------------------------------
     NEGATIVE MARKS
  ------------------------------------------------------- */

  const negativeMarksNumber =
    Number(
      question?.negativeMarks ?? 0
    );

  /* -------------------------------------------------------
     LANGUAGE
  ------------------------------------------------------- */

  const language = [
    "javascript",
    "python",
    "java",
    "cpp",
  ].includes(
    question?.language
  )
    ? question.language
    : "python";

  /* -------------------------------------------------------
     RETURN QUESTION
  ------------------------------------------------------- */

  return {
    type: questionType,

    clientId:
      question?.clientId == null
        ? ""
        : String(
            question.clientId
          ),

    title:
      question?.title == null
        ? ""
        : String(
            question.title
          ),

    statement:
      question?.statement == null
        ? ""
        : String(
            question.statement
          ),

    difficulty:
      questionDifficulty,

    marks: Number.isFinite(
      marksNumber
    )
      ? Math.max(
          0,
          marksNumber
        )
      : 1,

    coins: Number.isFinite(
      coinsNumber
    )
      ? Math.max(
          0,
          Math.floor(
            coinsNumber
          )
        )
      : 0,

    negativeMarks:
      Number.isFinite(
        negativeMarksNumber
      )
        ? Math.max(
            0,
            negativeMarksNumber
          )
        : 0,

    tags: Array.isArray(
      question?.tags
    )
      ? question.tags
      : [],

    options,

    inputFormat:
      question?.inputFormat == null
        ? ""
        : String(
            question.inputFormat
          ),

    outputFormat:
      question?.outputFormat == null
        ? ""
        : String(
            question.outputFormat
          ),

    constraints:
      question?.constraints == null
        ? ""
        : String(
            question.constraints
          ),

    examples,

    starterCode,

    language,

    testCases,

    explanation:
      question?.explanation == null
        ? ""
        : String(
            question.explanation
          ),
  };
}

/* =========================================================
   BUILD QUIZ DOCUMENT
========================================================= */

function buildQuizDocument(
  body
) {
  const {
    mainTopicId,
    title,
    description = "",
    difficulty = "Easy",
    duration = 30,
    status = "draft",
  } = body;

  const questions =
    Array.isArray(
      body.questions
    )
      ? body.questions
      : [];

  /* -------------------------------------------------------
     NORMALIZE QUESTIONS
  ------------------------------------------------------- */

  const normalizedQuestions =
    questions.map(
      normalizeQuestion
    );

  /* -------------------------------------------------------
     TOTAL MARKS
  ------------------------------------------------------- */

  const totalMarks =
    normalizedQuestions.reduce(
      (sum, question) =>
        sum +
        Number(
          question.marks || 0
        ),
      0
    );

  /* -------------------------------------------------------
     QUESTION COUNT
  ------------------------------------------------------- */

  const questionCount =
    normalizedQuestions.length;

  /* -------------------------------------------------------
     QUIZ DIFFICULTY
  ------------------------------------------------------- */

  const normalizedDifficulty = [
    "Easy",
    "Medium",
    "Hard",
  ].includes(difficulty)
    ? difficulty
    : "Easy";

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  const normalizedStatus =
    status === "published"
      ? "published"
      : "draft";

  /* -------------------------------------------------------
     DURATION
  ------------------------------------------------------- */

  const durationNumber =
    Number(duration ?? 30);

  const normalizedDuration =
    Number.isFinite(
      durationNumber
    )
      ? Math.max(
          1,
          Math.floor(
            durationNumber
          )
        )
      : 30;

  /* -------------------------------------------------------
     DOCUMENT
  ------------------------------------------------------- */

  return {
    mainTopicId:
      new mongoose.Types.ObjectId(
        mainTopicId
      ),

    title: String(
      title
    ).trim(),

    description: String(
      description
    ),

    difficulty:
      normalizedDifficulty,

    duration:
      normalizedDuration,

    totalMarks,

    questionCount,

    questions:
      normalizedQuestions,

    status:
      normalizedStatus,
  };
}

/* =========================================================
   VALIDATE COMMON FIELDS
========================================================= */

function validateQuizBody(
  body
) {
  const {
    mainTopicId,
    title,
  } = body;

  if (!mainTopicId) {
    return "mainTopicId is required.";
  }

  if (
    !isValidObjectId(
      mainTopicId
    )
  ) {
    return "Invalid mainTopicId.";
  }

  if (
    !title ||
    !String(title).trim()
  ) {
    return "Quiz title is required.";
  }

  return null;
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request
) {
  try {
    await connectDB();

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const topic =
      searchParams.get(
        "topic"
      );

    let filter = {};

    /* -------------------------------------------------------
       TOPIC FILTER
    ------------------------------------------------------- */

    if (topic) {
      if (
        !isValidObjectId(
          topic
        )
      ) {
        return jsonError(
          "Invalid topic ID.",
          400
        );
      }

      filter.mainTopicId =
        new mongoose.Types.ObjectId(
          topic
        );
    }

    /* -------------------------------------------------------
       FETCH QUIZZES
    ------------------------------------------------------- */

    const quizzes =
      await Quiz.find(filter)
        .sort({
          createdAt: -1,
        })
        .lean();

    /* -------------------------------------------------------
       IMPORTANT:
       NORMALIZE OPTIONS ON GET TOO
    ------------------------------------------------------- */

    const normalizedQuizzes =
      quizzes.map(
        (quiz) => {
          const normalizedQuestions =
            Array.isArray(
              quiz.questions
            )
              ? quiz.questions.map(
                  (question) => ({
                    ...question,

                    options:
                      Array.isArray(
                        question?.options
                      )
                        ? question.options.map(
                            normalizeOption
                          )
                        : [],
                  })
                )
              : [];

          return {
            ...quiz,
            questions:
              normalizedQuestions,
          };
        }
      );

    /* -------------------------------------------------------
       DEBUG
    ------------------------------------------------------- */

    console.log(
      "[quiz API] GET quizzes:",
      normalizedQuizzes.map(
        (quiz) => ({
          id: quiz._id,
          title: quiz.title,

          questions:
            quiz.questions.map(
              (question) => ({
                type:
                  question.type,

                options:
                  question.options,

                correctIndexes:
                  question.options
                    .map(
                      (
                        option,
                        index
                      ) =>
                        option.correct
                          ? index
                          : null
                    )
                    .filter(
                      (
                        index
                      ) =>
                        index !==
                        null
                    ),
              })
            ),
        })
      )
    );

    /* -------------------------------------------------------
       PUBLISHED QUIZ
    ------------------------------------------------------- */

    const publishedQuiz =
      normalizedQuizzes.find(
        (quiz) =>
          quiz.status ===
          "published"
      ) ||
      normalizedQuizzes[0] ||
      null;

    /* -------------------------------------------------------
       RESPONSE
    ------------------------------------------------------- */

    return NextResponse.json({
      success: true,
      quizzes:
        normalizedQuizzes,
      quiz: publishedQuiz,
    });
  } catch (error) {
    console.error(
      "GET /api/quizzes ERROR:",
      error
    );

    return jsonError(
      error?.message ||
        "Failed to fetch quizzes."
    );
  }
}

/* =========================================================
   POST
   CREATE OR LEGACY UPDATE
========================================================= */

export async function POST(
  request
) {
  try {
    await connectDB();

    const body =
      await request.json();

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    const validationError =
      validateQuizBody(
        body
      );

    if (validationError) {
      return jsonError(
        validationError,
        400
      );
    }

    /* -------------------------------------------------------
       BUILD DOCUMENT
    ------------------------------------------------------- */

    const document =
      buildQuizDocument(
        body
      );

    /* -------------------------------------------------------
       DEBUG BEFORE SAVE
    ------------------------------------------------------- */

    console.log(
      "[quiz API] POST document:",
      {
        title:
          document.title,

        questions:
          document.questions.map(
            (question) => ({
              type:
                question.type,

              options:
                question.options,
            })
          ),
      }
    );

    /* -------------------------------------------------------
       SUPPORT OLD CLIENTS USING POST + ID
    ------------------------------------------------------- */

    const quizId =
      body._id ||
      body.id ||
      null;

    if (quizId) {
      if (
        !isValidObjectId(
          quizId
        )
      ) {
        return jsonError(
          "Invalid quiz ID.",
          400
        );
      }

      const updatedQuiz =
        await Quiz.findByIdAndUpdate(
          quizId,
          {
            $set: document,
          },
          {
            new: true,
            runValidators: true,
          }
        ).lean();

      if (!updatedQuiz) {
        return jsonError(
          "Quiz not found.",
          404
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Quiz updated successfully.",
        quiz: updatedQuiz,
      });
    }

    /* -------------------------------------------------------
       CREATE
    ------------------------------------------------------- */

    const quiz =
      await Quiz.create(
        document
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Quiz created successfully.",
        quiz: quiz.toObject(),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/quizzes ERROR:",
      error
    );

    return jsonError(
      error?.message ||
        "Failed to save quiz.",
      500,
      {
        errorName:
          error?.name ||
          "Error",
      }
    );
  }
}

/* =========================================================
   PUT
   UPDATE EXISTING QUIZ
========================================================= */

export async function PUT(
  request
) {
  try {
    await connectDB();

    const body =
      await request.json();

    /* -------------------------------------------------------
       QUIZ ID
    ------------------------------------------------------- */

    const quizId =
      body._id ||
      body.id ||
      null;

    if (!quizId) {
      return jsonError(
        "Quiz ID is required for update.",
        400
      );
    }

    if (
      !isValidObjectId(
        quizId
      )
    ) {
      return jsonError(
        "Invalid quiz ID.",
        400
      );
    }

    /* -------------------------------------------------------
       VALIDATE
    ------------------------------------------------------- */

    const validationError =
      validateQuizBody(
        body
      );

    if (validationError) {
      return jsonError(
        validationError,
        400
      );
    }

    /* -------------------------------------------------------
       BUILD DOCUMENT
    ------------------------------------------------------- */

    const document =
      buildQuizDocument(
        body
      );

    /* -------------------------------------------------------
       DEBUG
    ------------------------------------------------------- */

    console.log(
      "[quiz API] PUT document:",
      {
        quizId,

        title:
          document.title,

        questions:
          document.questions.map(
            (question) => ({
              type:
                question.type,

              options:
                question.options,
            })
          ),
      }
    );

    /* -------------------------------------------------------
       UPDATE
    ------------------------------------------------------- */

    const updatedQuiz =
      await Quiz.findByIdAndUpdate(
        quizId,
        {
          $set: document,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!updatedQuiz) {
      return jsonError(
        "Quiz not found.",
        404
      );
    }

    console.log(
      "Quiz updated successfully:",
      updatedQuiz._id
    );

    return NextResponse.json({
      success: true,
      message:
        "Quiz updated successfully.",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error(
      "PUT /api/quizzes ERROR:",
      error
    );

    return jsonError(
      error?.message ||
        "Failed to update quiz.",
      500,
      {
        errorName:
          error?.name ||
          "Error",
      }
    );
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function DELETE(
  request
) {
  try {
    await connectDB();

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const id =
      searchParams.get("id");

    if (!id) {
      return jsonError(
        "Quiz ID is required.",
        400
      );
    }

    if (
      !isValidObjectId(id)
    ) {
      return jsonError(
        "Invalid quiz ID.",
        400
      );
    }

    const deletedQuiz =
      await Quiz.findByIdAndDelete(
        id
      );

    if (!deletedQuiz) {
      return jsonError(
        "Quiz not found.",
        404
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Quiz deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/quizzes ERROR:",
      error
    );

    return jsonError(
      error?.message ||
        "Failed to delete quiz."
    );
  }
}
