import mongoose from "mongoose";

export const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export const PRAYER_STATUSES = ["pending", "onTime", "late", "qada", "missed"] as const;
export type PrayerStatus = (typeof PRAYER_STATUSES)[number];

const prayerStatusField = {
  type: String,
  enum: PRAYER_STATUSES,
  default: "pending",
};

const prayerLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Stored as the user's local calendar date "YYYY-MM-DD" rather than a Date object,
    // since prayer days are anchored to local midnight-to-midnight, not UTC.
    date: { type: String, required: true, index: true },
    month: { type: Number, required: true, index: true },
    year: { type: Number, required: true, index: true },
    fajr: prayerStatusField,
    dhuhr: prayerStatusField,
    asr: prayerStatusField,
    maghrib: prayerStatusField,
    isha: prayerStatusField,
  },
  { timestamps: true }
);

prayerLogSchema.index({ userId: 1, date: 1 }, { unique: true });
prayerLogSchema.index({ userId: 1, month: 1, year: 1 });

export default mongoose.model("PrayerLog", prayerLogSchema);
