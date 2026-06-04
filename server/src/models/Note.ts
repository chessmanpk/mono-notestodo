import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    content: { type: String, default: "", maxlength: 50000 },
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
    cycleMonth: { type: Number, required: true, index: true },
    cycleYear: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, cycleMonth: 1, cycleYear: 1, pinned: -1 });

export default mongoose.model("Note", noteSchema);
