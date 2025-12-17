import { S3Client } from "@aws-sdk/client-s3";

/**
 * Shared S3 client configuration
 */
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Validate AWS S3 configuration
 */
export function validateS3Config(): { valid: boolean; error?: string } {
  if (!process.env.AWS_REGION) {
    return { valid: false, error: "AWS_REGION is not configured" };
  }
  if (!process.env.AWS_ACCESS_KEY_ID) {
    return { valid: false, error: "AWS_ACCESS_KEY_ID is not configured" };
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    return { valid: false, error: "AWS_SECRET_ACCESS_KEY is not configured" };
  }
  if (!process.env.AWS_BUCKET_NAME) {
    return { valid: false, error: "AWS_BUCKET_NAME is not configured" };
  }
  return { valid: true };
}

export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

