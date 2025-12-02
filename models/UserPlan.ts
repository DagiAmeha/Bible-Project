import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserPlan extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  progress: number; // 0–100
  currentDay: number; // 1,2,3...
}

const UserPlanSchema = new Schema<IUserPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
      index: true,
    },

    startedAt: {
      type: Date,
      default: () => new Date(),
    },

    completedAt: {
      type: Date,
      default: null,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    progress: {
      type: Number,
      default: 0, // you can update this based on daily progress
      min: 0,
      max: 100,
    },

    currentDay: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Ensure a user cannot start the same plan multiple times accidentally
UserPlanSchema.index({ userId: 1, planId: 1 }, { unique: true });

export default mongoose.models.UserPlan ||
  mongoose.model<IUserPlan>("UserPlan", UserPlanSchema);
