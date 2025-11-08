import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  day: { type: Number, required: true },
  portion: { type: String, required: true },
  books: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});

const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);
export default Schedule;
