import mongoose from "mongoose";

export const ANNOUNCEMENT_TONES = ["info", "success", "warning"] as const;
export type AnnouncementTone = (typeof ANNOUNCEMENT_TONES)[number];

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, maxlength: 4000 },
    tone: { type: String, enum: ANNOUNCEMENT_TONES, default: "info" },
    active: { type: Boolean, default: true, index: true },
    pinned: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

announcementSchema.index({ active: 1, createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema);
