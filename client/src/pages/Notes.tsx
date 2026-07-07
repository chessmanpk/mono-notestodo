import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { Modal } from "../components/shared/Modal";
import { PreviewModal } from "../components/shared/PreviewModal";
import { SearchBar } from "../components/shared/SearchBar";
import { NoteCard } from "../components/notes/NoteCard";
import { NoteForm } from "../components/notes/NoteForm";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../services/api";
import { noteService } from "../services/note.service";
import type { Note } from "../types";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  async function load() {
    try {
      setLoading(true);
      setNotes(await noteService.list({ search }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [search]);

  async function save(data: any) {
    try {
      if (editing) await noteService.update(editing._id, data);
      else await noteService.create(data);
      toast.success(editing ? "Note updated" : "Note created");
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function remove(note: Note) {
    if (!confirm("Delete this note?")) return;
    await noteService.remove(note._id);
    toast.success("Note deleted");
    load();
  }

  return (
    <div className="max-w-full space-y-6 overflow-hidden">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Minimal markdown notes, pinned thoughts, and monthly archives.</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus className="h-4 w-4" /> New note</Button>
      </div>
      <div className="max-w-xl"><SearchBar value={search} onChange={setSearch} placeholder="Search notes..." /></div>
      {loading ? <LoadingSkeleton rows={4} /> : notes.length === 0 ? <EmptyState title="No notes yet" description="Write short, clear notes. Mono keeps them calm and searchable." action={<Button onClick={() => setModalOpen(true)}>Create note</Button>} /> : <div className="grid max-w-full gap-3 overflow-hidden xl:grid-cols-2">{notes.map((note) => <NoteCard key={note._id} note={note} onEdit={() => { setEditing(note); setModalOpen(true); }} onDelete={() => remove(note)} onPin={async () => { await noteService.update(note._id, { pinned: !note.pinned }); load(); }} onPreview={() => setPreviewNote(note)} />)}</div>}
      <Modal open={modalOpen} title={editing ? "Edit note" : "New note"} onClose={() => setModalOpen(false)}>
        <NoteForm note={editing} onSubmit={save} onCancel={() => setModalOpen(false)} />
      </Modal>
      <PreviewModal
        open={!!previewNote}
        title={previewNote?.title ?? ""}
        eyebrow="Note preview"
        body={previewNote?.content ?? ""}
        meta={previewNote?.tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--border)] px-2 py-1">{tag}</span>)}
        onClose={() => setPreviewNote(null)}
      />
    </div>
  );
}
