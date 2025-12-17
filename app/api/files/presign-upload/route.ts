import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  try {
    const { filename, mimeType, size } = await req.json();

    // Validation
    if (!filename || typeof filename !== "string" || filename.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid filename" },
        { status: 400 }
      );
    }

    if (!mimeType || typeof mimeType !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid mime type" },
        { status: 400 }
      );
    }

    if (size && typeof size === "number" && size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${Date.now()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ success: true, url, key });
  } catch (err: any) {
    console.error("Error creating presigned upload URL:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create upload URL", error: err.message },
      { status: 500 }
    );
  }
}


