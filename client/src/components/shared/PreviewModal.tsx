import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Modal } from "./Modal";

export function PreviewModal({
  open,
  title,
  eyebrow,
  body,
  meta,
  onClose,
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  body: string;
  meta?: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{eyebrow}</p>
      )}
      <div className="prose-mono max-h-[60vh] max-w-full overflow-auto rounded-2xl bg-[var(--surface-soft)] p-4 text-sm [overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-x-auto">
        <ReactMarkdown>{body || "Nothing to preview yet."}</ReactMarkdown>
      </div>
      {meta && <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">{meta}</div>}
    </Modal>
  );
}
