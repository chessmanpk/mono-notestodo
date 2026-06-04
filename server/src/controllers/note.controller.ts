import type { Request, Response } from "express";
import Note from "../models/Note.js";
import { getMonthInfo } from "../utils/dateUtils.js";
import { normalizeTags } from "../utils/tags.js";

export async function getNotes(req: Request, res: Response) {
  const { search = "", tag = "", archived = "false" } = req.query;
  const query: any = { userId: req.user!.id, archived: archived === "true" };

  if (search) {
    query.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { content: { $regex: String(search), $options: "i" } },
    ];
  }
  if (tag) query.tags = String(tag).toLowerCase();

  const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 }).lean();
  res.json({ notes });
}

export async function createNote(req: Request, res: Response) {
  const { title, content, tags, pinned } = req.body;
  if (!title) return res.status(400).json({ message: "Note title is required" });

  const month = getMonthInfo();
  const note = await Note.create({
    userId: req.user!.id,
    title,
    content: content ?? "",
    tags: normalizeTags(tags),
    pinned: Boolean(pinned),
    cycleMonth: month.month,
    cycleYear: month.year,
  });

  res.status(201).json({ note });
}

export async function updateNote(req: Request, res: Response) {
  const update: any = { ...req.body };
  if (update.tags) update.tags = normalizeTags(update.tags);

  const note = await Note.findOneAndUpdate({ _id: req.params.id, userId: req.user!.id }, update, {
    new: true,
  });

  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json({ note });
}

export async function deleteNote(req: Request, res: Response) {
  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Note deleted" });
}
