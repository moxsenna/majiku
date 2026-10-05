import { getCloudflareContext } from "@opennextjs/cloudflare";

// Fallback interface if global types are not loaded
export type R2ObjectBody = {
  body: ReadableStream;
  httpMetadata?: {
    contentType?: string;
  };
};

export type R2Bucket = {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob | File,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete?(keys: string | string[]): Promise<unknown>;
};

export const KEY_REGEX = /^(reports|gallery)\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getBucket(): R2Bucket {
  try {
    const ctx = getCloudflareContext();
    const bucket = (ctx?.env as Record<string, unknown> | undefined)?.PHOTOS_BUCKET as R2Bucket | undefined;
    if (!bucket) {
      throw new Error("R2 bucket PHOTOS_BUCKET tidak tersedia");
    }
    return bucket;
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "R2 bucket PHOTOS_BUCKET tidak tersedia") {
      throw err;
    }
    throw new Error("R2 bucket PHOTOS_BUCKET tidak tersedia");
  }
}

export async function putPhoto(prefix: string, file: File): Promise<string> {
  if (prefix !== "reports" && prefix !== "gallery") {
    throw new Error("Prefix tidak valid");
  }

  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) {
    throw new Error("Format file harus JPG/PNG/WebP");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file maksimal 5MB");
  }

  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const bucket = getBucket();
  await bucket.put(key, file, {
    httpMetadata: { contentType: file.type },
  });

  return key;
}

export async function getPhoto(key: string): Promise<R2ObjectBody | null> {
  if (!KEY_REGEX.test(key) || key.includes("..") || key.startsWith("/")) {
    return null;
  }

  const bucket = getBucket();
  return await bucket.get(key);
}
