import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

/**
 * Media storage abstraction. Swap drivers with STORAGE_DRIVER.
 *
 *  local       — files under UPLOAD_DIR, served by /media/[...key] (default)
 *  cloudinary  — signed uploads to Cloudinary (CLOUDINARY_* env vars)
 *  s3          — interface ready; install @aws-sdk/client-s3 and implement
 */
export interface StoredFile {
  key: string;
  url: string;
  storage: "local" | "s3" | "cloudinary";
}

export interface StorageDriver {
  name: StoredFile["storage"];
  put(input: { buffer: Buffer; key: string; contentType: string }): Promise<StoredFile>;
  remove(key: string): Promise<void>;
}

// Uploads are runtime data: exclude from build output tracing.
const uploadRoot = () => path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.UPLOAD_DIR);

const localDriver: StorageDriver = {
  name: "local",
  async put({ buffer, key }) {
    const target = path.join(/*turbopackIgnore: true*/ uploadRoot(), key);
    if (!target.startsWith(uploadRoot())) throw new Error("Invalid storage key");
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buffer, { flag: "wx" });
    return { key, url: `/media/${key}`, storage: "local" };
  },
  async remove(key) {
    const target = path.join(/*turbopackIgnore: true*/ uploadRoot(), key);
    if (!target.startsWith(uploadRoot())) return;
    await unlink(target).catch(() => undefined);
  },
};

const cloudinaryDriver: StorageDriver = {
  name: "cloudinary",
  async put({ buffer, key, contentType }) {
    const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = env;
    if (!cloud || !apiKey || !secret) throw new Error("Cloudinary is not configured");
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `jarzdigital/${key.replace(/\.[a-z0-9]+$/i, "")}`;
    const signature = createHash("sha1").update(`public_id=${publicId}&timestamp=${timestamp}${secret}`).digest("hex");
    const form = new FormData();
    form.set("file", new Blob([new Uint8Array(buffer)], { type: contentType }));
    form.set("api_key", apiKey);
    form.set("timestamp", String(timestamp));
    form.set("public_id", publicId);
    form.set("signature", signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status})`);
    const json = (await res.json()) as { secure_url: string; public_id: string };
    return { key: json.public_id, url: json.secure_url, storage: "cloudinary" };
  },
  async remove(key) {
    const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = env;
    if (!cloud || !apiKey || !secret) return;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash("sha1").update(`public_id=${key}&timestamp=${timestamp}${secret}`).digest("hex");
    const form = new FormData();
    form.set("public_id", key);
    form.set("api_key", apiKey);
    form.set("timestamp", String(timestamp));
    form.set("signature", signature);
    await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: "POST", body: form }).catch(() => undefined);
  },
};

const s3Driver: StorageDriver = {
  name: "s3",
  async put() {
    // To enable: npm i @aws-sdk/client-s3, then PutObjectCommand to S3_BUCKET
    // and return `${S3_PUBLIC_URL}/${key}`. See README → Media configuration.
    throw new Error("S3 storage driver is not implemented yet. Set STORAGE_DRIVER=local or cloudinary.");
  },
  async remove() {
    /* no-op until implemented */
  },
};

/**
 * Serverless disks (Vercel) are read-only and wiped on every deploy, so local
 * uploads would be lost: there, Cloudinary is used when its keys are set, and
 * uploads otherwise fail with a message that says how to fix it.
 */
const serverlessGuard: StorageDriver = {
  ...localDriver,
  async put() {
    throw new Error("Uploads need shared storage on Vercel: set STORAGE_DRIVER=cloudinary and the CLOUDINARY_* variables, then redeploy.");
  },
};

export function getStorage(): StorageDriver {
  if (env.STORAGE_DRIVER === "local" && process.env.VERCEL) {
    const cloudinaryReady = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
    return cloudinaryReady ? cloudinaryDriver : serverlessGuard;
  }
  switch (env.STORAGE_DRIVER) {
    case "cloudinary":
      return cloudinaryDriver;
    case "s3":
      return s3Driver;
    default:
      return localDriver;
  }
}

export function getStorageByName(name: string): StorageDriver {
  return name === "cloudinary" ? cloudinaryDriver : name === "s3" ? s3Driver : localDriver;
}

/* ----------------------------- Validation ----------------------------- */

export const ALLOWED_IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
} as const;

/** Detects the real file type from magic bytes — never trust the client's MIME type. */
export function sniffImageType(buf: Buffer): keyof typeof ALLOWED_IMAGE_TYPES | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf.subarray(1, 4).toString() === "PNG") return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.subarray(0, 3).toString() === "GIF") return "image/gif";
  if (buf.subarray(4, 12).toString() === "ftypavif") return "image/avif";
  return null;
}

/** Reads pixel dimensions for PNG, JPEG, WebP and GIF without extra dependencies. */
export function imageDimensions(buf: Buffer): { width?: number; height?: number } {
  try {
    if (buf.subarray(1, 4).toString() === "PNG") return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (buf.subarray(0, 3).toString() === "GIF") return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    if (buf.subarray(0, 4).toString() === "RIFF") {
      const chunk = buf.subarray(12, 16).toString();
      if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") {
        const n = buf.readUInt32LE(21);
        return { width: (n & 0x3fff) + 1, height: ((n >> 14) & 0x3fff) + 1 };
      }
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) return {};
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
  } catch {
    /* fall through */
  }
  return {};
}

export function buildStorageKey(folder: string, ext: string): string {
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "general";
  const d = new Date();
  const stamp = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${safeFolder}/${stamp}/${randomBytes(10).toString("hex")}.${ext}`;
}
