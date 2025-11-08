import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // hashed password for credentials login
  provider: { type: String, default: "credentials" }, // e.g., "google" or "credentials"
  role: { type: String, default: "user" }, // "user" or "admin"
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
