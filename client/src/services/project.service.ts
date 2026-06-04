import { api } from "./api";
import type { Project } from "../types";

export type ProjectPayload = Pick<Project, "title" | "description" | "status" | "progress">;

export const projectService = {
  async list(params: Record<string, string> = {}) {
    const res = await api.get<{ projects: Project[] }>("/projects", { params });
    return res.data.projects;
  },

  async create(data: ProjectPayload) {
    const res = await api.post<{ project: Project }>("/projects", data);
    return res.data.project;
  },

  async update(id: string, data: Partial<ProjectPayload & { archived: boolean }>) {
    const res = await api.patch<{ project: Project }>(`/projects/${id}`, data);
    return res.data.project;
  },

  async remove(id: string) {
    await api.delete(`/projects/${id}`);
  },
};
