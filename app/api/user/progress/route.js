import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    // ==========================================
    // AUTH
    // ==========================================

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired session",
        },
        {
          status: 401,
        }
      );
    }

    const userId =
      decoded.userId;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const body =
      await request.json();

    // ==========================================
    // VALUES
    // ==========================================

    const coinsToAdd = Number(
      body.coins ?? 0
    );

    const score = Number(
      body.score ?? 0
    );

    const problemsSolvedAdd =
      Number(
        body.problemsSolvedAdd ?? 0
      );

    const activity =
      body.activity || null;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !Number.isFinite(
        coinsToAdd
      ) ||
      coinsToAdd < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid coin amount",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        score
      ) ||
      score < 0 ||
      score > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid quiz score",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        problemsSolvedAdd
      ) ||
      problemsSolvedAdd < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid problems solved value",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // USER
    // ==========================================

    const user =
      await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to find your user account",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.progress) {
      user.progress = {};
    }

    // ==========================================
    // COINS
    // ==========================================

    const currentCoins =
      Number(
        user.progress.coins ?? 0
      );

    user.progress.coins =
      currentCoins +
      coinsToAdd;

    // ==========================================
    // PROBLEMS SOLVED
    // ==========================================

    const currentProblemsSolved =
      Number(
        user.progress
          .problemsSolved ?? 0
      );

    user.progress.problemsSolved =
      currentProblemsSolved +
      problemsSolvedAdd;

    // ==========================================
    // QUIZ STATISTICS
    // ==========================================

    /*
      IMPORTANT:

      Quiz attempts are separate from
      coding problems solved.
    */

    const isQuiz =
      body.isQuiz === true ||
      body.activity?.type ===
        "quiz";

    if (isQuiz) {
      const oldAttempts =
        Number(
          user.progress
            .quizAttempts ?? 0
        );

      const oldScoreTotal =
        Number(
          user.progress
            .quizScoreTotal ?? 0
        );

      const newAttempts =
        oldAttempts + 1;

      const newScoreTotal =
        oldScoreTotal + score;

      user.progress.quizAttempts =
        newAttempts;

      user.progress.quizScoreTotal =
        newScoreTotal;

      user.progress.quizScoreAvg =
        Math.round(
          (newScoreTotal /
            newAttempts) *
            100
        ) / 100;
    }

    // ==========================================
    // LEVEL
    // ==========================================

    const totalCoins =
      Number(
        user.progress.coins ?? 0
      );

    const calculatedLevel =
      Math.floor(
        Math.sqrt(
          totalCoins / 50
        )
      ) + 1;

    user.progress.level =
      Math.max(
        1,
        calculatedLevel
      );

    // ==========================================
    // STREAK
    // ==========================================

    if (
      body.updateStreak === true
    ) {
      user.progress.streak =
        Number(
          user.progress
            .streak ?? 0
        ) + 1;
    }

    // ==========================================
    // ACTIVE COURSE
    // ==========================================

    if (body.courseTitle) {
      if (
        !user.progress
          .activeCourse
      ) {
        user.progress.activeCourse =
          {};
      }

      user.progress.activeCourse.title =
        body.courseTitle;
    }

    if (
      body.courseModule !==
      undefined
    ) {
      if (
        !user.progress
          .activeCourse
      ) {
        user.progress.activeCourse =
          {};
      }

      user.progress.activeCourse.module =
        Number(
          body.courseModule
        );
    }

    if (
      body.courseProgress !==
      undefined
    ) {
      if (
        !user.progress
          .activeCourse
      ) {
        user.progress.activeCourse =
          {};
      }

      user.progress.activeCourse.progress =
        Math.min(
          100,
          Math.max(
            0,
            Number(
              body.courseProgress
            )
          )
        );
    }

    // ==========================================
    // ACTIVITY
    // ==========================================

    if (activity) {
      const newActivity = {
        title:
          activity.title ||
          "Quiz Completed",

        type:
          activity.type ||
          "quiz",

        difficulty:
          activity.difficulty ||
          "Medium",

        score:
          Number(
            activity.score ??
              score
          ),

        coins:
          coinsToAdd,

        createdAt:
          new Date(),
      };

      const existingActivity =
        user.progress
          .recentActivity ||
        [];

      user.progress.recentActivity =
        [
          newActivity,
          ...existingActivity,
        ].slice(0, 10);
    }

    // ==========================================
    // SAVE
    // ==========================================

    await user.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      message:
        "Dashboard progress updated successfully",

      progress: {
        problemsSolved:
          user.progress
            .problemsSolved ??
          0,

        totalProblems:
          user.progress
            .totalProblems ??
          2419,

        quizAttempts:
          user.progress
            .quizAttempts ??
          0,

        quizScoreAvg:
          user.progress
            .quizScoreAvg ??
          0,

        globalRank:
          user.progress
            .globalRank ??
          0,

        coins:
          user.progress.coins ??
          0,

        streak:
          user.progress.streak ??
          0,

        level:
          user.progress.level ??
          1,

        activeCourse:
          user.progress
            .activeCourse ??
          {},

        unlockedTopics:
          user.progress
            .unlockedTopics ??
          [],

        recentActivity:
          user.progress
            .recentActivity ??
          [],
      },
    });
  } catch (error) {
    console.error(
      "DASHBOARD PROGRESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update dashboard progress",
      },
      {
        status: 500,
      }
    );
  }
}
