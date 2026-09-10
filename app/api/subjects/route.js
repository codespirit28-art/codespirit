import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subject from "@/models/Subject";

export async function GET() {
  try {
    await connectDB();
    const subjects = await Subject.find().sort({ order: 1 });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("GET SUBJECTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, order } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "name is required" },
        { status: 400 }
      );
    }

    const count = await Subject.countDocuments();

    const subject = await Subject.create({
      name: name.trim(),
      order: order || count + 1,
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error("CREATE SUBJECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create subject" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );
    }

    const subject = await Subject.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error("UPDATE SUBJECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );
    }

    const deleted = await Subject.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE SUBJECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subject" },
      { status: 500 }
    );
  }
}