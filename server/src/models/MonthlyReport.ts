import mongoose from "mongoose";

const monthlyReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: Number, required: true, index: true },
    year: { type: Number, required: true, index: true },
    type: { type: String, enum: ["automatic", "manual"], default: "automatic" },
    completedTasks: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 },
    notesCreated: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0 },
    summaryJson: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

monthlyReportSchema.index({ userId: 1, month: 1, year: 1, type: 1 }, { unique: true });

export default mongoose.model("MonthlyReport", monthlyReportSchema);
