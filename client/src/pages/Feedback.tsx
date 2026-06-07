import {
  Bug,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "../services/api";
import { feedbackService } from "../services/feedback.service";
import type {
  FeedbackItem,
  FeedbackType,
} from "../types/feedback.types";

const feedbackTypes: {
  value: FeedbackType;
  label: string;
  description: string;
  icon: typeof Bug;
}[] = [
  {
    value: "bug",
    label: "Bug",
    description: "Something is broken or not working correctly.",
    icon: Bug,
  },
  {
    value: "feature",
    label: "Feature",
    description: "A new idea that can make Mono better.",
    icon: Lightbulb,
  },
  {
    value: "general",
    label: "General",
    description: "Thoughts, suggestions, or overall feedback.",
    icon: MessageSquare,
  },
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status: FeedbackItem["status"]) {
  if (status === "reviewed") return "Reviewed";
  if (status === "closed") return "Closed";
  return "Open";
}

export default function Feedback() {
  const [type, setType] = useState<FeedbackType>("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedType = useMemo(
    () => feedbackTypes.find((item) => item.value === type),
    [type]
  );

  async function loadFeedback() {
    try {
      const result = await feedbackService.getMine();
      setFeedback(result);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle) {
      toast.error("Please add a feedback title");
      return;
    }

    if (!cleanMessage) {
      toast.error("Please add your feedback message");
      return;
    }

    if (cleanMessage.length < 10) {
      toast.error("Feedback message should be at least 10 characters");
      return;
    }

    try {
      setSubmitting(true);

      await feedbackService.create({
        type,
        title: cleanTitle,
        message: cleanMessage,
      });

      toast.success("Feedback submitted");

      setType("general");
      setTitle("");
      setMessage("");

      await loadFeedback();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-[var(--border)] bg-[var(--text)] p-5 text-[var(--background)] lg:border-b-0 lg:border-r md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--background)]/20 px-3 py-1 text-xs opacity-90">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Feedback</span>
            </div>

            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
              Help make Mono better.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 opacity-80 md:text-base">
              Share bugs, feature ideas, or general thoughts. Your feedback is
              saved with your account so the Mono team can review it and improve
              the app.
            </p>

            <div className="mt-8 rounded-3xl border border-[var(--background)]/20 p-4">
              <p className="text-sm font-medium">What happens next?</p>
              <p className="mt-2 text-xs leading-6 opacity-75">
                For now, you can submit feedback and see your own submissions.
                In the next phase, admin accounts will be able to review all
                feedback and update its status.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="min-w-0 p-5 md:p-8">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Feedback type
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {feedbackTypes.map((item) => {
                  const Icon = item.icon;
                  const active = type === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setType(item.value)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        active
                          ? "border-[var(--text)] bg-[var(--surface-soft)]"
                          : "border-[var(--border)] hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Icon className="h-4 w-4" />

                        {active && <CheckCircle2 className="h-4 w-4" />}
                      </div>

                      <p className="mt-4 text-sm font-medium">{item.label}</p>

                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="feedback-title"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Title
              </label>

              <input
                id="feedback-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={140}
                placeholder={
                  selectedType?.value === "bug"
                    ? "Example: Dashboard preview scroll issue"
                    : selectedType?.value === "feature"
                    ? "Example: Add calendar view"
                    : "Example: Mono feels clean and focused"
                }
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--text)]"
              />

              <div className="mt-1 text-right text-xs text-[var(--muted)]">
                {title.length}/140
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="feedback-message"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Message
              </label>

              <textarea
                id="feedback-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={2500}
                rows={8}
                placeholder="Write your feedback here..."
                className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--text)]"
              />

              <div className="mt-1 text-right text-xs text-[var(--muted)]">
                {message.length}/2500
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--text)] px-4 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-8">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-[var(--muted)]">Your feedback</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Submission history
            </h2>
          </div>

          <p className="text-sm text-[var(--muted)]">
            {feedback.length} {feedback.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-3xl border border-[var(--border)] p-5 text-sm text-[var(--muted)]">
              Loading feedback...
            </div>
          ) : feedback.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
              <p className="font-medium">No feedback submitted yet</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                When you send feedback, it will appear here.
              </p>
            </div>
          ) : (
            feedback.map((item) => (
              <article
                key={item._id}
                className="rounded-3xl border border-[var(--border)] p-4"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs capitalize text-[var(--muted)]">
                        {item.type}
                      </span>

                      <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                        {statusLabel(item.status)}
                      </span>
                    </div>

                    <h3 className="mt-3 break-words text-base font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--muted)]">
                      {item.message}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs text-[var(--muted)]">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}