import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["bug", "feature", "general"],
      default: "general",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2500,
    },
    status: {
      type: String,
      enum: ["open", "reviewed", "closed"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

feedbackSchema.set("toJSON", {
  transform(_doc, ret) {
    const safe = ret as Record<string, unknown>;
    delete safe.__v;
    return safe;
  },
});

export default mongoose.model("Feedback", feedbackSchema);