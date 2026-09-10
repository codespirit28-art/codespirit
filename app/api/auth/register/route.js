import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationOTP } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();

    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 6 characters",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    let user;

    if (existingUser) {
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiresAt;

      user = await existingUser.save();
    } else {
      user = await User.create({
        username,
        email: normalizedEmail,
        password: hashedPassword,
        otp,
        otpExpiresAt,
      });
    }

    await sendVerificationOTP(normalizedEmail, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}