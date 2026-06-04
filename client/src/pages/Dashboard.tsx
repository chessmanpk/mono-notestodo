import { CalendarDays, CheckCircle2, FolderKanban, ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { QuickAdd } from "../components/shared/QuickAdd";
import { StatsCard } from "../components/shared/StatsCard";
import { TaskCard } from "../components/tasks/TaskCard";
import { getErrorMessage } from "../services/api";
import { dashboardService, type DashboardData } from "../services/dashboard.service";
import { taskService } from "../services/task.service";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const result = await dashboardService.get();
      setData(result);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (!data) return <EmptyState title="Dashboard unavailable" description="Could not load your workspace right now." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-[var(--muted)]">Month {data.stats.month}, {data.stats.year}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Fresh workspace</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Focus on today. Mono will archive the noise when the month ends.</p>
        </div>
        <div className="w-full max-w-lg"><QuickAdd onCreated={load} /></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Monthly progress" value={`${data.stats.monthlyProgress}%`} icon={<CalendarDays className="h-4 w-4" />} />
        <StatsCard label="Completed" value={data.stats.completedTasks} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatsCard label="Pending" value={data.stats.pendingTasks} icon={<ListTodo className="h-4 w-4" />} />
        <StatsCard label="Project average" value={`${data.stats.projectAverage}%`} icon={<FolderKanban className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Today</h2>
          {data.todayTasks.length === 0 ? <EmptyState title="No tasks for today" description="A calm day. Add only what matters." /> : data.todayTasks.map((task) => <TaskCard key={task._id} task={task} onEdit={() => {}} onDelete={async () => { await taskService.remove(task._id); load(); }} onToggle={async () => { await taskService.update(task._id, { status: task.status === "completed" ? "inbox" : "completed" }); load(); }} />)}
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Overdue</h2>
          {data.overdueTasks.length === 0 ? <EmptyState title="Nothing overdue" description="Your workspace is clear from yesterday's pressure." /> : data.overdueTasks.map((task) => <TaskCard key={task._id} task={task} onEdit={() => {}} onDelete={async () => { await taskService.remove(task._id); load(); }} onToggle={async () => { await taskService.update(task._id, { status: "completed" }); load(); }} />)}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-semibold tracking-tight">Recent notes</h2>
          <div className="mt-4 space-y-3">
            {data.recentNotes.length === 0 ? <p className="text-sm text-[var(--muted)]">No notes yet.</p> : data.recentNotes.map((note) => <div key={note._id} className="rounded-2xl border border-[var(--border)] p-3"><p className="text-sm font-medium">{note.title}</p><p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{note.content || "Empty note"}</p></div>)}
          </div>
        </section>
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-semibold tracking-tight">Project progress</h2>
          <div className="mt-4 space-y-4">
            {data.projects.length === 0 ? <p className="text-sm text-[var(--muted)]">No active projects.</p> : data.projects.map((project) => <div key={project._id}><div className="mb-2 flex justify-between text-sm"><span>{project.title}</span><span className="text-[var(--muted)]">{project.progress}%</span></div><div className="h-2 rounded-full bg-[var(--surface-soft)]"><div className="h-2 rounded-full bg-[var(--text)]" style={{ width: `${project.progress}%` }} /></div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
