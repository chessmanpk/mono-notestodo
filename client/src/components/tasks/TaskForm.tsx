import { FormEvent, useMemo, useState } from "react";
import type { Project, Task } from "../../types";
import { toInputDate } from "../../utils/format";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { MarkdownEditor } from "../shared/MarkdownEditor";

export function TaskForm({
  task,
  projects,
  onSubmit,
  onCancel,
}: {
  task?: Task | null;
  projects: Project[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const initialTags = useMemo(() => task?.tags.join(", ") ?? "", [task]);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(toInputDate(task?.dueDate));
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [status, setStatus] = useState(task?.status ?? "inbox");
  const [recurring, setRecurring] = useState(task?.recurring ?? false);
  const [recurringType, setRecurringType] = useState(task?.recurringType ?? "monthly");
  const [tags, setTags] = useState(initialTags);
  const [projectId, setProjectId] = useState(task?.projectId ?? "");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        dueDate: dueDate || null,
        priority,
        status,
        recurring,
        recurringType: recurring ? recurringType : "none",
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        projectId: projectId || null,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
      <MarkdownEditor value={description} onChange={setDescription} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="inbox">Inbox</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          Recurring task
        </label>
        <Select disabled={!recurring} value={recurringType} onChange={(e) => setRecurringType(e.target.value as any)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>
      </div>
      <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags separated by comma: study, work" />
      <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
        <option value="">No project</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>{project.title}</option>
        ))}
      </Select>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={loading || !title.trim()}>{loading ? "Saving..." : "Save task"}</Button>
      </div>
    </form>
  );
}
