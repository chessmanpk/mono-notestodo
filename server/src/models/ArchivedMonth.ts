import mongoose from "mongoose";

const archivedMonthSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: Number, required: true, index: true },
    year: { type: Number, required: true, index: true },
    archiveDataJson: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

archivedMonthSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("ArchivedMonth", archivedMonthSchema);
