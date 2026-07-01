import { api } from "./api";
import type { Announcement, MonthlyReport, Note, Project, Task } from "../types";

export type DashboardData = {
  todayTasks: Task[];
  overdueTasks: Task[];
  recentNotes: Note[];
  projects: Project[];
  announcements: Announcement[];
  latestReport: MonthlyReport | null;
  stats: {
    month: number;
    year: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    monthlyProgress: number;
    projectAverage: number;
  };
};

export const dashboardService = {
  async get() {
    const res = await api.get<DashboardData>("/dashboard");
    return res.data;
  },
};
