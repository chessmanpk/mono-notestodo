import { AnimatePresence, motion } from "framer-motion";
import { FileText, FolderKanban, Home, ListTodo, Search, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

const commands = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Tasks", path: "/tasks", icon: ListTodo },
  { label: "Notes", path: "/notes", icon: FileText },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));

  function run(path: string) {
    navigate(path);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Command</span>
        <kbd className="hidden rounded-md border border-[var(--border)] px-1.5 text-xs text-[var(--muted)] md:inline">⌘K</kbd>
      </Button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} className="relative w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-2 pb-3">
                <Search className="h-4 w-4 text-[var(--muted)]" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder="Search commands..." className="h-10 flex-1 bg-transparent text-sm outline-none" />
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="mt-2 space-y-1">
                {filtered.map((command) => {
                  const Icon = command.icon;
                  return (
                    <button key={command.path} onClick={() => run(command.path)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm hover:bg-[var(--surface-soft)]">
                      <Icon className="h-4 w-4 text-[var(--muted)]" />
                      {command.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
