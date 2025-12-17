import { NextResponse } from "next/server";

/**
 * Consistent API response format
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    } as ApiResponse<T>,
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  error?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: error || message,
    } as ApiResponse,
    { status }
  );
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

/**
 * Create a not found response
 */
export function notFoundResponse(message: string = "Resource not found"): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

/**
 * Create an internal server error response
 */
export function serverErrorResponse(
  message: string = "Internal server error",
  error?: string
): NextResponse<ApiResponse> {
  return errorResponse(message, 500, error);
}

