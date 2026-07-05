import { CheckCircle2, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { StatsCard } from "../components/shared/StatsCard";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../services/api";
import { prayerService } from "../services/prayer.service";
import { useAuthStore } from "../store/auth.store";
import type { PrayerLog, PrayerName, PrayerStatus } from "../types";
import { cn } from "../utils/cn";

const PRAYER_META: { name: PrayerName; label: string }[] = [
  { name: "fajr", label: "Fajr" },
  { name: "dhuhr", label: "Dhuhr" },
  { name: "asr", label: "Asr" },
  { name: "maghrib", label: "Maghrib" },
  { name: "isha", label: "Isha" },
];

const STATUS_STYLE: Record<PrayerStatus, string> = {
  pending: "border-[var(--border)] text-[var(--muted)]",
  onTime: "border-[var(--text)] bg-[var(--text)] text-[var(--background)]",
  late: "border-[var(--border)] text-[var(--text)]",
  qada: "border-[var(--border)] text-[var(--muted)]",
  missed: "border-red-500/30 text-red-500",
};

const STATUS_ABBR: Record<PrayerStatus, string> = {
  pending: "–",
  onTime: "On",
  late: "Late",
  qada: "Qada",
  missed: "Miss",
};

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function buildDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function Prayers() {
  const user = useAuthStore((state) => state.user);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [logs, setLogs] = useState<PrayerLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setLogs(await prayerService.getMonth(month, year));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  function shiftMonth(delta: number) {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
  }

  const logByDate = useMemo(() => {
    const map = new Map<string, PrayerLog>();
    logs.forEach((log) => map.set(log.date, log));
    return map;
  }, [logs]);

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const daysToShow = isCurrentMonth ? now.getDate() : daysInMonth(month, year);

  const consistency = useMemo(() => {
    let done = 0;
    let total = 0;
    for (let day = 1; day <= daysToShow; day++) {
      const log = logByDate.get(buildDateKey(year, month, day));
      PRAYER_META.forEach(({ name }) => {
        total += 1;
        const status = log?.[name];
        if (status === "onTime" || status === "late" || status === "qada") done += 1;
      });
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [logByDate, daysToShow, month, year]);

  if (!user?.namazTracker?.enabled) {
    return (
      <EmptyState
        title="Namaz Tracker is off"
        description="Turn it on from Settings to start tracking your daily prayers and see your history here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Prayers</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Your daily prayer history for the month.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="w-36 text-center text-sm font-medium">
            {new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatsCard label="Consistency this range" value={`${consistency}%`} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatsCard label="Days logged" value={logs.length} icon={<ListChecks className="h-4 w-4" />} />
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <th className="px-4 py-3 font-medium">Date</th>
                {PRAYER_META.map(({ name, label }) => (
                  <th key={name} className="px-4 py-3 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: daysToShow }, (_, index) => {
                const day = index + 1;
                const key = buildDateKey(year, month, day);
                const log = logByDate.get(key);

                return (
                  <tr key={key} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-2.5 text-[var(--muted)]">{day}</td>
                    {PRAYER_META.map(({ name }) => {
                      const status: PrayerStatus = log?.[name] ?? "pending";
                      return (
                        <td key={name} className="px-4 py-2.5">
                          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", STATUS_STYLE[status])}>
                            {STATUS_ABBR[status]}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
