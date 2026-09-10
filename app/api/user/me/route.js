import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  try {
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

    const user =
      await User.findById(userId)
        .select(
          "-password -otp -otpExpiresAt"
        )
        .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      user: {
        _id: user._id,

        username:
          user.username,

        email:
          user.email,

        primaryLanguage:
          user.primaryLanguage,

        progress: {
          problemsSolved:
            user.progress
              ?.problemsSolved ??
            0,

          totalProblems:
            user.progress
              ?.totalProblems ??
            2419,

          quizAttempts:
            user.progress
              ?.quizAttempts ??
            0,

          quizScoreTotal:
            user.progress
              ?.quizScoreTotal ??
            0,

          quizScoreAvg:
            user.progress
              ?.quizScoreAvg ??
            0,

          globalRank:
            user.progress
              ?.globalRank ??
            0,

          coins:
            user.progress
              ?.coins ??
            0,

          streak:
            user.progress
              ?.streak ??
            0,

          level:
            user.progress
              ?.level ??
            1,

          activeCourse:
            user.progress
              ?.activeCourse ??
            {},

          unlockedTopics:
            user.progress
              ?.unlockedTopics ??
            [],

          recentActivity:
            user.progress
              ?.recentActivity ??
            [],
        },
      },
    });
  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load user",
      },
      {
        status: 500,
      }
    );
  }
}
