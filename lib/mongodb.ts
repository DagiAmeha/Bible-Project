import mongoose from "mongoose";

let isConnected = false; // Track connection status

export const connectDB = async () => {
  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  try {
    const uri_text = process.env.DATABSE_STRING!;

    if (!uri_text) {
      throw new Error("❌ MONGODB_URI is not defined in environment variables.");
    }
    const uri = uri_text.replace('<db_password>', process.env.DATABASE_PASSWORD!)
    // Connect to MongoDB
    await mongoose.connect(uri, {
      dbName: "bibleTracker", // your database name (optional)
      bufferCommands: false,
    });

    isConnected = true;
    console.log("🚀 MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
};
