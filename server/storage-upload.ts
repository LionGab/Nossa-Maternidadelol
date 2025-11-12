import { supabase } from "./supabase";
import { logger } from "./logger";

export interface UploadResult {
  url: string;
  path: string;
  publicUrl?: string;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer | Uint8Array,
  contentType: string,
  options?: {
    upsert?: boolean;
    cacheControl?: string;
  }
): Promise<UploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: options?.upsert ?? false,
        cacheControl: options?.cacheControl ?? "3600",
      });

    if (error) {
      logger.error({ err: error, bucket, path, msg: "Upload error" });
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
      url: data.path,
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    logger.error({ err: error, bucket, path, msg: "Upload file error" });
    throw error;
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      logger.error({ err: error, bucket, path, msg: "Delete file error" });
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  } catch (error) {
    logger.error({ err: error, bucket, path, msg: "Delete file error" });
    throw error;
  }
}

/**
 * Get signed URL for private file (temporary access)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      logger.error({ err: error, bucket, path, msg: "Get signed URL error" });
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    logger.error({ err: error, bucket, path, msg: "Get signed URL error" });
    throw error;
  }
}

/**
 * Validate file type
 */
export function validateFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

