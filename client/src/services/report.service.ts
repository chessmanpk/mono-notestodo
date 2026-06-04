import { api, downloadFile } from "./api";
import type { MonthlyReport } from "../types";

export const reportService = {
  async list() {
    const res = await api.get<{ reports: MonthlyReport[] }>("/reports");
    return res.data.reports;
  },

  async generateCurrent() {
    const res = await api.post<{ report: MonthlyReport }>("/reports/generate-current");
    return res.data.report;
  },

  async exportJson(report: MonthlyReport) {
    await downloadFile(`/reports/${report._id}/export/json`, `mono-report-${report.month}-${report.year}.json`);
  },

  async exportMarkdown(report: MonthlyReport) {
    await downloadFile(`/reports/${report._id}/export/markdown`, `mono-report-${report.month}-${report.year}.md`);
  },

  async exportPdf(report: MonthlyReport) {
    await downloadFile(`/reports/${report._id}/export/pdf`, `mono-report-${report.month}-${report.year}.pdf`);
  },
};
