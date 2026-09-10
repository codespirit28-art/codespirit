import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import { requireAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const { user, response } = await requireAdmin();

    if (response) {
      return response;
    }

    const body = await request.json();

    const {
      title,
      description,
      difficulty,
      topic,
      languages,
      points,
      inputFormat,
      outputFormat,
      constraints,
      starterCode,
      testCases,
    } = body;

    if (!title || !description || !topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, description and topic are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const problem = await Problem.create({
      title,
      description,
      difficulty: difficulty || "Easy",
      topic,
      languages: languages || [],
      points: points || 10,
      inputFormat: inputFormat || "",
      outputFormat: outputFormat || "",
      constraints: constraints || "",
      starterCode: starterCode || {},
      testCases: testCases || [],
      createdBy: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Problem created successfully",
        problem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PROBLEM ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create problem",
      },
      { status: 500 }
    );
  }
}