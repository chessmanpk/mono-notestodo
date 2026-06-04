export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-3xl border border-[var(--border)] bg-[var(--surface)]" />
      ))}
    </div>
  );
}
