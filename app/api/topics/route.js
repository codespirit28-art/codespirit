import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Topic from "@/models/topic";


// ============================================================
// GET TOPICS
// ============================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const chapterId =
      searchParams.get("chapterId");

    console.log(
      "GET /api/topics"
    );

    console.log(
      "chapterId:",
      chapterId
    );

    let query = {};

    if (chapterId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          chapterId
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid chapter ID",
          },
          {
            status: 400,
          }
        );
      }

      query = {
        chapterId:
          new mongoose.Types.ObjectId(
            chapterId
          ),
      };
    }

    const topics =
      await Topic.find(query)
        .sort({
          order: 1,
          createdAt: 1,
        })
        .lean();

    console.log(
      "TOPICS FOUND:",
      topics.length
    );

    return NextResponse.json(
      topics,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET TOPICS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load topics",
      },
      {
        status: 500,
      }
    );
  }
}


// ============================================================
// CREATE TOPIC
// ============================================================

export async function POST(request) {
  try {
    await connectDB();

    const body =
      await request.json();

    console.log(
      "POST /api/topics BODY:",
      body
    );

    const {
      title,
      description,
      chapterId,
      order,
      isFree,
      unlockCost,
    } = body;

    // ==========================================================
    // VALIDATION
    // ==========================================================

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Topic title is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !chapterId ||
      !mongoose.Types.ObjectId.isValid(
        chapterId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid chapterId is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================================
    // FREE / PAID
    // ==========================================================

    const free =
      isFree === true;

    const cost = free
      ? 0
      : Math.max(
          0,
          Number(
            unlockCost || 0
          )
        );

    // ==========================================================
    // CREATE
    // ==========================================================

    const topic =
      await Topic.create({
        title:
          title.trim(),

        description:
          description?.trim() ||
          "",

        chapterId:
          new mongoose.Types.ObjectId(
            chapterId
          ),

        order:
          Number(order || 0),

        isFree:
          free,

        unlockCost:
          cost,
      });

    console.log(
      "TOPIC CREATED:",
      topic._id
    );

    return NextResponse.json(
      {
        success: true,
        topic,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST TOPIC ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create topic",
      },
      {
        status: 500,
      }
    );
  }
}