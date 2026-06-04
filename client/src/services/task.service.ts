import { api } from "./api";
import type { Task } from "../types";

export type TaskPayload = Partial<Omit<Task, "_id" | "userId" | "createdAt" | "updatedAt" | "cycleMonth" | "cycleYear">> & {
  title: string;
};

export const taskService = {
  async list(params: Record<string, string> = {}) {
    const res = await api.get<{ tasks: Task[] }>("/tasks", { params });
    return res.data.tasks;
  },

  async create(data: TaskPayload) {
    const res = await api.post<{ task: Task }>("/tasks", data);
    return res.data.task;
  },

  async update(id: string, data: Partial<TaskPayload>) {
    const res = await api.patch<{ task: Task }>(`/tasks/${id}`, data);
    return res.data.task;
  },

  async remove(id: string) {
    await api.delete(`/tasks/${id}`);
  },
};
