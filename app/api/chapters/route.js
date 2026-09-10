import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chapter from "@/models/Chapter";

export async function GET() {
  try {
    await connectDB();

    const chapters = await Chapter.find({})
      .sort({ subjectId: 1, order: 1 })
      .lean();

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("GET /api/chapters error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chapters",
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.subjectId) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject is required",
        },
        { status: 400 }
      );
    }

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Chapter title is required",
        },
        { status: 400 }
      );
    }

    const chapter = await Chapter.create({
      subjectId: body.subjectId,
      title: body.title.trim(),
      description: body.description?.trim() || "",
      order: body.order || 1,
    });

    return NextResponse.json(
      {
        success: true,
        chapter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/chapters error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create chapter",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Chapter ID is required",
        },
        { status: 400 }
      );
    }

    const chapter = await Chapter.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          message: "Chapter not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      chapter,
    });
  } catch (error) {
    console.error("PUT /api/chapters error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update chapter",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Chapter ID is required",
        },
        { status: 400 }
      );
    }

    const chapter = await Chapter.findByIdAndDelete(id);

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          message: "Chapter not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/chapters error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete chapter",
      },
      { status: 500 }
    );
  }
}
