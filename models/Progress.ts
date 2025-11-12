import mongoose from "mongoose";

const dailyProgressSchema = new mongoose.Schema({
  day: Number,
  completed: { type: Boolean, default: false },
  markedAt: { type: Date, default: Date.now },
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  dailyProgress: [dailyProgressSchema],
  updatedAt: { type: Date, default: Date.now },
});

const Progress =
  mongoose.models.Progress || mongoose.model("Progress", progressSchema);

export default Progress;
