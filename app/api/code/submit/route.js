import { NextResponse } from "next/server";

/* =========================================================
   JUDGE0
========================================================= */

const JUDGE0_URL =
  process.env.JUDGE0_URL ||
  "https://ce.judge0.com";

/* =========================================================
   LANGUAGE IDS
========================================================= */

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

/* =========================================================
   NORMALIZE OUTPUT
========================================================= */

function normalizeOutput(
  value
) {
  return String(
    value || ""
  )
    .replace(/\r\n/g, "\n")
    .trim();
}

/* =========================================================
   EXECUTE ONE TEST
========================================================= */

async function executeCode({
  code,
  language,
  input,
}) {
  const languageId =
    LANGUAGE_IDS[language];

  if (!languageId) {
    throw new Error(
      `Unsupported language: ${language}`
    );
  }

  const response =
    await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          source_code: code,
          language_id:
            languageId,
          stdin: input || "",
        }),
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(
      text ||
        "Judge0 request failed."
    );
  }

  return response.json();
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request
) {
  try {
    const body =
      await request.json();

    const {
      code,
      language,
      testCases,
    } = body;

    if (!code?.trim()) {
      return NextResponse.json(
        {
          message:
            "Code is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!LANGUAGE_IDS[language]) {
      return NextResponse.json(
        {
          message:
            "Unsupported programming language.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(
        testCases
      ) ||
      testCases.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "No test cases configured for this coding question.",
        },
        {
          status: 400,
        }
      );
    }

    const results = [];

    for (
      const testCase of testCases
    ) {
      try {
        const execution =
          await executeCode({
            code,
            language,
            input:
              testCase.input ||
              "",
          });

        const actual =
          normalizeOutput(
            execution.stdout
          );

        const expected =
          normalizeOutput(
            testCase.expectedOutput
          );

        const passed =
          execution.status?.id ===
            3 &&
          actual === expected;

        results.push({
          passed,

          input:
            testCase.input || "",

          expected,

          actual,

          status:
            execution.status
              ?.description ||
            "Unknown",

          stderr:
            execution.stderr ||
            "",

          compileOutput:
            execution.compile_output ||
            "",
        });
      } catch (error) {
        results.push({
          passed: false,

          input:
            testCase.input || "",

          expected:
            testCase.expectedOutput ||
            "",

          actual: "",

          status: "Execution Error",

          stderr:
            error.message ||
            "Execution failed.",
        });
      }
    }

    const passed =
      results.length > 0 &&
      results.every(
        (result) =>
          result.passed
      );

    return NextResponse.json({
      passed,

      message: passed
        ? "All test cases passed."
        : "One or more test cases failed.",

      results,
    });
  } catch (error) {
    console.error(
      "CODE SUBMIT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error.message ||
          "Code execution failed.",
      },
      {
        status: 500,
      }
    );
  }
}
