import {
  Archive,
  Bug,
  CheckCircle2,
  CircleDot,
  Inbox,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { getErrorMessage } from "../services/api";
import { feedbackService } from "../services/feedback.service";
import type {
  FeedbackItem,
  FeedbackStatus,
  FeedbackType,
} from "../types/feedback.types";
import { cn } from "../utils/cn";
import { niceDate } from "../utils/format";

const statusOptions: (FeedbackStatus | "all")[] = ["all", "open", "reviewed", "closed"];
const typeOptions: (FeedbackType | "all")[] = ["all", "bug", "feature", "general"];
const editableStatuses: FeedbackStatus[] = ["open", "reviewed", "closed"];

type StatusFilter = (typeof statusOptions)[number];
type TypeFilter = (typeof typeOptions)[number];

const statusCopy: Record<FeedbackStatus, { label: string; description: string; icon: typeof CircleDot }> = {
  open: {
    label: "Open",
    description: "Needs admin review.",
    icon: CircleDot,
  },
  reviewed: {
    label: "Reviewed",
    description: "Seen and understood.",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    description: "Resolved or no action needed.",
    icon: Archive,
  },
};

const typeCopy: Record<FeedbackType, { label: string; icon: typeof MessageSquare }> = {
  bug: { label: "Bug", icon: Bug },
  feature: { label: "Feature", icon: Lightbulb },
  general: { label: "General", icon: MessageSquare },
};

function labelFromValue(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function reviewerName(item: FeedbackItem) {
  if (!item.reviewedBy || typeof item.reviewedBy === "string") return "Admin";
  return item.reviewedBy.fullName || item.reviewedBy.email || "Admin";
}

function statusBadgeClass(status: FeedbackStatus) {
  if (status === "reviewed") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }

  if (status === "closed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

function statusCardClass(status: FeedbackStatus) {
  if (status === "reviewed") {
    return "border-sky-500/20 bg-sky-500/10";
  }

  if (status === "closed") {
    return "border-emerald-500/20 bg-emerald-500/10";
  }

  return "border-amber-500/20 bg-amber-500/10";
}

function statusTextClass(status: FeedbackStatus) {
  if (status === "reviewed") return "text-sky-700 dark:text-sky-300";
  if (status === "closed") return "text-emerald-700 dark:text-emerald-300";
  return "text-amber-700 dark:text-amber-300";
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, FeedbackStatus>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: feedback.length,
      open: feedback.filter((item) => item.status === "open").length,
      reviewed: feedback.filter((item) => item.status === "reviewed").length,
      closed: feedback.filter((item) => item.status === "closed").length,
    }),
    [feedback]
  );

  async function loadFeedback() {
    try {
      setLoading(true);
      const data = await feedbackService.getAdmin({
        status: statusFilter,
        type: typeFilter,
      });

      setFeedback(data);
      setStatusDrafts(
        data.reduce<Record<string, FeedbackStatus>>((acc, item) => {
          acc[item._id] = item.status;
          return acc;
        }, {})
      );
      setNoteDrafts(
        data.reduce<Record<string, string>>((acc, item) => {
          acc[item._id] = item.adminNote || "";
          return acc;
        }, {})
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, [statusFilter, typeFilter]);

  async function saveFeedback(item: FeedbackItem) {
    const status = statusDrafts[item._id] || item.status;
    const adminNote = noteDrafts[item._id] || "";

    try {
      setSavingId(item._id);
      const updated = await feedbackService.updateAdmin(item._id, {
        status,
        adminNote,
      });

      setFeedback((prev) => prev.map((current) => (current._id === updated._id ? updated : current)));
      setStatusDrafts((prev) => ({ ...prev, [updated._id]: updated.status }));
      setNoteDrafts((prev) => ({ ...prev, [updated._id]: updated.adminNote || "" }));
      toast.success("Feedback updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em]">Admin</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Feedback inbox</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Review user feedback, filter by type or status, send replies users can read, and mark items as
            open, reviewed, or closed.
          </p>
        </div>

        <Button variant="secondary" onClick={loadFeedback} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-medium text-[var(--muted)]">Showing</p>
          <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
        </div>

        {editableStatuses.map((status) => {
          const Icon = statusCopy[status].icon;

          return (
            <div key={status} className={cn("rounded-3xl border p-4", statusCardClass(status))}>
              <div className={cn("flex items-center gap-2", statusTextClass(status))}>
                <Icon className="h-4 w-4" />
                <p className="text-xs font-medium">{statusCopy[status].label}</p>
              </div>
              <p className="mt-2 text-2xl font-semibold">{counts[status]}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{statusCopy[status].description}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px] md:items-end">
          <div>
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <Inbox className="h-4 w-4" />
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">All feedback</h2>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">Newest submissions appear first.</p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Status</label>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : statusCopy[status].label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Type</label>
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All types" : typeCopy[type].label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          Loading feedback...
        </section>
      ) : feedback.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <p className="font-medium">No feedback found</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Try a different status or type filter.</p>
        </section>
      ) : (
        <section className="space-y-4">
          {feedback.map((item) => {
            const status = statusDrafts[item._id] || item.status;
            const note = noteDrafts[item._id] || "";
            const TypeIcon = typeCopy[item.type].icon;
            const dirty = status !== item.status || note !== (item.adminNote || "");

            return (
              <article key={item._id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">
                        <TypeIcon className="h-3.5 w-3.5" />
                        {typeCopy[item.type].label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium",
                          statusBadgeClass(item.status)
                        )}
                      >
                        {statusCopy[item.status].label}
                      </span>
                      <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                        {niceDate(item.createdAt)}
                      </span>
                    </div>

                    <h3 className="mt-4 break-words text-lg font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">From {item.userEmail}</p>
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--muted)]">
                      {item.message}
                    </p>

                    {item.reviewedAt && (
                      <p className="mt-4 text-xs text-[var(--muted)]">
                        Last reviewed by {reviewerName(item)} on {niceDate(item.reviewedAt)}
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Status</label>
                    <Select
                      value={status}
                      onChange={(event) =>
                        setStatusDrafts((prev) => ({ ...prev, [item._id]: event.target.value as FeedbackStatus }))
                      }
                    >
                      {editableStatuses.map((option) => (
                        <option key={option} value={option}>
                          {labelFromValue(option)}
                        </option>
                      ))}
                    </Select>

                    <label className="mb-2 mt-4 block text-xs font-medium text-[var(--muted)]">Reply to user</label>
                    <textarea
                      value={note}
                      onChange={(event) => setNoteDrafts((prev) => ({ ...prev, [item._id]: event.target.value }))}
                      maxLength={1000}
                      rows={5}
                      placeholder="Write a clear reply that this user can read..."
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-6 outline-none transition focus:border-[var(--text)]"
                    />
                    <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                      <span>This reply appears on the user's Feedback page.</span>
                      <span>{note.length}/1000</span>
                    </div>

                    <Button
                      className="mt-3 w-full"
                      onClick={() => saveFeedback(item)}
                      disabled={savingId === item._id || !dirty}
                    >
                      <Save className="h-4 w-4" />
                      {savingId === item._id ? "Saving..." : dirty ? "Save update" : "Saved"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
