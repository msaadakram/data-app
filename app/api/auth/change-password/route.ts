import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Password } from "@/lib/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { currentPassword, newPassword } = await req.json();

    // Validation
    if (!currentPassword || typeof currentPassword !== "string" || !/^\d{4}$/.test(currentPassword)) {
      return NextResponse.json(
        { success: false, message: "Current password must be exactly 4 digits" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || !/^\d{4}$/.test(newPassword)) {
      return NextResponse.json(
        { success: false, message: "New password must be exactly 4 digits" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: "New password must be different from current password" },
        { status: 400 }
      );
    }

    const record = await Password.findOne();
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Password not configured" },
        { status: 500 }
      );
    }

    const ok = await bcrypt.compare(currentPassword, record.password);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    record.password = await bcrypt.hash(newPassword, 10);
    await record.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err: any) {
    console.error("Error changing password:", err);
    return NextResponse.json(
      { success: false, message: "Failed to change password", error: err.message },
      { status: 500 }
    );
  }
}


