import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import type { PrayerName } from "../types";

const METHODS: Record<string, () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>> = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  Egyptian: CalculationMethod.Egyptian,
  Karachi: CalculationMethod.Karachi,
  UmmAlQura: CalculationMethod.UmmAlQura,
  Dubai: CalculationMethod.Dubai,
  MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  NorthAmerica: CalculationMethod.NorthAmerica,
  Kuwait: CalculationMethod.Kuwait,
  Qatar: CalculationMethod.Qatar,
  Singapore: CalculationMethod.Singapore,
  Tehran: CalculationMethod.Tehran,
  Turkey: CalculationMethod.Turkey,
};

export const CALCULATION_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: "MuslimWorldLeague", label: "Muslim World League" },
  { value: "Egyptian", label: "Egyptian General Authority" },
  { value: "Karachi", label: "University of Islamic Sciences, Karachi" },
  { value: "UmmAlQura", label: "Umm al-Qura, Makkah" },
  { value: "Dubai", label: "Dubai" },
  { value: "MoonsightingCommittee", label: "Moonsighting Committee" },
  { value: "NorthAmerica", label: "ISNA (North America)" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Qatar", label: "Qatar" },
  { value: "Singapore", label: "Singapore" },
  { value: "Tehran", label: "Tehran" },
  { value: "Turkey", label: "Turkey (Diyanet)" },
];

export type TodayPrayerTimes = Record<PrayerName, Date>;

export function getTodayPrayerTimes(opts: {
  lat: number;
  lng: number;
  calculationMethod: string;
  madhab: "shafi" | "hanafi";
  date?: Date;
}): TodayPrayerTimes {
  const coordinates = new Coordinates(opts.lat, opts.lng);
  const buildParams = METHODS[opts.calculationMethod] ?? CalculationMethod.MuslimWorldLeague;
  const params = buildParams();
  params.madhab = opts.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  const times = new PrayerTimes(coordinates, opts.date ?? new Date(), params);

  return {
    fajr: times.fajr,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export function getNextPrayer(times: TodayPrayerTimes, now = new Date()): { name: PrayerName | null; at: Date | null } {
  for (const name of PRAYER_ORDER) {
    if (times[name] > now) return { name, at: times[name] };
  }
  return { name: null, at: null };
}

export function formatPrayerTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function todayDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
