import {
  CalendarDays,
  CheckCircle2,
  Circle,
  FileText,
  FolderKanban,
  ListTodo,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";
import { MonthlyResetCountdown } from "../components/dashboard/MonthlyResetCountdown";
import { PrayerWidget } from "../components/prayers/PrayerWidget";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { QuickAdd } from "../components/shared/QuickAdd";
import { StatsCard } from "../components/shared/StatsCard";
import { getErrorMessage } from "../services/api";
import {
  dashboardService,
  type DashboardData,
} from "../services/dashboard.service";
import { taskService } from "../services/task.service";

type DashboardTask = DashboardData["todayTasks"][number];
type DashboardNote = DashboardData["recentNotes"][number];

type SelectedPreview =
  | {
      type: "task";
      title: string;
      item: DashboardTask;
      section: "Today" | "Overdue";
    }
  | {
      type: "note";
      title: string;
      item: DashboardNote;
      section: "Recent note";
    };

function readStringField(item: object, key: string) {
  const value = (item as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function formatDate(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardTaskRow({
  task,
  section,
  onSelect,
  onToggle,
}: {
  task: DashboardTask;
  section: "Today" | "Overdue";
  onSelect: () => void;
  onToggle: () => void;
}) {
  const description = readStringField(task, "description");
  const dueDate = readStringField(task, "dueDate");
  const priority = readStringField(task, "priority");
  const isCompleted = task.status === "completed";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="group w-full max-w-full cursor-pointer overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:-translate-y-0.5 hover:bg-[var(--surface-soft)]"
    >
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          className="mt-0.5 shrink-0 rounded-full text-[var(--muted)] transition hover:text-[var(--text)]"
          aria-label={
            isCompleted ? "Mark task as pending" : "Mark task as completed"
          }
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 break-words text-sm font-medium">
              {task.title}
            </p>

            <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              {section}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[var(--muted)]">
            {description || "No description added."}
          </p>

          <div className="mt-3 flex min-w-0 flex-wrap gap-2 text-[11px] text-[var(--muted)]">
            {priority && (
              <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1">
                {priority}
              </span>
            )}

            {dueDate && (
              <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1">
                Due {formatDate(dueDate)}
              </span>
            )}

            <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1">
              Tap to preview
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function DashboardPreviewCard({
  selected,
  onClose,
  previewRef,
}: {
  selected: SelectedPreview | null;
  onClose: () => void;
  previewRef: RefObject<HTMLDivElement | null>;
}) {
  if (!selected) return null;

  const isTask = selected.type === "task";

  const body = isTask
    ? readStringField(selected.item, "description") || "No description added."
    : readStringField(selected.item, "content") || "Empty note.";

  const dueDate = isTask ? readStringField(selected.item, "dueDate") : "";
  const priority = isTask ? readStringField(selected.item, "priority") : "";
  const status = isTask ? selected.item.status : "";

  return (
    <section
      ref={previewRef}
      className="w-full max-w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--text)] px-3 py-1 text-xs font-medium text-[var(--background)]">
              {selected.section}
            </span>

            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
              {isTask ? "Task preview" : "Note preview"}
            </span>
          </div>

          <h2 className="mt-4 max-w-full break-words text-2xl font-semibold tracking-tight">
            {selected.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full border border-[var(--border)] p-2 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 max-w-full overflow-hidden rounded-2xl bg-[var(--surface-soft)] p-4">
        <p className="max-w-full whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">
          {body}
        </p>
      </div>

      {isTask && (
        <div className="mt-4 flex min-w-0 flex-wrap gap-2 text-xs text-[var(--muted)]">
          {status && (
            <span className="rounded-full border border-[var(--border)] px-3 py-1">
              Status: {status}
            </span>
          )}

          {priority && (
            <span className="rounded-full border border-[var(--border)] px-3 py-1">
              Priority: {priority}
            </span>
          )}

          {dueDate && (
            <span className="rounded-full border border-[var(--border)] px-3 py-1">
              Due: {formatDate(dueDate)}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] =
    useState<SelectedPreview | null>(null);

  const previewRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    load();
  }, []);

  function openPreview(preview: SelectedPreview) {
    setSelectedPreview(preview);

    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  async function toggleTask(task: DashboardTask) {
    try {
      const nextStatus = task.status === "completed" ? "inbox" : "completed";

      await taskService.update(task._id, {
        status: nextStatus,
      });

      toast.success(
        nextStatus === "completed"
          ? "Task completed"
          : "Task moved back to pending"
      );

      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />;

  if (!data) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description="Could not load your workspace right now."
      />
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <p className="text-sm text-[var(--muted)]">
            Month {data.stats.month}, {data.stats.year}
          </p>

          <h1 className="mt-1 break-words text-3xl font-semibold tracking-tight">
            Fresh workspace
          </h1>

          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-[var(--muted)]">
            Focus on today. Mono will archive the noise when the month ends.
          </p>
        </div>

        <div className="w-full max-w-lg">
          <QuickAdd onCreated={load} />
        </div>
      </div>

      <MonthlyResetCountdown monthlyProgress={data.stats.monthlyProgress} />

      <div className="grid w-full max-w-full gap-3 overflow-hidden sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Monthly progress"
          value={`${data.stats.monthlyProgress}%`}
          icon={<CalendarDays className="h-4 w-4" />}
        />

        <StatsCard
          label="Completed"
          value={data.stats.completedTasks}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />

        <StatsCard
          label="Pending"
          value={data.stats.pendingTasks}
          icon={<ListTodo className="h-4 w-4" />}
        />

        <StatsCard
          label="Project average"
          value={`${data.stats.projectAverage}%`}
          icon={<FolderKanban className="h-4 w-4" />}
        />
      </div>

      <DashboardPreviewCard
        selected={selectedPreview}
        onClose={() => setSelectedPreview(null)}
        previewRef={previewRef}
      />

      <PrayerWidget />

      <div className="grid w-full max-w-full gap-6 overflow-hidden xl:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Today</h2>

          {data.todayTasks.length === 0 ? (
            <EmptyState
              title="No tasks for today"
              description="A calm day. Add only what matters."
            />
          ) : (
            data.todayTasks.map((task) => (
              <DashboardTaskRow
                key={task._id}
                task={task}
                section="Today"
                onSelect={() =>
                  openPreview({
                    type: "task",
                    title: task.title,
                    item: task,
                    section: "Today",
                  })
                }
                onToggle={() => toggleTask(task)}
              />
            ))
          )}
        </section>

        <section className="min-w-0 space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Overdue</h2>

          {data.overdueTasks.length === 0 ? (
            <EmptyState
              title="Nothing overdue"
              description="Your workspace is clear from yesterday's pressure."
            />
          ) : (
            data.overdueTasks.map((task) => (
              <DashboardTaskRow
                key={task._id}
                task={task}
                section="Overdue"
                onSelect={() =>
                  openPreview({
                    type: "task",
                    title: task.title,
                    item: task,
                    section: "Overdue",
                  })
                }
                onToggle={() => toggleTask(task)}
              />
            ))
          )}
        </section>
      </div>

      <div className="grid w-full max-w-full gap-6 overflow-hidden xl:grid-cols-2">
        <section className="min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <h2 className="min-w-0 break-words text-lg font-semibold tracking-tight">
              Recent notes
            </h2>
            <FileText className="h-4 w-4 shrink-0 text-[var(--muted)]" />
          </div>

          <div className="mt-4 space-y-3">
            {data.recentNotes.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No notes yet.</p>
            ) : (
              data.recentNotes.map((note) => (
                <button
                  key={note._id}
                  type="button"
                  onClick={() =>
                    openPreview({
                      type: "note",
                      title: note.title,
                      item: note,
                      section: "Recent note",
                    })
                  }
                  className="w-full max-w-full overflow-hidden rounded-2xl border border-[var(--border)] p-3 text-left transition hover:-translate-y-0.5 hover:bg-[var(--surface-soft)]"
                >
                  <p className="break-words text-sm font-medium">
                    {note.title}
                  </p>

                  <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[var(--muted)]">
                    {readStringField(note, "content") || "Empty note"}
                  </p>

                  <p className="mt-2 text-[11px] text-[var(--muted)]">
                    Tap to preview
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="break-words text-lg font-semibold tracking-tight">
            Project progress
          </h2>

          <div className="mt-4 space-y-4">
            {data.projects.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No active projects.</p>
            ) : (
              data.projects.map((project) => (
                <div key={project._id} className="min-w-0">
                  <div className="mb-2 flex min-w-0 justify-between gap-3 text-sm">
                    <span className="min-w-0 break-words">
                      {project.title}
                    </span>
                    <span className="shrink-0 text-[var(--muted)]">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[var(--surface-soft)]">
                    <div
                      className="h-2 rounded-full bg-[var(--text)]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}