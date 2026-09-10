import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and OTP are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is already verified",
        },
        { status: 400 }
      );
    }

    if (!user.otp || !user.otpExpiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    if (user.otp !== otp.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    // Mark email as verified
    user.isVerified = true;

    // Remove OTP after successful verification
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    // Create login token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

    // Store JWT in HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while verifying OTP",
      },
      { status: 500 }
    );
  }
}