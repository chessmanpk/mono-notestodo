import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, default: "", maxlength: 2000 },
    dueDate: { type: Date, default: null },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium", index: true },
    status: { type: String, enum: ["inbox", "active", "completed", "archived"], default: "inbox", index: true },
    recurring: { type: Boolean, default: false },
    recurringType: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
    tags: { type: [String], default: [] },
    cycleMonth: { type: Number, required: true, index: true },
    cycleYear: { type: Number, required: true, index: true },
    archived: { type: Boolean, default: false, index: true },
    completedAt: { type: Date, default: null },
    sourceRecurringTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, cycleMonth: 1, cycleYear: 1, status: 1 });

export default mongoose.model("Task", taskSchema);
