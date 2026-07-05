import type { Request, Response } from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { syncProjectProgress } from "../services/projectProgress.service.js";
import { getMonthInfo } from "../utils/dateUtils.js";
import { normalizeTags } from "../utils/tags.js";

function parseSort(sort?: string): Record<string, 1 | -1> {
  if (sort === "due") return { dueDate: 1, createdAt: -1 };
  if (sort === "priority") return { priority: -1, createdAt: -1 };
  if (sort === "oldest") return { createdAt: 1 };
  return { createdAt: -1 };
}

export async function getTasks(req: Request, res: Response) {
  const userId = req.user!.id;
  const { view = "inbox", search = "", tag = "", sort = "newest" } = req.query;
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const endWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

  const query: any = { userId };

  if (view === "archived") {
    query.$or = [{ archived: true }, { status: "archived" }];
  } else if (view === "completed") {
    query.status = "completed";
    query.archived = false;
  } else {
    query.archived = false;
    if (view === "today") query.dueDate = { $gte: startToday, $lt: endToday };
    if (view === "week") query.dueDate = { $gte: startToday, $lt: endWeek };
    if (view === "overdue") query.dueDate = { $lt: startToday };
    if (view === "inbox") query.status = { $in: ["inbox", "active"] };
  }

  if (search) query.title = { $regex: String(search), $options: "i" };
  if (tag) query.tags = String(tag).toLowerCase();

  const tasks = await Task.find(query).sort(parseSort(String(sort))).lean();
  res.json({ tasks });
}

export async function createTask(req: Request, res: Response) {
  const { title, description, dueDate, priority, status, recurring, recurringType, tags, projectId } = req.body;
  if (!title) return res.status(400).json({ message: "Task title is required" });

  let resolvedProjectId: string | null = null;
  if (projectId) {
    const project = await Project.findOne({ _id: projectId, userId: req.user!.id });
    if (!project) return res.status(400).json({ message: "Invalid project" });
    resolvedProjectId = String(project._id);
  }

  const month = getMonthInfo();
  const task = await Task.create({
    userId: req.user!.id,
    title,
    description: description ?? "",
    dueDate: dueDate ? new Date(dueDate) : null,
    priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
    status: ["inbox", "active", "completed"].includes(status) ? status : "inbox",
    recurring: Boolean(recurring),
    recurringType: recurring ? recurringType || "monthly" : "none",
    tags: normalizeTags(tags),
    projectId: resolvedProjectId,
    cycleMonth: month.month,
    cycleYear: month.year,
    completedAt: status === "completed" ? new Date() : null,
  });

  if (resolvedProjectId) await syncProjectProgress(resolvedProjectId, req.user!.id);

  res.status(201).json({ task });
}

export async function updateTask(req: Request, res: Response) {
  const userId = req.user!.id;
  const existing = await Task.findOne({ _id: req.params.id, userId });
  if (!existing) return res.status(404).json({ message: "Task not found" });

  const update: any = { ...req.body };
  if (update.tags) update.tags = normalizeTags(update.tags);
  if (update.dueDate === "") update.dueDate = null;
  if (update.dueDate) update.dueDate = new Date(update.dueDate);
  if (update.status === "completed") update.completedAt = new Date();
  if (update.status && update.status !== "completed") update.completedAt = null;
  if (update.status === "archived") update.archived = true;
  if (update.recurring === false) update.recurringType = "none";

  if ("projectId" in update) {
    if (update.projectId) {
      const project = await Project.findOne({ _id: update.projectId, userId });
      if (!project) return res.status(400).json({ message: "Invalid project" });
      update.projectId = project._id;
    } else {
      update.projectId = null;
    }
  }

  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId }, update, { new: true });
  if (!task) return res.status(404).json({ message: "Task not found" });

  const oldProjectId = existing.projectId ? String(existing.projectId) : null;
  const newProjectId = task.projectId ? String(task.projectId) : null;

  if (oldProjectId && oldProjectId !== newProjectId) await syncProjectProgress(oldProjectId, userId);
  if (newProjectId) await syncProjectProgress(newProjectId, userId);

  res.json({ task });
}

export async function deleteTask(req: Request, res: Response) {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.projectId) await syncProjectProgress(String(task.projectId), req.user!.id);

  res.json({ message: "Task deleted" });
}
