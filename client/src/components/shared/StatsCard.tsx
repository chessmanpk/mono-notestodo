import type { ReactNode } from "react";

export function StatsCard({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <span className="text-[var(--muted)]">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
