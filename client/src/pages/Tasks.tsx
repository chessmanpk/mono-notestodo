import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { Modal } from "../components/shared/Modal";
import { SearchBar } from "../components/shared/SearchBar";
import { TaskCard } from "../components/tasks/TaskCard";
import { TaskForm } from "../components/tasks/TaskForm";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { getErrorMessage } from "../services/api";
import { taskService } from "../services/task.service";
import type { Task } from "../types";
import { cn } from "../utils/cn";

const views = [
  { label: "Inbox", value: "inbox" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "Overdue", value: "overdue" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState("inbox");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  async function load() {
    try {
      setLoading(true);
      const result = await taskService.list({ view, search, sort });
      setTasks(result);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [view, search, sort]);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  async function save(data: any) {
    try {
      if (editing) await taskService.update(editing._id, data);
      else await taskService.create(data);
      toast.success(editing ? "Task updated" : "Task created");
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function remove(task: Task) {
    if (!confirm("Delete this task?")) return;
    await taskService.remove(task._id);
    toast.success("Task deleted");
    load();
  }

  async function toggle(task: Task) {
    await taskService.update(task._id, { status: task.status === "completed" ? "inbox" : "completed" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Inbox, today, recurring work, and clean monthly carry-forward.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> New task</Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {views.map((item) => <button key={item.value} onClick={() => setView(item.value)} className={cn("rounded-xl border px-3 py-2 text-sm transition", view === item.value ? "border-[var(--text)] bg-[var(--text)] text-[var(--background)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]")}>{item.label}</button>)}
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_180px] lg:max-w-xl lg:ml-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." />
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="due">Due date</option>
            <option value="priority">Priority</option>
          </Select>
        </div>
      </div>

      {loading ? <LoadingSkeleton rows={4} /> : tasks.length === 0 ? <EmptyState title="No tasks here" description="Keep the month light. Add a task only when it deserves attention." action={<Button onClick={openNew}>Create task</Button>} /> : <div className="space-y-3">{tasks.map((task) => <TaskCard key={task._id} task={task} onEdit={() => { setEditing(task); setModalOpen(true); }} onDelete={() => remove(task)} onToggle={() => toggle(task)} />)}</div>}

      <Modal open={modalOpen} title={editing ? "Edit task" : "New task"} onClose={() => setModalOpen(false)}>
        <TaskForm task={editing} onSubmit={save} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
