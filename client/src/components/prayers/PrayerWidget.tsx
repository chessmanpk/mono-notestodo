import { CloudSun, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../../services/api";
import { prayerService } from "../../services/prayer.service";
import { useAuthStore } from "../../store/auth.store";
import type { PrayerLog, PrayerName, PrayerStatus } from "../../types";
import { cn } from "../../utils/cn";
import { formatPrayerTime, getNextPrayer, getTodayPrayerTimes, todayDateKey } from "../../utils/prayerTimes";
import { Select } from "../ui/Select";

const PRAYER_META: { name: PrayerName; label: string; icon: typeof Sunrise }[] = [
  { name: "fajr", label: "Fajr", icon: Sunrise },
  { name: "dhuhr", label: "Dhuhr", icon: Sun },
  { name: "asr", label: "Asr", icon: CloudSun },
  { name: "maghrib", label: "Maghrib", icon: Sunset },
  { name: "isha", label: "Isha", icon: Moon },
];

const STATUS_OPTIONS: { value: PrayerStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "onTime", label: "On time" },
  { value: "late", label: "Late" },
  { value: "qada", label: "Qada" },
  { value: "missed", label: "Missed" },
];

export function PrayerWidget() {
  const user = useAuthStore((state) => state.user);
  const namaz = user?.namazTracker;
  const dateKey = useMemo(() => todayDateKey(), []);
  const [log, setLog] = useState<PrayerLog | null>(null);
  const [loading, setLoading] = useState(true);

  const hasLocation = typeof namaz?.location.lat === "number" && typeof namaz?.location.lng === "number";

  useEffect(() => {
    if (!namaz?.enabled) return;
    let active = true;

    (async () => {
      try {
        const result = await prayerService.getDay(dateKey);
        if (active) setLog(result);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [dateKey, namaz?.enabled]);

  const times = useMemo(() => {
    if (!namaz?.enabled || !hasLocation) return null;
    return getTodayPrayerTimes({
      lat: namaz.location.lat as number,
      lng: namaz.location.lng as number,
      calculationMethod: namaz.calculationMethod,
      madhab: namaz.madhab,
    });
  }, [namaz?.enabled, hasLocation, namaz?.location.lat, namaz?.location.lng, namaz?.calculationMethod, namaz?.madhab]);

  if (!namaz?.enabled) return null;

  const next = times ? getNextPrayer(times) : null;
  const nextLabel = next?.name ? PRAYER_META.find((p) => p.name === next.name)?.label : null;

  async function updateStatus(prayer: PrayerName, status: PrayerStatus) {
    try {
      const updated = await prayerService.setStatus(dateKey, prayer, status);
      setLog(updated);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Today's prayers</h2>
          {nextLabel && next?.at && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Next: {nextLabel} at {formatPrayerTime(next.at)}
            </p>
          )}
        </div>
        <Link to="/prayers" className="text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]">
          View history
        </Link>
      </div>

      {!hasLocation ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Set your location in{" "}
          <Link to="/settings" className="underline underline-offset-2 hover:text-[var(--text)]">
            Settings
          </Link>{" "}
          to see today's prayer times.
        </p>
      ) : loading ? (
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-[var(--surface-soft)]" />
      ) : (
        <div className="mt-4 space-y-2">
          {PRAYER_META.map(({ name, label, icon: Icon }) => {
            const status: PrayerStatus = log?.[name] ?? "pending";
            return (
              <div key={name} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-3 py-2">
                <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-[var(--muted)]">{times && formatPrayerTime(times[name])}</p>
                </div>
                <Select
                  value={status}
                  onChange={(event) => updateStatus(name, event.target.value as PrayerStatus)}
                  className={cn("w-32 shrink-0", status === "missed" && "border-red-500/30 text-red-500")}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
