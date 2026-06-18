import { api } from "./api";
import type { Theme, User, UserRole } from "../types";

export const authService = {
  async register(data: { fullName: string; email: string; password: string }) {
    const res = await api.post<{ user: User }>("/auth/register", data);
    return res.data.user;
  },

  async login(data: { email: string; password: string; rememberMe: boolean }) {
    const res = await api.post<{ user: User }>("/auth/login", data);
    return res.data.user;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async me() {
    const res = await api.get<{ user: User }>("/auth/me");
    return res.data.user;
  },

  async forgotPassword(email: string) {
    const res = await api.post<{ message: string; devResetToken?: string }>("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(token: string, password: string) {
    const res = await api.post<{ message: string }>("/auth/reset-password", { token, password });
    return res.data;
  },

  async updateProfile(data: {
    fullName?: string;
    theme?: Theme;
    notificationPreferences?: User["notificationPreferences"];
  }) {
    const res = await api.patch<{ user: User }>("/auth/profile", data);
    return res.data.user;
  },

  async listUsers() {
    const res = await api.get<{ users: User[] }>("/auth/users");
    return res.data.users;
  },

  async updateUserRole(userId: string, role: UserRole) {
    const res = await api.patch<{ user: User }>(`/auth/users/${userId}/role`, { role });
    return res.data.user;
  },

  async deleteAccount() {
    await api.delete("/auth/account");
  },
};
