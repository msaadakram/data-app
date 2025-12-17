import { NextRequest } from "next/server";
import { verifyPassword, createSession } from "@/lib/auth";
import { validatePIN } from "@/lib/validation";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    // Validate PIN format
    const pinValidation = validatePIN(password);
    if (!pinValidation.valid) {
      return errorResponse(pinValidation.error || "Invalid PIN format", 400);
    }

    // Verify password
    const isValid = await verifyPassword(password);
    if (!isValid) {
      return errorResponse("Invalid password", 401);
    }

    // Create session token
    const sessionToken = createSession();

    // Return success with session token
    const response = successResponse(
      { token: sessionToken },
      "Authentication successful",
      200
    );

    // Set session token in cookie and header
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });
    response.headers.set("X-Session-Token", sessionToken);

    return response;
  } catch (err: any) {
    console.error("Authentication error:", err);
    return serverErrorResponse("Authentication failed", err.message);
  }
}


