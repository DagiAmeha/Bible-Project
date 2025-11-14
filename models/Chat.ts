import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastMessage: { type: String },
  lastMessageType: { type: String, enum: ["text", "audio"], default: "text" },
  status: { type: String, enum: ["open", "closed"], default: "open" },
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
