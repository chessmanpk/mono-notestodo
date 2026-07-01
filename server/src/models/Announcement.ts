import mongoose from "mongoose";

export const ANNOUNCEMENT_TONES = ["info", "success", "warning"] as const;
export type AnnouncementTone = (typeof ANNOUNCEMENT_TONES)[number];

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 900,
    },
    tone: {
      type: String,
      enum: ANNOUNCEMENT_TONES,
      default: "info",
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

announcementSchema.set("toJSON", {
  transform(_doc, ret) {
    const safe = ret as Record<string, unknown>;
    delete safe.__v;
    return safe;
  },
});

export default mongoose.model("Announcement", announcementSchema);
