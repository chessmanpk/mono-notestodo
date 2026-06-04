import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { taskService } from "../../services/task.service";
import { getErrorMessage } from "../../services/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function QuickAdd({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await taskService.create({ title: title.trim(), status: "inbox", priority: "medium" });
      setTitle("");
      toast.success("Task added");
      onCreated?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex w-full items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quick add a task..." className="border-0 bg-transparent focus:border-0" />
      <Button size="sm" disabled={loading || !title.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
