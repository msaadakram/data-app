import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Password } from "@/lib/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { password } = await req.json();

    // Validation
    if (!password || typeof password !== "string" || !/^\d{4}$/.test(password)) {
      return NextResponse.json(
        { success: false, message: "Password must be exactly 4 digits" },
        { status: 400 }
      );
    }

    let record = await Password.findOne();

    // First time: create default password
    if (!record) {
      const defaultPassword = process.env.DEFAULT_PASSWORD || "1234";
      const hash = await bcrypt.hash(defaultPassword, 10);
      record = await Password.create({ password: hash });

      if (password !== defaultPassword) {
        return NextResponse.json(
          { success: false, message: "Invalid password" },
          { status: 401 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Authenticated with default password",
      });
    }

    const ok = await bcrypt.compare(password, record.password);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
    });
  } catch (err: any) {
    console.error("Authentication error:", err);
    return NextResponse.json(
      { success: false, message: "Authentication failed", error: err.message },
      { status: 500 }
    );
  }
}


