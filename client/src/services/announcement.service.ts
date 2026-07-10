import { api } from "./api";
import type { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from "../types";

export const announcementService = {
  async list() {
    const res = await api.get<{ announcements: Announcement[] }>("/announcements");
    return res.data.announcements;
  },

  async listAllAdmin() {
    const res = await api.get<{ announcements: Announcement[] }>("/announcements/admin");
    return res.data.announcements;
  },

  async create(data: CreateAnnouncementInput) {
    const res = await api.post<{ announcement: Announcement }>("/announcements", data);
    return res.data.announcement;
  },

  async update(id: string, data: UpdateAnnouncementInput) {
    const res = await api.patch<{ announcement: Announcement }>(`/announcements/${id}`, data);
    return res.data.announcement;
  },

  async remove(id: string) {
    await api.delete(`/announcements/${id}`);
  },
};
