import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Textarea } from "../ui/Textarea";

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <span className="text-xs text-[var(--muted)]">Markdown</span>
        <button type="button" onClick={() => setPreview((v) => !v)} className="text-xs text-[var(--muted)] hover:text-[var(--text)]">
          {preview ? "Write" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="prose-mono min-h-60 p-4 text-sm">
          <ReactMarkdown>{value || "Nothing to preview yet."}</ReactMarkdown>
        </div>
      ) : (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="# Start writing..." className="min-h-60 border-0 bg-transparent focus:border-0" />
      )}
    </div>
  );
}
