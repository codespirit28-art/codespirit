import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Theory from "@/models/Theory";


// ============================================================
// GET THEORIES
// ============================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const mainTopicId = searchParams.get("mainTopicId");

    console.log("=================================");
    console.log("GET THEORIES");
    console.log("REQUESTED mainTopicId:", mainTopicId);
    console.log("=================================");

    const query = mainTopicId
      ? { mainTopicId }
      : {};

    const theories = await Theory.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    console.log("THEORIES FOUND:", theories.length);

    theories.forEach((theory) => {
      console.log({
        id: theory._id,
        mainTopicId: theory.mainTopicId,
        title: theory.title,
        status: theory.status,
        blocksCount: Array.isArray(theory.blocks)
          ? theory.blocks.length
          : 0,
      });
    });

    return NextResponse.json(theories);
  } catch (error) {
    console.error("GET THEORIES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch theories",
      },
      {
        status: 500,
      }
    );
  }
}


// ============================================================
// POST THEORY
// ============================================================

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    console.log("=================================");
    console.log("POST THEORY");
    console.log("BODY:", body);
    console.log("=================================");

    const {
      mainTopicId,
      title,
      status,
      blocks,
    } = body;

    if (!mainTopicId) {
      return NextResponse.json(
        {
          success: false,
          message: "mainTopicId is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        {
          status: 400,
        }
      );
    }

    const theory = await Theory.create({
      mainTopicId,
      title: title.trim(),

      status:
        status === "published"
          ? "published"
          : "draft",

      blocks: Array.isArray(blocks)
        ? blocks
        : [],
    });

    console.log("THEORY CREATED:", theory._id);

    return NextResponse.json(
      theory,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE THEORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to create theory",
      },
      {
        status: 500,
      }
    );
  }
}


// ============================================================
// PUT THEORY
// ============================================================

export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      id,
      ...updates
    } = body;

    console.log("=================================");
    console.log("UPDATE THEORY");
    console.log("ID:", id);
    console.log("=================================");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "id is required",
        },
        {
          status: 400,
        }
      );
    }

    if (updates.title) {
      updates.title = updates.title.trim();
    }

    if (updates.status !== undefined) {
      updates.status =
        updates.status === "published"
          ? "published"
          : "draft";
    }

    if (updates.blocks !== undefined) {
      updates.blocks = Array.isArray(
        updates.blocks
      )
        ? updates.blocks
        : [];
    }

    const theory =
      await Theory.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!theory) {
      return NextResponse.json(
        {
          success: false,
          message: "Theory not found",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "THEORY UPDATED:",
      theory._id
    );

    return NextResponse.json(theory);
  } catch (error) {
    console.error("UPDATE THEORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to update theory",
      },
      {
        status: 500,
      }
    );
  }
}


// ============================================================
// DELETE THEORY
// ============================================================

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "id is required",
        },
        {
          status: 400,
        }
      );
    }

    const deleted =
      await Theory.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Theory not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Theory deleted successfully",
    });
  } catch (error) {
    console.error("DELETE THEORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete theory",
      },
      {
        status: 500,
      }
    );
  }
}
