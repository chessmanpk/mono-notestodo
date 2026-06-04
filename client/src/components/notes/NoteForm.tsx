import { FormEvent, useMemo, useState } from "react";
import type { Note } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { MarkdownEditor } from "./MarkdownEditor";

export function NoteForm({ note, onSubmit, onCancel }: { note?: Note | null; onSubmit: (data: any) => Promise<void>; onCancel: () => void }) {
  const initialTags = useMemo(() => note?.tags.join(", ") ?? "", [note]);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tags, setTags] = useState(initialTags);
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, content, pinned, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />
      <MarkdownEditor value={content} onChange={setContent} />
      <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags separated by comma" />
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
        Pin this note
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={loading || !title.trim()}>{loading ? "Saving..." : "Save note"}</Button>
      </div>
    </form>
  );
}
