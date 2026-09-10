import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";

export async function GET() {
  try {
    await connectDB();

    const problems = await Problem.find({
      isActive: true,
    })
      .select(
        "_id title description difficulty topic languages points createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const formattedProblems = problems.map((problem) => ({
      id: problem._id.toString(),

      title: problem.title,

      description: problem.description,

      difficulty: problem.difficulty,

      topic: problem.topic,

      languages: problem.languages.join(" / "),

      points: problem.points,

      // Will be connected to user attempts later
      isSolved: false,
    }));

    return NextResponse.json({
      success: true,
      problems: formattedProblems,
    });
  } catch (error) {
    console.error("GET PROBLEMS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load problems",
      },
      { status: 500 }
    );
  }
}