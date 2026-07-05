import { Bold, Code, List, ListOrdered } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Textarea } from "../ui/Textarea";

type FormatAction = "bold" | "bullet" | "numbered" | "code";

// Wraps/prefixes the current selection with the right Markdown syntax, or
// inserts sensible placeholder text when nothing is selected, then restores
// focus and selects the inserted text so the user can type straight over it.
function applyFormat(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (value: string) => void,
  action: FormatAction
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);

  let insertText = "";
  let selectionStart = start;
  let selectionEnd = start;

  if (action === "bold") {
    const text = selected || "bold text";
    insertText = `**${text}**`;
    selectionStart = start + 2;
    selectionEnd = selectionStart + text.length;
  } else if (action === "code") {
    if (!selected) {
      // Nothing selected — default to a fenced block. This is the far more
      // common starting point (writing a fresh snippet), and it keeps
      // whatever gets typed next safely inside triple backticks instead of
      // collapsing onto one line the way inline code would.
      insertText = "```\ncode\n```";
      selectionStart = start + 4;
      selectionEnd = selectionStart + 4;
    } else if (selected.includes("\n")) {
      insertText = `\`\`\`\n${selected}\n\`\`\``;
      selectionStart = start + 4;
      selectionEnd = selectionStart + selected.length;
    } else {
      insertText = `\`${selected}\``;
      selectionStart = start + 1;
      selectionEnd = selectionStart + selected.length;
    }
  } else {
    const lines = (selected || "list item").split("\n");
    insertText = lines.map((line, i) => (action === "bullet" ? `- ${line}` : `${i + 1}. ${line}`)).join("\n");
    selectionStart = start;
    selectionEnd = start + insertText.length;
  }

  onChange(before + insertText + after);

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(selectionStart, selectionEnd);
  });
}

const TOOLBAR_BUTTON_CLASS =
  "rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] disabled:pointer-events-none disabled:opacity-40";

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function format(action: FormatAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    applyFormat(textarea, value, onChange, action);
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => format("bold")} disabled={preview} aria-label="Bold" title="Bold" className={TOOLBAR_BUTTON_CLASS}>
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => format("bullet")} disabled={preview} aria-label="Bullet list" title="Bullet list" className={TOOLBAR_BUTTON_CLASS}>
            <List className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => format("numbered")} disabled={preview} aria-label="Numbered list" title="Numbered list" className={TOOLBAR_BUTTON_CLASS}>
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => format("code")} disabled={preview} aria-label="Code" title="Code (selects multi-line as a block)" className={TOOLBAR_BUTTON_CLASS}>
            <Code className="h-3.5 w-3.5" />
          </button>
        </div>
        <button type="button" onClick={() => setPreview((v) => !v)} className="text-xs text-[var(--muted)] hover:text-[var(--text)]">
          {preview ? "Write" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="prose-mono min-h-60 p-4 text-sm">
          <ReactMarkdown>{value || "Nothing to preview yet."}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Start writing..."
          className="min-h-60 border-0 bg-transparent focus:border-0"
        />
      )}
    </div>
  );
}
