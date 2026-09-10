import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const JUDGE0_URL =
  process.env.JUDGE0_URL || "https://ce.judge0.com";

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...extra,
    },
    { status }
  );
}

function normalizeOutput(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
}

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("EXECUTE CODE REQUEST:", {
      language: body?.language,
      hasSourceCode: Boolean(body?.sourceCode),
      hasStdin: Boolean(body?.stdin),
    });

    const sourceCode = body?.sourceCode;

    const language =
      String(body?.language || "java").toLowerCase();

    const stdin =
      body?.stdin == null
        ? ""
        : String(body.stdin);

    if (
      !sourceCode ||
      !String(sourceCode).trim()
    ) {
      return jsonError(
        "sourceCode is required.",
        400
      );
    }

    if (!LANGUAGE_IDS[language]) {
      return jsonError(
        `Unsupported language: ${language}`,
        400,
        {
          supportedLanguages:
            Object.keys(LANGUAGE_IDS),
        }
      );
    }

    /*
     * =====================================================
     * JUDGE0
     * =====================================================
     */

    const languageId =
      LANGUAGE_IDS[language];

    const baseUrl =
      JUDGE0_URL.replace(/\/$/, "");

    const headers = {
      "Content-Type":
        "application/json",
    };

    /*
     * RapidAPI is optional.
     *
     * If you use RapidAPI, these values
     * are added automatically.
     */

    if (
      process.env.JUDGE0_RAPIDAPI_KEY
    ) {
      headers[
        "X-RapidAPI-Key"
      ] =
        process.env.JUDGE0_RAPIDAPI_KEY;

      headers[
        "X-RapidAPI-Host"
      ] =
        process.env.JUDGE0_RAPIDAPI_HOST ||
        "judge0-ce.p.rapidapi.com";
    }

    /*
     * =====================================================
     * CREATE SUBMISSION
     * =====================================================
     */

    const submissionResponse =
      await fetch(
        `${baseUrl}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            source_code:
              String(sourceCode),

            language_id:
              languageId,

            stdin,

            cpu_time_limit: 5,

            memory_limit:
              128000,
          }),
          cache: "no-store",
        }
      );

    const submissionText =
      await submissionResponse.text();

    let submissionData;

    try {
      submissionData =
        JSON.parse(
          submissionText
        );
    } catch {
      console.error(
        "JUDGE0 INVALID RESPONSE:",
        submissionText
      );

      return jsonError(
        "Judge0 returned an invalid response.",
        502,
        {
          judge0Status:
            submissionResponse.status,
        }
      );
    }

    if (
      !submissionResponse.ok
    ) {
      console.error(
        "JUDGE0 SUBMISSION ERROR:",
        submissionData
      );

      return jsonError(
        submissionData?.message ||
          submissionData?.error ||
          "Judge0 submission failed.",
        submissionResponse.status,
        {
          judge0:
            submissionData,
        }
      );
    }

    /*
     * =====================================================
     * RESULT
     * =====================================================
     */

    const stdout =
      submissionData?.stdout || "";

    const stderr =
      submissionData?.stderr || "";

    const compileOutput =
      submissionData?.compile_output ||
      "";

    const message =
      submissionData?.message || "";

    const status =
      submissionData?.status || {};

    const statusId =
      Number(status?.id || 0);

    /*
     * Judge0 statuses:
     *
     * 1  In Queue
     * 2  Processing
     * 3  Accepted
     * 4  Wrong Answer
     * 5+ Runtime / compile / other errors
     */

    const accepted =
      statusId === 3;

    const output =
      stdout ||
      stderr ||
      compileOutput ||
      message ||
      "";

    console.log(
      "JUDGE0 RESULT:",
      {
        status: status?.description,
        statusId,
        accepted,
      }
    );

    return NextResponse.json(
      {
        success: true,

        accepted,

        output,

        stdout,

        stderr,

        compileOutput,

        status: status?.description || "",

        statusId,

        time:
          submissionData?.time ||
          null,

        memory:
          submissionData?.memory ||
          null,

        token:
          submissionData?.token ||
          null,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/execute-code ERROR:",
      error
    );

    return jsonError(
      error?.message ||
        "Code execution failed.",
      500
    );
  }
}
