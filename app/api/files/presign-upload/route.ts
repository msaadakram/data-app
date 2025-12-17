import { NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAuth } from "@/lib/auth";
import { validateFilename, validateFileSize, validateMimeType, sanitizeFilename } from "@/lib/validation";
import { s3Client, AWS_BUCKET_NAME, validateS3Config } from "@/lib/s3";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
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

    const { filename, mimeType, size } = await req.json();

    // Validate inputs
    const filenameValidation = validateFilename(filename);
    if (!filenameValidation.valid) {
      return errorResponse(filenameValidation.error || "Invalid filename", 400);
    }

    const mimeTypeValidation = validateMimeType(mimeType);
    if (!mimeTypeValidation.valid) {
      return errorResponse(mimeTypeValidation.error || "Invalid mime type", 400);
    }

    if (size !== undefined && size !== null) {
      const sizeValidation = validateFileSize(size, MAX_FILE_SIZE);
      if (!sizeValidation.valid) {
        return errorResponse(sizeValidation.error || "Invalid file size", 400);
      }
    }

    // Sanitize and generate S3 key
    const sanitizedFilename = sanitizeFilename(filename);
    const key = `uploads/${Date.now()}-${sanitizedFilename}`;

    // Create presigned URL
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return successResponse({ url, key }, "Upload URL created successfully", 200);
  } catch (err: any) {
    console.error("Error creating presigned upload URL:", err);
    return serverErrorResponse("Failed to create upload URL", err.message);
  }
}


