import type { Request, Response } from "express";
import Project from "../models/Project.js";
import { getMonthInfo } from "../utils/dateUtils.js";

export async function getProjects(req: Request, res: Response) {
  const { search = "", archived = "false" } = req.query;
  const query: any = { userId: req.user!.id, archived: archived === "true" };

  if (search) query.title = { $regex: String(search), $options: "i" };

  const projects = await Project.find(query).sort({ updatedAt: -1 }).lean();
  res.json({ projects });
}

export async function createProject(req: Request, res: Response) {
  const { title, description, status, progress } = req.body;
  if (!title) return res.status(400).json({ message: "Project title is required" });

  const month = getMonthInfo();
  const project = await Project.create({
    userId: req.user!.id,
    title,
    description: description ?? "",
    status: ["planning", "active", "paused", "completed"].includes(status) ? status : "active",
    progress: Number.isFinite(Number(progress)) ? Number(progress) : 0,
    cycleMonth: month.month,
    cycleYear: month.year,
  });

  res.status(201).json({ project });
}

export async function updateProject(req: Request, res: Response) {
  const update: any = { ...req.body };
  if (update.progress !== undefined) update.progress = Math.max(0, Math.min(100, Number(update.progress)));
  if (update.status === "archived") update.archived = true;

  const project = await Project.findOneAndUpdate({ _id: req.params.id, userId: req.user!.id }, update, {
    new: true,
  });

  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ project });
}

export async function deleteProject(req: Request, res: Response) {
  const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ message: "Project deleted" });
}
