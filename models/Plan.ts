import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, default: "en" },
  durationDays: { type: Number, required: true },
  startDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);
export default Plan;
