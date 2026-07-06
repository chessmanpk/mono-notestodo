import type { Project } from "../../types";
import { Button } from "../ui/Button";

export function ProjectCard({ project, onEdit, onDelete, onPreview }: { project: Project; onEdit: () => void; onDelete: () => void; onPreview: () => void }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--muted)]/50">
      <div className="flex items-start justify-between gap-4">
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
            <h3 className="font-medium tracking-tight">{project.title}</h3>
            <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{project.status}</span>
          </div>
          {project.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{project.description}</p>}
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs text-[var(--muted)]"><span>Progress</span><span>{project.progress}%</span></div>
            <div className="h-2 rounded-full bg-[var(--surface-soft)]"><div className="h-2 rounded-full bg-[var(--text)] transition-all" style={{ width: `${project.progress}%` }} /></div>
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted)]">Tap to preview</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
