import { create } from "zustand";
import { authService } from "../services/auth.service";
import type { User } from "../types";

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  initAuth: () => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  async initAuth() {
    try {
      const user = await authService.me();
      set({ user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  async login(email, password, rememberMe) {
    const user = await authService.login({ email, password, rememberMe });
    set({ user });
  },
  async register(fullName, email, password) {
    const user = await authService.register({ fullName, email, password });
    set({ user });
  },
  async logout() {
    await authService.logout();
    set({ user: null });
  },
}));
