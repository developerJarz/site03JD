import "server-only";
import mongoose from "mongoose";
import { env, isDbConfigured } from "@/lib/env";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// Reuse the connection across hot reloads and serverless invocations.
const globalForMongoose = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = globalForMongoose.__mongoose ?? { conn: null, promise: null };
globalForMongoose.__mongoose = cache;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not configured.");
    this.name = "DatabaseNotConfiguredError";
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!isDbConfigured) throw new DatabaseNotConfiguredError();
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose
      .connect(env.MONGODB_URI!, {
        dbName: env.MONGODB_DB,
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export { isDbConfigured };
