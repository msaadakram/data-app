import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "./db";
import { Password } from "./models";
import bcrypt from "bcryptjs";

const SESSION_SECRET = process.env.SESSION_SECRET || "default-secret-change-in-production";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionData {
  authenticated: boolean;
  timestamp: number;
}

/**
 * Verify password and return success status
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    await connectDB();
    const record = await Password.findOne();
    
    if (!record) {
      // First time setup - use default password
      const defaultPassword = process.env.DEFAULT_PASSWORD || "1234";
      const hash = await bcrypt.hash(defaultPassword, 10);
      await Password.create({ password: hash });
      return password === defaultPassword;
    }

    return await bcrypt.compare(password, record.password);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Create a simple session token (encoded JSON)
 * In production, consider using JWT or proper session management
 */
export function createSession(): string {
  const session: SessionData = {
    authenticated: true,
    timestamp: Date.now(),
  };
  
  // Simple base64 encoding (not cryptographically secure, but works for basic auth)
  // For production, use JWT or proper session tokens
  const token = Buffer.from(JSON.stringify(session)).toString("base64");
  return token;
}

/**
 * Verify session token
 */
export function verifySession(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const session: SessionData = JSON.parse(decoded);
    
    // Check if session is valid and not expired
    const isExpired = Date.now() - session.timestamp > SESSION_DURATION;
    return session.authenticated && !isExpired;
  } catch (error) {
    return false;
  }
}

/**
 * Get session token from request headers
 */
export function getSessionToken(req: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check X-Session-Token header
  const sessionHeader = req.headers.get("x-session-token");
  if (sessionHeader) {
    return sessionHeader;
  }

  // Check cookie as fallback
  const sessionCookie = req.cookies.get("session_token");
  return sessionCookie?.value || null;
}

/**
 * Middleware function to check authentication
 */
export async function requireAuth(
  req: NextRequest
): Promise<NextResponse | null> {
  const token = getSessionToken(req);

  if (!verifySession(token)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return null; // Authentication passed
}

