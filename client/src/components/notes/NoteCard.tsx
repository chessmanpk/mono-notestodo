import { Pin, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Note } from "../../types";
import { Button } from "../ui/Button";

export function NoteCard({ note, onEdit, onDelete, onPin }: { note: Note; onEdit: () => void; onDelete: () => void; onPin: () => void }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--muted)]/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {note.pinned && <Pin className="h-4 w-4 text-[var(--muted)]" />}
            <h3 className="truncate font-medium tracking-tight">{note.title}</h3>
          </div>
          <div className="prose-mono mt-2 line-clamp-4 text-sm">
            <ReactMarkdown>{note.content || "Empty note"}</ReactMarkdown>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            {note.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{tag}</span>)}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={onPin}>{note.pinned ? "Unpin" : "Pin"}</Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
