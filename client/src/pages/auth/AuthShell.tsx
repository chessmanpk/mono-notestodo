import type { ReactNode } from "react";
import { AuthBackground } from "../../components/auth/AuthBackground";

export function AuthShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-10 text-[var(--text)]">

      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">

        <div className="mb-8 text-center">
          <p className="text-2xl font-semibold tracking-tight">
            Mono
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            NotesToDo
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl p-6 shadow-xl">

          <h1 className="text-xl font-semibold tracking-tight">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>

          <div className="mt-6">
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}