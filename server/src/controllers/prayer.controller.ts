import type { Request, Response } from "express";
import PrayerLog, { PRAYER_NAMES, PRAYER_STATUSES, type PrayerName, type PrayerStatus } from "../models/PrayerLog.js";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateKey(dateKey: string) {
  if (!DATE_KEY_PATTERN.test(dateKey)) return null;
  const [year, month] = dateKey.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) return null;
  return { year, month };
}

function emptyLog(userId: string, date: string, month: number, year: number) {
  return {
    userId,
    date,
    month,
    year,
    fajr: "pending" as PrayerStatus,
    dhuhr: "pending" as PrayerStatus,
    asr: "pending" as PrayerStatus,
    maghrib: "pending" as PrayerStatus,
    isha: "pending" as PrayerStatus,
  };
}

// GET /api/prayers/:date  (date = YYYY-MM-DD)
// Returns the stored log for that day, or a virtual "all pending" log if the
// user hasn't touched that day yet. We intentionally don't write on read.
export async function getPrayerLog(req: Request, res: Response) {
  const dateKey = String(req.params.date);
  const parsed = parseDateKey(dateKey);
  if (!parsed) return res.status(400).json({ message: "Date must be in YYYY-MM-DD format" });

  const userId = req.user!.id;
  const log = await PrayerLog.findOne({ userId, date: dateKey }).lean();

  res.json({ log: log ?? emptyLog(userId, dateKey, parsed.month, parsed.year) });
}

// GET /api/prayers?month=&year=
// Returns every stored log for that month, used for the Prayers page history grid.
export async function getPrayerLogs(req: Request, res: Response) {
  const month = Number(req.query.month);
  const year = Number(req.query.year);

  if (!month || !year || month < 1 || month > 12) {
    return res.status(400).json({ message: "Valid month and year query params are required" });
  }

  const logs = await PrayerLog.find({ userId: req.user!.id, month, year }).sort({ date: 1 }).lean();
  res.json({ logs });
}

// PATCH /api/prayers/:date  { prayer: "fajr", status: "onTime" }
// Upserts a single prayer's status for a given day.
export async function upsertPrayerStatus(req: Request, res: Response) {
  const dateKey = String(req.params.date);
  const parsed = parseDateKey(dateKey);
  if (!parsed) return res.status(400).json({ message: "Date must be in YYYY-MM-DD format" });

  const { prayer, status } = req.body as { prayer?: PrayerName; status?: PrayerStatus };

  if (!prayer || !PRAYER_NAMES.includes(prayer)) {
    return res.status(400).json({ message: `Prayer must be one of: ${PRAYER_NAMES.join(", ")}` });
  }

  if (!status || !PRAYER_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${PRAYER_STATUSES.join(", ")}` });
  }

  const userId = req.user!.id;
  const log = await PrayerLog.findOneAndUpdate(
    { userId, date: dateKey },
    {
      $set: { [prayer]: status, month: parsed.month, year: parsed.year },
      $setOnInsert: { userId, date: dateKey },
    },
    { new: true, upsert: true }
  );

  res.json({ log });
}
