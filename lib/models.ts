import mongoose, { Schema, models } from "mongoose";

const PasswordSchema = new Schema(
  {
    password: { type: String, required: true }, // bcrypt hash
  },
  { timestamps: true }
);

export const Password =
  models.Password || mongoose.model("Password", PasswordSchema);

const FileSchema = new Schema(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    s3Key: { type: String, required: true },
  },
  { timestamps: { createdAt: "uploadedAt" } }
);

export const File = models.File || mongoose.model("File", FileSchema);


