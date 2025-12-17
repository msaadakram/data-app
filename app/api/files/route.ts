import { NextRequest } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectDB } from "@/lib/db";
import { File } from "@/lib/models";
import { requireAuth } from "@/lib/auth";
import { validateFilename, validateFileSize, validateMimeType, validateObjectId } from "@/lib/validation";
import { s3Client, AWS_BUCKET_NAME } from "@/lib/s3";
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const authError = await requireAuth(req);
    if (authError) {
      return authError;
    }

    await connectDB();
    const files = await File.find().sort({ uploadedAt: -1 });
    
    const fileData = files.map((f) => ({
      id: f._id.toString(),
      filename: f.filename,
      size: f.size,
      mimeType: f.mimeType,
      uploadedAt: f.uploadedAt,
    }));

    return successResponse({ files: fileData }, undefined, 200);
  } catch (err: any) {
    console.error("Error loading files:", err);
    return serverErrorResponse("Failed to load files", err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const authError = await requireAuth(req);
    if (authError) {
      return authError;
    }

    await connectDB();
    const { filename, size, mimeType, s3Key } = await req.json();

    // Validate all inputs
    const filenameValidation = validateFilename(filename);
    if (!filenameValidation.valid) {
      return errorResponse(filenameValidation.error || "Invalid filename", 400);
    }

    const sizeValidation = validateFileSize(size);
    if (!sizeValidation.valid) {
      return errorResponse(sizeValidation.error || "Invalid file size", 400);
    }

    const mimeTypeValidation = validateMimeType(mimeType);
    if (!mimeTypeValidation.valid) {
      return errorResponse(mimeTypeValidation.error || "Invalid mime type", 400);
    }

    if (!s3Key || typeof s3Key !== "string" || s3Key.trim().length === 0) {
      return errorResponse("Invalid S3 key", 400);
    }

    // Create file record
    const file = await File.create({
      filename: filename.trim(),
      size,
      mimeType,
      s3Key: s3Key.trim(),
    });

    return successResponse(
      {
        id: file._id.toString(),
        filename: file.filename,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
      },
      "File metadata saved successfully",
      201
    );
  } catch (err: any) {
    console.error("Error creating file record:", err);
    return serverErrorResponse("Failed to save file metadata", err.message);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Require authentication
    const authError = await requireAuth(req);
    if (authError) {
      return authError;
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

    // Delete from S3
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: file.s3Key,
      });
      await s3Client.send(deleteCommand);
    } catch (s3Err: any) {
      console.error("Error deleting file from S3:", s3Err);
      // Continue to delete from database even if S3 delete fails
      // This prevents orphaned database records
    }

    // Delete from database
    await File.findByIdAndDelete(id);

    return successResponse(null, "File deleted successfully");
  } catch (err: any) {
    console.error("Error deleting file:", err);
    return serverErrorResponse("Failed to delete file", err.message);
  }
}


