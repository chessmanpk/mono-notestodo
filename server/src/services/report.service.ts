import PDFDocument from "pdfkit";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import Project from "../models/Project.js";
import MonthlyReport from "../models/MonthlyReport.js";
import { getMostUsedTags } from "../utils/tags.js";

export async function buildReport(userId: string, month: number, year: number, type: "automatic" | "manual") {
  const [tasks, notes, projects] = await Promise.all([
    Task.find({ userId, cycleMonth: month, cycleYear: year }).lean(),
    Note.find({ userId, cycleMonth: month, cycleYear: year }).lean(),
    Project.find({ userId, cycleMonth: month, cycleYear: year }).lean(),
  ]);

  const completedTasks = tasks.filter((task) => task.status === "completed" || task.completedAt).length;
  const pendingTasks = tasks.filter((task) => !["completed", "archived"].includes(task.status)).length;
  const projectsCompleted = projects.filter((project) => project.status === "completed" || project.progress >= 100).length;
  const recurringTasks = tasks.filter((task) => task.recurring).length;
  const totalTasks = Math.max(tasks.length, 1);
  const productivityScore = Math.round((completedTasks / totalTasks) * 100);

  return {
    userId,
    month,
    year,
    type,
    completedTasks,
    pendingTasks,
    notesCreated: notes.length,
    projectsCompleted,
    productivityScore,
    summaryJson: {
      mostUsedTags: getMostUsedTags([...tasks, ...notes]),
      taskTotal: tasks.length,
      noteTotal: notes.length,
      projectTotal: projects.length,
      recurringTaskStats: {
        recurringTasks,
        nonRecurringTasks: tasks.length - recurringTasks,
      },
      projectCompletionAverage:
        projects.length === 0
          ? 0
          : Math.round(projects.reduce((sum, project) => sum + Number(project.progress ?? 0), 0) / projects.length),
    },
  };
}

export async function createOrUpdateManualReport(userId: string, month: number, year: number) {
  const data = await buildReport(userId, month, year, "manual");
  return MonthlyReport.findOneAndUpdate({ userId, month, year, type: "manual" }, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
}

export function reportToMarkdown(report: any) {
  const tags = report.summaryJson?.mostUsedTags ?? [];
  return `# Mono Monthly Report — ${report.month}/${report.year}

## Summary

- Completed tasks: ${report.completedTasks}
- Pending tasks: ${report.pendingTasks}
- Notes created: ${report.notesCreated}
- Projects completed: ${report.projectsCompleted}
- Productivity score: ${report.productivityScore}%

## Most Used Tags

${tags.length ? tags.map((item: any) => `- ${item.tag}: ${item.count}`).join("\n") : "No tags used this month."}

## Raw Summary

\`\`\`json
${JSON.stringify(report.summaryJson, null, 2)}
\`\`\`
`;
}

export async function reportToPdfBuffer(report: any) {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  doc.fontSize(22).text("Mono Monthly Report", { align: "left" });
  doc.moveDown();
  doc.fontSize(12).fillColor("#555").text(`${report.month}/${report.year}`);
  doc.moveDown();
  doc.fillColor("#111").fontSize(14).text("Summary");
  doc.moveDown(0.5);
  doc.fontSize(11).text(`Completed tasks: ${report.completedTasks}`);
  doc.text(`Pending tasks: ${report.pendingTasks}`);
  doc.text(`Notes created: ${report.notesCreated}`);
  doc.text(`Projects completed: ${report.projectsCompleted}`);
  doc.text(`Productivity score: ${report.productivityScore}%`);
  doc.moveDown();
  doc.fontSize(14).text("Most Used Tags");

  const tags = report.summaryJson?.mostUsedTags ?? [];
  if (tags.length === 0) doc.fontSize(11).text("No tags used this month.");
  for (const item of tags) doc.fontSize(11).text(`${item.tag}: ${item.count}`);

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
