import mongoose, { Schema, model, models } from "mongoose";

// types/schedule.ts
interface ScheduleDay {
  _id: string;
  planId: mongoose.Types.ObjectId;
  day: number;
  portion: string;
  books: string[];
  createdAt?: string;
}
// models/Schedule.ts

const scheduleSchema = new Schema<ScheduleDay>({
  planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  day: { type: Number, required: true },
  portion: { type: String, required: true },
  books: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});

export default models.Schedule ||
  model<ScheduleDay>("Schedule", scheduleSchema);
