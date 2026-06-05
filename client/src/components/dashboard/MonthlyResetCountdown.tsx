import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Mail,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MonthCycle = {
  currentDay: number;
  totalDays: number;
  daysLeft: number;
  monthName: string;
  resetLabel: string;
};

type MonthlyResetCountdownProps = {
  monthlyProgress: number;
};

function getMonthCycle(): MonthCycle {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const currentDay = now.getDate();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysLeft = Math.max(totalDays - currentDay, 0);

  const monthName = now.toLocaleDateString("en-US", {
    month: "long",
  });

  const resetDate = new Date(year, month + 1, 1);

  const resetLabel = resetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return {
    currentDay,
    totalDays,
    daysLeft,
    monthName,
    resetLabel,
  };
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function MonthlyResetCountdown({
  monthlyProgress,
}: MonthlyResetCountdownProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const cycle = useMemo(() => getMonthCycle(), [now]);
  const progress = clampProgress(monthlyProgress);

  const isFinalStretch = cycle.daysLeft <= 3;
  const isLastDay = cycle.daysLeft === 0;

  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid min-w-0 gap-0 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="min-w-0 p-5 md:p-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--text)] text-[var(--background)]">
              <CalendarClock className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium">Monthly cycle</p>
              <p className="break-words text-xs text-[var(--muted)]">
                {cycle.monthName} workspace reset countdown
              </p>
            </div>
          </div>

          <div className="mt-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-[var(--muted)]">Current position</p>

              <h2 className="mt-1 break-words text-4xl font-semibold tracking-tight">
                Day {cycle.currentDay}
                <span className="text-[var(--muted)]">
                  {" "}
                  / {cycle.totalDays}
                </span>
              </h2>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Next reset
              </p>
              <p className="mt-1 text-sm font-medium">{cycle.resetLabel}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
              <span>Monthly progress</span>
              <span>{progress}% completed</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
              <div
                className="h-full rounded-full bg-[var(--text)] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-2 text-xs text-[var(--muted)] md:grid-cols-3">
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span className="break-words">Completed cleared</span>
            </div>

            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2">
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span className="break-words">Pending carried</span>
            </div>

            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="break-words">Report emailed</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 border-t border-[var(--border)] bg-[var(--text)] p-5 text-[var(--background)] lg:border-l lg:border-t-0 md:p-6">
          <p className="text-sm opacity-70">
            {isLastDay ? "Reset starts soon" : "Time left"}
          </p>

          <div className="mt-3 flex items-end gap-2">
            <p className="text-6xl font-semibold tracking-tight">
              {cycle.daysLeft}
            </p>
            <p className="mb-2 text-sm opacity-70">
              {cycle.daysLeft === 1 ? "day" : "days"}
            </p>
          </div>

          <div className="mt-6 h-px bg-[var(--background)]/20" />

          <p className="mt-5 break-words text-sm leading-6 opacity-80">
            {isFinalStretch
              ? "Month end is close. Finish what matters and let Mono carry the rest forward."
              : "At month end, Mono clears completed work, carries unfinished tasks, and sends your monthly report."}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
            <span>Fresh workspace</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
}