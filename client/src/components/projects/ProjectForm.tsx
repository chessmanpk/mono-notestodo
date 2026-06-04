import { FormEvent, useState } from "react";
import type { Project } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

export function ProjectForm({ project, onSubmit, onCancel }: { project?: Project | null; onSubmit: (data: any) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState(project?.status ?? "active");
  const [progress, setProgress] = useState(project?.progress ?? 0);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, status, progress });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" required />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </Select>
        <Input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={loading || !title.trim()}>{loading ? "Saving..." : "Save project"}</Button>
      </div>
    </form>
  );
}
