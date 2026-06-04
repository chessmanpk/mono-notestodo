import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, default: "", maxlength: 3000 },
    status: { type: String, enum: ["planning", "active", "paused", "completed", "archived"], default: "active", index: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    cycleMonth: { type: Number, required: true, index: true },
    cycleYear: { type: Number, required: true, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

projectSchema.index({ userId: 1, cycleMonth: 1, cycleYear: 1, status: 1 });

export default mongoose.model("Project", projectSchema);
