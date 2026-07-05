import { api } from "./api";
import type { PrayerLog, PrayerName, PrayerStatus } from "../types";

export const prayerService = {
  async getDay(date: string) {
    const res = await api.get<{ log: PrayerLog }>(`/prayers/${date}`);
    return res.data.log;
  },

  async getMonth(month: number, year: number) {
    const res = await api.get<{ logs: PrayerLog[] }>("/prayers", { params: { month, year } });
    return res.data.logs;
  },

  async setStatus(date: string, prayer: PrayerName, status: PrayerStatus) {
    const res = await api.patch<{ log: PrayerLog }>(`/prayers/${date}`, { prayer, status });
    return res.data.log;
  },
};
