import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const base = process.env.DATABSE_STRING;
    const pass = process.env.DATABASE_PASSWORD;

    if (!base || !pass) {
      throw new Error("MongoDB env variables not loaded");
    }

    const uri = base.replace("<db_password>", pass);

    cached.promise = mongoose.connect(uri, {
      dbName: "bibleTracker",
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
