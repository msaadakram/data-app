import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Password } from "@/lib/models";
import { requireAuth } from "@/lib/auth";
import { validatePIN } from "@/lib/validation";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const authError = await requireAuth(req);
    if (authError) {
      return authError;
    }

    await connectDB();
    const { currentPassword, newPassword } = await req.json();

    // Validate current password
    const currentPinValidation = validatePIN(currentPassword);
    if (!currentPinValidation.valid) {
      return errorResponse(
        currentPinValidation.error || "Current password must be exactly 4 digits",
        400
      );
    }

    // Validate new password
    const newPinValidation = validatePIN(newPassword);
    if (!newPinValidation.valid) {
      return errorResponse(
        newPinValidation.error || "New password must be exactly 4 digits",
        400
      );
    }

    // Check if passwords are different
    if (currentPassword === newPassword) {
      return errorResponse(
        "New password must be different from current password",
        400
      );
    }

    // Get password record
    const record = await Password.findOne();
    if (!record) {
      return serverErrorResponse("Password not configured");
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, record.password);
    if (!isValid) {
      return unauthorizedResponse("Current password is incorrect");
    }

    // Update password
    record.password = await bcrypt.hash(newPassword, 10);
    await record.save();

    return successResponse(null, "Password changed successfully");
  } catch (err: any) {
    console.error("Error changing password:", err);
    return serverErrorResponse("Failed to change password", err.message);
  }
}


