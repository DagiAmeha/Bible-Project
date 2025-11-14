import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["text", "audio"], required: true },
  content: { type: String }, // For text messages
  audioUrl: { type: String }, // For voice messages
  status: { type: String, enum: ["sent", "delivered", "seen"], default: "sent" },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
