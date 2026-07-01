import type { Request, Response } from "express";
import Announcement, {
  ANNOUNCEMENT_TONES,
  type AnnouncementTone,
} from "../models/Announcement.js";

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeTone(value: unknown): AnnouncementTone {
  const requestedTone = cleanText(value, 30);
  return ANNOUNCEMENT_TONES.includes(requestedTone as AnnouncementTone)
    ? (requestedTone as AnnouncementTone)
    : "info";
}

function canManageAnnouncements(role: string | undefined) {
  return role === "admin" || role === "manager";
}

export async function getAnnouncements(req: Request, res: Response) {
  const managerView = canManageAnnouncements(req.user?.role);
  const query = managerView ? {} : { active: true };

  const announcements = await Announcement.find(query)
    .sort({ active: -1, createdAt: -1 })
    .populate("createdBy", "fullName email role")
    .populate("updatedBy", "fullName email role")
    .lean();

  res.json({ announcements });
}

export async function createAnnouncement(req: Request, res: Response) {
  const title = cleanText(req.body.title, 120);
  const message = cleanText(req.body.message, 900);
  const tone = normalizeTone(req.body.tone);

  if (!title) {
    return res.status(400).json({ message: "Announcement title is required" });
  }

  if (!message) {
    return res.status(400).json({ message: "Announcement message is required" });
  }

  if (message.length < 8) {
    return res.status(400).json({
      message: "Announcement message should be at least 8 characters",
    });
  }

  const announcement = await Announcement.create({
    title,
    message,
    tone,
    active: req.body.active === false ? false : true,
    createdBy: req.user!.id,
    updatedBy: req.user!.id,
  });

  const populated = await Announcement.findById(announcement._id)
    .populate("createdBy", "fullName email role")
    .populate("updatedBy", "fullName email role");

  res.status(201).json({ announcement: populated });
}

export async function updateAnnouncement(req: Request, res: Response) {
  const update: Record<string, unknown> = {
    updatedBy: req.user!.id,
  };

  if (typeof req.body.title !== "undefined") {
    const title = cleanText(req.body.title, 120);
    if (!title) {
      return res.status(400).json({ message: "Announcement title is required" });
    }
    update.title = title;
  }

  if (typeof req.body.message !== "undefined") {
    const message = cleanText(req.body.message, 900);
    if (!message) {
      return res.status(400).json({ message: "Announcement message is required" });
    }
    if (message.length < 8) {
      return res.status(400).json({
        message: "Announcement message should be at least 8 characters",
      });
    }
    update.message = message;
  }

  if (typeof req.body.tone !== "undefined") {
    update.tone = normalizeTone(req.body.tone);
  }

  if (typeof req.body.active !== "undefined") {
    update.active = Boolean(req.body.active);
  }

  const announcement = await Announcement.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  })
    .populate("createdBy", "fullName email role")
    .populate("updatedBy", "fullName email role");

  if (!announcement) {
    return res.status(404).json({ message: "Announcement not found" });
  }

  res.json({ announcement });
}

export async function deleteAnnouncement(req: Request, res: Response) {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);

  if (!announcement) {
    return res.status(404).json({ message: "Announcement not found" });
  }

  res.json({ message: "Announcement deleted" });
}
