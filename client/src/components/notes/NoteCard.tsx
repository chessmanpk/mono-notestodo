import { Pin, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Note } from "../../types";
import { Button } from "../ui/Button";

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onPin,
  onPreview,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="max-w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--muted)]/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
          <div className="flex min-w-0 items-center gap-2">
            {note.pinned && <Pin className="h-4 w-4 shrink-0 text-[var(--muted)]" />}
            <h3 className="min-w-0 truncate font-medium tracking-tight">{note.title}</h3>
          </div>
          <div className="prose-mono mt-2 line-clamp-4 max-w-full overflow-hidden text-sm [overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-x-auto">
            <ReactMarkdown>{note.content || "Empty note"}</ReactMarkdown>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            {note.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{tag}</span>)}
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted)]">Tap to preview</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:flex-col">
          <Button className="w-full" variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
          <Button className="w-full" variant="ghost" size="sm" onClick={onPin}>{note.pinned ? "Unpin" : "Pin"}</Button>
          <Button className="w-full" variant="ghost" size="sm" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
