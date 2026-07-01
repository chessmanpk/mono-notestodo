import type { Request, Response } from "express";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import Project from "../models/Project.js";
import MonthlyReport from "../models/MonthlyReport.js";
import Announcement from "../models/Announcement.js";
import { getMonthInfo } from "../utils/dateUtils.js";

export async function getDashboard(req: Request, res: Response) {
  const userId = req.user!.id;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const current = getMonthInfo();

  const canManageAnnouncements = req.user!.role === "admin" || req.user!.role === "manager";

  const [todayTasks, overdueTasks, monthTasks, recentNotes, projects, latestReport, announcements] = await Promise.all([
    Task.find({ userId, archived: false, dueDate: { $gte: todayStart, $lt: todayEnd }, status: { $ne: "completed" } })
      .sort({ dueDate: 1 })
      .limit(6)
      .lean(),
    Task.find({ userId, archived: false, dueDate: { $lt: todayStart }, status: { $nin: ["completed", "archived"] } })
      .sort({ dueDate: 1 })
      .limit(6)
      .lean(),
    Task.find({ userId, cycleMonth: current.month, cycleYear: current.year, archived: false }).lean(),
    Note.find({ userId, archived: false }).sort({ pinned: -1, updatedAt: -1 }).limit(5).lean(),
    Project.find({ userId, archived: false }).sort({ updatedAt: -1 }).limit(5).lean(),
    MonthlyReport.findOne({ userId }).sort({ year: -1, month: -1 }).lean(),
    Announcement.find(canManageAnnouncements ? {} : { active: true })
      .sort({ active: -1, createdAt: -1 })
      .limit(8)
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .lean(),
  ]);

  const completed = monthTasks.filter((task) => task.status === "completed").length;
  const total = monthTasks.length;
  const monthlyProgress = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.json({
    todayTasks,
    overdueTasks,
    recentNotes,
    projects,
    announcements,
    latestReport,
    stats: {
      month: current.month,
      year: current.year,
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: total - completed,
      monthlyProgress,
      projectAverage:
        projects.length === 0
          ? 0
          : Math.round(projects.reduce((sum, project) => sum + Number(project.progress ?? 0), 0) / projects.length),
    },
  });
}
