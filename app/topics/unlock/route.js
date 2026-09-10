import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Topic from "@/models/Topic";

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

    // ==========================================
    // BODY
    // ==========================================

    const body =
      await request.json();

    const topicId =
      body.topicId;

    if (
      !topicId ||
      !mongoose.Types.ObjectId.isValid(
        topicId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid topic",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // DATABASE
    // ==========================================

    await connectDB();

    const user =
      await User.findById(userId);

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

    const topic =
      await Topic.findById(topicId);

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Topic not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // MAKE SURE PROGRESS EXISTS
    // ==========================================

    if (!user.progress) {
      user.progress = {};
    }

    if (
      !Array.isArray(
        user.progress.unlockedTopics
      )
    ) {
      user.progress.unlockedTopics =
        [];
    }

    // ==========================================
    // ALREADY UNLOCKED?
    // ==========================================

    const alreadyUnlocked =
      user.progress.unlockedTopics.some(
        (id) =>
          String(id) ===
          String(topic._id)
      );

    if (alreadyUnlocked) {
      return NextResponse.json({
        success: true,
        alreadyUnlocked: true,
        message:
          "Topic is already unlocked",

        coins:
          user.progress.coins ?? 0,
      });
    }

    // ==========================================
    // FREE TOPIC
    // ==========================================

    if (
      topic.isFree !== false ||
      Number(topic.coinCost || 0) <= 0
    ) {
      user.progress.unlockedTopics.push(
        topic._id
      );

      await user.save();

      return NextResponse.json({
        success: true,
        unlocked: true,
        message:
          "Free topic unlocked",

        coins:
          user.progress.coins ?? 0,
      });
    }

    // ==========================================
    // PAID TOPIC
    // ==========================================

    const cost = Number(
      topic.coinCost || 0
    );

    const currentCoins = Number(
      user.progress.coins || 0
    );

    if (currentCoins < cost) {
      return NextResponse.json(
        {
          success: false,
          message:
            `You need ${cost} coins to unlock this topic. You currently have ${currentCoins}.`,
          requiredCoins: cost,
          coins: currentCoins,
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // DEDUCT COINS
    // ==========================================

    user.progress.coins =
      currentCoins - cost;

    // ==========================================
    // ADD UNLOCKED TOPIC
    // ==========================================

    user.progress.unlockedTopics.push(
      topic._id
    );

    // ==========================================
    // ACTIVITY
    // ==========================================

    const existingActivity =
      user.progress
        .recentActivity || [];

    user.progress.recentActivity = [
      {
        title:
          `Unlocked ${topic.title}`,
        type: "topic_unlock",
        difficulty: "",
        score: 0,
        coins: -cost,
        createdAt: new Date(),
      },

      ...existingActivity,
    ].slice(0, 10);

    // ==========================================
    // SAVE
    // ==========================================

    await user.save();

    return NextResponse.json({
      success: true,
      unlocked: true,

      message:
        `Unlocked ${topic.title}`,

      coins:
        user.progress.coins ?? 0,

      spentCoins: cost,

      topicId:
        topic._id,
    });
  } catch (error) {
    console.error(
      "UNLOCK TOPIC ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to unlock topic",
      },
      {
        status: 500,
      }
    );
  }
}
