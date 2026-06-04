import type { Request, Response } from "express";
import MonthlyReport from "../models/MonthlyReport.js";
import { createOrUpdateManualReport, reportToMarkdown, reportToPdfBuffer } from "../services/report.service.js";
import { getMonthInfo } from "../utils/dateUtils.js";

export async function getReports(req: Request, res: Response) {
  const reports = await MonthlyReport.find({ userId: req.user!.id }).sort({ year: -1, month: -1 }).lean();
  res.json({ reports });
}

export async function getReport(req: Request, res: Response) {
  const report = await MonthlyReport.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json({ report });
}

export async function generateCurrentReport(req: Request, res: Response) {
  const current = getMonthInfo();
  const report = await createOrUpdateManualReport(req.user!.id, current.month, current.year);
  res.status(201).json({ report });
}

export async function exportReportJson(req: Request, res: Response) {
  const report = await MonthlyReport.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.setHeader("Content-Disposition", `attachment; filename=mono-report-${report.month}-${report.year}.json`);
  res.json(report);
}

export async function exportReportMarkdown(req: Request, res: Response) {
  const report = await MonthlyReport.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.setHeader("Content-Type", "text/markdown");
  res.setHeader("Content-Disposition", `attachment; filename=mono-report-${report.month}-${report.year}.md`);
  res.send(reportToMarkdown(report));
}

export async function exportReportPdf(req: Request, res: Response) {
  const report = await MonthlyReport.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
  if (!report) return res.status(404).json({ message: "Report not found" });

  const buffer = await reportToPdfBuffer(report);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=mono-report-${report.month}-${report.year}.pdf`);
  res.send(buffer);
}
