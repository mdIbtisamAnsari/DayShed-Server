import mongoose, { Schema } from "mongoose";

const tableSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, 
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    title: {
      type: String,
      required: [true, "Slot title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    systemComment: {
      type: String,
      trim: true,
    },
    importance: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
      required: true,
    },
    isTimeLocked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "partially_completed",
        "completed",
        "cancelled",
      ],
      default: "pending",
      required: true,
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    productivityIndex: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
      required: true,
    },
  },
  { timestamps: true }
);

tableSchema.index({ userId: 1, startTime: 1 });

export const Table = mongoose.model("Table", tableSchema); 