import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectDB } from "@/lib/db";
import { File } from "@/lib/models";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    await connectDB();
    const files = await File.find().sort({ uploadedAt: -1 });
    return NextResponse.json({
      success: true,
      files: files.map((f) => ({
        id: f._id.toString(),
        filename: f.filename,
        size: f.size,
        mimeType: f.mimeType,
        uploadedAt: f.uploadedAt,
      })),
    });
  } catch (err: any) {
    console.error("Error loading files:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load files", error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { filename, size, mimeType, s3Key } = await req.json();

    // Validation
    if (!filename || typeof filename !== "string" || filename.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid filename" },
        { status: 400 }
      );
    }
    if (!size || typeof size !== "number" || size <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid file size" },
        { status: 400 }
      );
    }
    if (!mimeType || typeof mimeType !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid mime type" },
        { status: 400 }
      );
    }
    if (!s3Key || typeof s3Key !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid S3 key" },
        { status: 400 }
      );
    }

    const file = await File.create({ filename: filename.trim(), size, mimeType, s3Key });
    return NextResponse.json({
      success: true,
      file: {
        id: file._id.toString(),
        filename: file.filename,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
      },
    });
  } catch (err: any) {
    console.error("Error creating file record:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save file metadata", error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "File id required" },
        { status: 400 }
      );
    }

    const file = await File.findById(id);
    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    // Delete from S3
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: file.s3Key,
      });
      await s3.send(deleteCommand);
    } catch (s3Err: any) {
      console.error("Error deleting file from S3:", s3Err);
      // Continue to delete from database even if S3 delete fails
      // This prevents orphaned database records
    }

    // Delete from database
    await File.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting file:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete file", error: err.message },
      { status: 500 }
    );
  }
}


