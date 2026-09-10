import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      userId,
      coins,
      questionId,
    } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId is required.",
        },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid userId.",
        },
        { status: 400 }
      );
    }

    const reward = Math.max(
      0,
      Number(coins || 0)
    );

    if (reward <= 0) {
      return NextResponse.json({
        success: true,
        coinsAwarded: 0,
        message: "No coins to award.",
      });
    }

    /*
     * Atomically add coins.
     */

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            "progress.coins": reward,
          },
        },
        {
          new: true,
        }
      ).select(
        "username email progress.coins"
      );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    console.log(
      `Awarded ${reward} coins to ${updatedUser.username}`,
      {
        questionId,
        totalCoins:
          updatedUser.progress?.coins || 0,
      }
    );

    return NextResponse.json({
      success: true,
      coinsAwarded: reward,
      totalCoins:
        updatedUser.progress?.coins || 0,
    });
  } catch (error) {
    console.error(
      "AWARD COINS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to award coins.",
      },
      { status: 500 }
    );
  }
}
