import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { connectDB } from "@/lib/db";
import { File } from "@/lib/models";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: Request) {
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

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
        file.filename
      )}"`,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    console.error("Error creating download URL:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create download URL", error: err.message },
      { status: 500 }
    );
  }
}


