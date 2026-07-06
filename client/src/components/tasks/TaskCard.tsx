import { Calendar, CheckCircle2, Circle, FolderKanban, Repeat2, Tag } from "lucide-react";
import type { Task } from "../../types";
import { cn } from "../../utils/cn";
import { isOverdue, niceDate } from "../../utils/format";
import { Button } from "../ui/Button";

export function TaskCard({
  task,
  projectTitle,
  onEdit,
  onDelete,
  onToggle,
  onPreview,
}: {
  task: Task;
  projectTitle?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onPreview: () => void;
}) {
  const completed = task.status === "completed";

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--muted)]/50">
      <div className="flex gap-3">
        <button onClick={onToggle} className="mt-0.5 text-[var(--muted)] hover:text-[var(--text)]" aria-label="Toggle task status">
          {completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>
        <div
          role="button"
          tabIndex={0}
          onClick={onPreview}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onPreview();
            }
          }}
          className="min-w-0 max-w-full flex-1 cursor-pointer"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("font-medium tracking-tight", completed && "text-[var(--muted)] line-through")}>{task.title}</h3>
            <span className={cn("rounded-full border px-2 py-0.5 text-xs", task.priority === "high" && "border-red-500/20 text-red-500", task.priority === "medium" && "border-[var(--border)] text-[var(--muted)]", task.priority === "low" && "border-[var(--border)] text-[var(--muted)]")}>{task.priority}</span>
          </div>
          {task.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{task.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
            <span className={cn("inline-flex items-center gap-1", isOverdue(task.dueDate) && task.status !== "completed" && "text-red-500")}><Calendar className="h-3.5 w-3.5" />{niceDate(task.dueDate)}</span>
            {task.recurring && <span className="inline-flex items-center gap-1"><Repeat2 className="h-3.5 w-3.5" />{task.recurringType}</span>}
            {projectTitle && <span className="inline-flex items-center gap-1"><FolderKanban className="h-3.5 w-3.5" />{projectTitle}</span>}
            {task.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{tag}</span>)}
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted)]">Tap to preview</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
