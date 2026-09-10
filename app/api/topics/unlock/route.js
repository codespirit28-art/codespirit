import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Topic from "@/models/topic";


// ============================================================
// POST /api/topics/unlock
// ============================================================

export async function POST(request) {
  try {
    await connectDB();

    // ==========================================================
    // AUTHENTICATION
    // ==========================================================

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User is not authenticated",
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
    } catch (error) {
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
      decoded?.userId;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================================
    // BODY
    // ==========================================================

    const body =
      await request.json();

    const topicId =
      body?.topicId;

    if (
      !topicId ||
      !mongoose.Types.ObjectId.isValid(
        topicId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid topic ID",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================================
    // GET USER + TOPIC
    // ==========================================================

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const topic =
      await Topic.findById(
        topicId
      ).lean();

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Topic not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================================
    // CURRENT USER VALUES
    // ==========================================================

    const currentCoins =
      Number(
        user.progress?.coins || 0
      );

    const alreadyUnlocked =
      (
        user.progress
          ?.unlockedTopics || []
      ).some(
        (id) =>
          String(id) ===
          String(topic._id)
      );

    // ==========================================================
    // ALREADY UNLOCKED
    // ==========================================================

    if (alreadyUnlocked) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Topic already unlocked.",

          coins:
            currentCoins,

          unlockedTopics:
            (
              user.progress
                ?.unlockedTopics || []
            ).map((id) =>
              String(id)
            ),
        },
        {
          status: 200,
        }
      );
    }

    // ==========================================================
    // FREE TOPIC
    // ==========================================================

    const isFree =
      topic.isFree === true;

    if (isFree) {
      // --------------------------------------------------------
      // FREE TOPIC DOES NOT NEED COINS
      // --------------------------------------------------------

      if (!user.progress) {
        user.progress = {};
      }

      if (
        !user.progress
          .unlockedTopics
      ) {
        user.progress.unlockedTopics =
          [];
      }

      user.progress.unlockedTopics.push(
        topic._id
      );

      await user.save();

      return NextResponse.json(
        {
          success: true,

          message:
            "Free topic started successfully.",

          isFree: true,

          coins:
            Number(
              user.progress.coins ||
                0
            ),

          unlockedTopics:
            user.progress.unlockedTopics.map(
              (id) =>
                String(id)
            ),
        },
        {
          status: 200,
        }
      );
    }

    // ==========================================================
    // PAID TOPIC
    // ==========================================================

    const cost =
      Number(
        topic.unlockCost
      );

    // IMPORTANT:
    // Only paid topics require a valid price.

    if (
      !Number.isFinite(cost) ||
      cost <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This paid concept does not have a valid price.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================================
    // CHECK COINS
    // ==========================================================

    if (
      currentCoins <
      cost
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            `You need ${cost} coins. You currently have ${currentCoins}.`,

          coins:
            currentCoins,
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================================
    // DEDUCT COINS
    // ==========================================================

    user.progress.coins =
      currentCoins -
      cost;

    // ==========================================================
    // ADD UNLOCKED TOPIC
    // ==========================================================

    if (
      !user.progress
        .unlockedTopics
    ) {
      user.progress.unlockedTopics =
        [];
    }

    user.progress.unlockedTopics.push(
      topic._id
    );

    // ==========================================================
    // SAVE
    // ==========================================================

    await user.save();

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Topic unlocked successfully.",

        isFree: false,

        cost,

        coins:
          Number(
            user.progress.coins ||
              0
          ),

        unlockedTopics:
          user.progress.unlockedTopics.map(
            (id) =>
              String(id)
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/topics/unlock ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to unlock topic.",
      },
      {
        status: 500,
      }
    );
  }
}