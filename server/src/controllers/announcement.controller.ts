import type { Request, Response } from "express";
import Announcement, { ANNOUNCEMENT_TONES } from "../models/Announcement.js";

const AUTHOR_FIELDS = "fullName email role";

// GET /api/announcements — everyone signed in sees the active feed, newest first.
export async function getAnnouncements(_req: Request, res: Response) {
  const announcements = await Announcement.find({ active: true })
    .sort({ pinned: -1, createdAt: -1 })
    .limit(20)
    .populate("createdBy", AUTHOR_FIELDS)
    .populate("updatedBy", AUTHOR_FIELDS)
    .lean();

  res.json({ announcements });
}

// GET /api/announcements/admin — admins see everything, including inactive/retired ones.
export async function getAllAnnouncementsAdmin(_req: Request, res: Response) {
  const announcements = await Announcement.find({})
    .sort({ pinned: -1, createdAt: -1 })
    .populate("createdBy", AUTHOR_FIELDS)
    .populate("updatedBy", AUTHOR_FIELDS)
    .lean();

  res.json({ announcements });
}

export async function createAnnouncement(req: Request, res: Response) {
  const { title, message, tone, active } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required" });
  }

  if (tone && !ANNOUNCEMENT_TONES.includes(tone)) {
    return res.status(400).json({ message: `Tone must be one of: ${ANNOUNCEMENT_TONES.join(", ")}` });
  }

  const announcement = await Announcement.create({
    title,
    message,
    tone: tone || "info",
    active: active === undefined ? true : Boolean(active),
    createdBy: req.user!.id,
  });

  const populated = await announcement.populate("createdBy", AUTHOR_FIELDS);
  res.status(201).json({ announcement: populated });
}

export async function updateAnnouncement(req: Request, res: Response) {
  const { title, message, tone, active, pinned } = req.body;
  const update: Record<string, unknown> = { updatedBy: req.user!.id };

  if (title !== undefined) update.title = title;
  if (message !== undefined) update.message = message;
  if (active !== undefined) update.active = Boolean(active);
  if (pinned !== undefined) update.pinned = Boolean(pinned);
  if (tone !== undefined) {
    if (!ANNOUNCEMENT_TONES.includes(tone)) {
      return res.status(400).json({ message: `Tone must be one of: ${ANNOUNCEMENT_TONES.join(", ")}` });
    }
    update.tone = tone;
  }

  const announcement = await Announcement.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate("createdBy", AUTHOR_FIELDS)
    .populate("updatedBy", AUTHOR_FIELDS);

  if (!announcement) return res.status(404).json({ message: "Announcement not found" });
  res.json({ announcement });
}

export async function deleteAnnouncement(req: Request, res: Response) {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) return res.status(404).json({ message: "Announcement not found" });
  res.json({ message: "Announcement deleted" });
}
