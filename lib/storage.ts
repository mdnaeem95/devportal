import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for Cloudflare R2
// R2 is S3-compatible, so we use the S3 SDK
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // e.g., https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!; // e.g., https://files.devportal.app

interface UploadOptions {
  key: string;
  contentType: string;
  expiresIn?: number; // seconds
}

interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

/**
 * Generate a presigned URL for direct client-side upload to R2
 */
export async function getPresignedUploadUrl(options: UploadOptions): Promise<PresignedUrlResult> {
  const { key, contentType, expiresIn = 3600 } = options;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    uploadUrl,
    fileUrl: `${PUBLIC_URL}/${key}`,
    key,
  };
}

/**
 * Generate a presigned URL for downloading a private file
 */
export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Upload a file directly from the server (for small files or server-side processing)
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return `${PUBLIC_URL}/${key}`;
}

/**
 * Generate a unique file key for uploads
 */
export function generateFileKey(projectId: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `deliverables/${projectId}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Parse a file URL to extract the key
 */
export function getKeyFromUrl(fileUrl: string): string | null {
  if (!fileUrl.startsWith(PUBLIC_URL)) {
    return null;
  }
  return fileUrl.replace(`${PUBLIC_URL}/`, "");
}