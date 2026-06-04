import { api } from "./api";
import type { Note } from "../types";

export type NotePayload = Pick<Note, "title" | "content" | "tags" | "pinned">;

export const noteService = {
  async list(params: Record<string, string> = {}) {
    const res = await api.get<{ notes: Note[] }>("/notes", { params });
    return res.data.notes;
  },

  async create(data: NotePayload) {
    const res = await api.post<{ note: Note }>("/notes", data);
    return res.data.note;
  },

  async update(id: string, data: Partial<NotePayload & { archived: boolean }>) {
    const res = await api.patch<{ note: Note }>(`/notes/${id}`, data);
    return res.data.note;
  },

  async remove(id: string) {
    await api.delete(`/notes/${id}`);
  },
};
