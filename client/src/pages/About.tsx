import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Github,
  Layers3,
  MessageSquare,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

const githubRepoUrl =
  import.meta.env.VITE_GITHUB_REPO_URL ||
  "https://github.com/YOUR_USERNAME/mono-notestodo";

const features = [
  {
    title: "Tasks",
    description:
      "Plan daily work, mark tasks complete, and keep your workspace focused.",
    icon: CheckCircle2,
  },
  {
    title: "Notes",
    description:
      "Write down thoughts, ideas, and important details in a clean writing space.",
    icon: FileText,
  },
  {
    title: "Projects",
    description:
      "Track larger goals and see project progress without making the app feel heavy.",
    icon: Layers3,
  },
  {
    title: "Monthly reset",
    description:
      "Completed tasks are cleared, unfinished work moves forward, and old noise gets archived.",
    icon: RefreshCcw,
  },
];

export default function About() {
  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-5 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>About Mono</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              A quiet workspace for notes, tasks, and monthly focus.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
              Mono is a minimal productivity app designed for people who manage
              many things at once. It keeps your tasks, notes, projects, and
              monthly progress in one calm workspace without unnecessary noise.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
              >
                <Github className="h-4 w-4" />
                View GitHub repo
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <Link
                to="/feedback"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--surface-soft)]"
                >
                <MessageSquare className="h-4 w-4" />
                Share feedback
              </Link>
            </div>
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--text)] p-5 text-[var(--background)] lg:border-l lg:border-t-0 md:p-8">
            <p className="text-sm opacity-70">Mono principle</p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Fresh month. Less noise. Better focus.
            </h2>

            <p className="mt-5 text-sm leading-7 opacity-80">
              Mono is built around a monthly workspace. At the end of each
              month, completed work is cleared, unfinished work is carried
              forward, and a monthly report helps users understand their
              progress.
            </p>

            <div className="mt-8 rounded-3xl border border-[var(--background)]/20 p-4">
              <p className="text-sm font-medium">Open for improvement</p>
              <p className="mt-2 text-xs leading-6 opacity-75">
                The GitHub repository is available for anyone who wants to help
                improve Mono, suggest ideas, fix issues, or build better
                features.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text)]">
                <Icon className="h-4 w-4" />
              </div>

              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {feature.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--muted)]">
            Why Mono exists
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Most productivity apps keep adding more. Mono tries to remove what
            gets in the way.
          </h2>

          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Mono is made for simple daily planning. The app helps users focus on
            today, keep useful notes, track important projects, and understand
            progress over time. Its monthly reset system keeps the workspace
            fresh so users do not feel trapped by old completed work.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-medium">Simple by design</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Clean screens, minimal controls, and no unnecessary clutter.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-medium">Monthly by default</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Work is organized around fresh monthly cycles.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-medium">Built to improve</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Feedback and contributions will help shape better versions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}