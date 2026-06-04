import { Download, FileText, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../services/api";
import { reportService } from "../services/report.service";
import type { MonthlyReport } from "../types";

export default function Reports() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setReports(await reportService.list());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function generate() {
    try {
      await reportService.generateCurrent();
      toast.success("Current month report generated");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function download(report: MonthlyReport, type: "json" | "markdown" | "pdf") {
    if (type === "json") await reportService.exportJson(report);
    if (type === "markdown") await reportService.exportMarkdown(report);
    if (type === "pdf") await reportService.exportPdf(report);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Monthly summaries are preserved even after the workspace resets.</p>
        </div>
        <Button onClick={generate}><Plus className="h-4 w-4" /> Generate current report</Button>
      </div>

      {loading ? <LoadingSkeleton rows={3} /> : reports.length === 0 ? <EmptyState title="No reports yet" description="Reports are created automatically during monthly reset. You can also generate the current month manually." action={<Button onClick={generate}>Generate report</Button>} /> : <div className="grid gap-3 lg:grid-cols-2">{reports.map((report) => <div key={report._id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold tracking-tight">{report.month}/{report.year}</p><p className="mt-1 text-xs text-[var(--muted)]">{report.type} report</p></div><FileText className="h-5 w-5 text-[var(--muted)]" /></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-[var(--surface-soft)] p-3"><p className="text-[var(--muted)]">Completed</p><p className="mt-1 text-xl font-semibold">{report.completedTasks}</p></div><div className="rounded-2xl bg-[var(--surface-soft)] p-3"><p className="text-[var(--muted)]">Pending</p><p className="mt-1 text-xl font-semibold">{report.pendingTasks}</p></div><div className="rounded-2xl bg-[var(--surface-soft)] p-3"><p className="text-[var(--muted)]">Notes</p><p className="mt-1 text-xl font-semibold">{report.notesCreated}</p></div><div className="rounded-2xl bg-[var(--surface-soft)] p-3"><p className="text-[var(--muted)]">Score</p><p className="mt-1 text-xl font-semibold">{report.productivityScore}%</p></div></div><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => download(report, "json")}><Download className="h-4 w-4" /> JSON</Button><Button variant="secondary" size="sm" onClick={() => download(report, "markdown")}><Download className="h-4 w-4" /> Markdown</Button><Button variant="secondary" size="sm" onClick={() => download(report, "pdf")}><Download className="h-4 w-4" /> PDF</Button></div></div>)}</div>}
    </div>
  );
}
