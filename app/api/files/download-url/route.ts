import { NextRequest } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { connectDB } from "@/lib/db";
import { File } from "@/lib/models";
import { requireAuth } from "@/lib/auth";
import { validateObjectId } from "@/lib/validation";
import { s3Client, AWS_BUCKET_NAME, validateS3Config } from "@/lib/s3";
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const authError = await requireAuth(req);
    if (authError) {
      return authError;
    }

    // Validate S3 configuration
    const s3ConfigValidation = validateS3Config();
    if (!s3ConfigValidation.valid) {
      return serverErrorResponse(s3ConfigValidation.error || "S3 configuration error");
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate ID
    if (!id) {
      return errorResponse("File ID is required", 400);
    }

    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return errorResponse(idValidation.error || "Invalid file ID format", 400);
    }

    // Find file
    const file = await File.findById(id);
    if (!file) {
      return notFoundResponse("File not found");
    }

    // Create presigned download URL
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.filename)}"`,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return successResponse({ url }, "Download URL created successfully");
  } catch (err: any) {
    console.error("Error creating download URL:", err);
    return serverErrorResponse("Failed to create download URL", err.message);
  }
}


