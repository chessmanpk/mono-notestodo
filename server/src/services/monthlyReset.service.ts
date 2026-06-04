import User from "../models/User.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import Project from "../models/Project.js";
import MonthlyReport from "../models/MonthlyReport.js";
import ArchivedMonth from "../models/ArchivedMonth.js";
import { getMonthInfo, getNextDueDate, getPreviousMonthInfo } from "../utils/dateUtils.js";
import { buildReport } from "./report.service.js";

export async function runMonthlyReset(runDate = new Date()) {
  const previous = getPreviousMonthInfo(runDate);
  const current = getMonthInfo(runDate);
  const users = await User.find().select("_id email lastMonthlyResetKey");
  const results: Array<{ userId: string; status: string }> = [];

  for (const user of users) {
    const userId = String(user._id);
    const resetKey = `${previous.year}-${String(previous.month).padStart(2, "0")}`;

    const existingReport = await MonthlyReport.findOne({
      userId,
      month: previous.month,
      year: previous.year,
      type: "automatic",
    });

    if (existingReport || user.lastMonthlyResetKey === resetKey) {
      results.push({ userId, status: "skipped_already_reset" });
      continue;
    }

    const [tasks, notes, projects] = await Promise.all([
      Task.find({ userId, cycleMonth: previous.month, cycleYear: previous.year }).lean(),
      Note.find({ userId, cycleMonth: previous.month, cycleYear: previous.year }).lean(),
      Project.find({ userId, cycleMonth: previous.month, cycleYear: previous.year }).lean(),
    ]);

    const reportData = await buildReport(userId, previous.month, previous.year, "automatic");

    await MonthlyReport.create(reportData);

    await ArchivedMonth.create({
      userId,
      month: previous.month,
      year: previous.year,
      archiveDataJson: {
        tasks,
        notes,
        projects,
        archivedAt: new Date(),
      },
    });

    await Task.updateMany(
      { userId, cycleMonth: previous.month, cycleYear: previous.year, status: "completed" },
      { $set: { status: "archived", archived: true } }
    );

    await Note.updateMany(
      { userId, cycleMonth: previous.month, cycleYear: previous.year, pinned: false },
      { $set: { archived: true } }
    );

    await Project.updateMany(
      { userId, cycleMonth: previous.month, cycleYear: previous.year, status: { $in: ["completed", "archived"] } },
      { $set: { archived: true, status: "archived" } }
    );

    await Task.updateMany(
      {
        userId,
        cycleMonth: previous.month,
        cycleYear: previous.year,
        status: { $in: ["inbox", "active"] },
      },
      { $set: { cycleMonth: current.month, cycleYear: current.year, status: "inbox", archived: false } }
    );

    await Project.updateMany(
      {
        userId,
        cycleMonth: previous.month,
        cycleYear: previous.year,
        status: { $in: ["planning", "active", "paused"] },
      },
      { $set: { cycleMonth: current.month, cycleYear: current.year, archived: false } }
    );

    const recurringTasks = tasks.filter((task: any) => task.recurring);
    for (const task of recurringTasks as any[]) {
      await Task.create({
        userId,
        title: task.title,
        description: task.description,
        dueDate: getNextDueDate(task.dueDate, task.recurringType),
        priority: task.priority,
        status: "inbox",
        recurring: true,
        recurringType: task.recurringType,
        tags: task.tags,
        cycleMonth: current.month,
        cycleYear: current.year,
        sourceRecurringTaskId: task._id,
      });
    }

    user.lastMonthlyResetKey = resetKey;
    await user.save();
    results.push({ userId, status: "reset_completed" });
  }

  return {
    previousMonth: previous,
    currentMonth: current,
    usersProcessed: results.length,
    results,
  };
}
