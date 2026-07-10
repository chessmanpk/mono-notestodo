import { AlertTriangle, Bell, CheckCircle2, Info, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { announcementService } from "../../services/announcement.service";
import { getErrorMessage } from "../../services/api";
import { useAuthStore } from "../../store/auth.store";
import type { Announcement, AnnouncementTone } from "../../types";
import { cn } from "../../utils/cn";
import { timeAgo } from "../../utils/format";
import { MarkdownEditor } from "../shared/MarkdownEditor";
import { Modal } from "../shared/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

const LAST_SEEN_KEY = "mono:lastSeenAnnouncementAt";

const TONE_META: Record<AnnouncementTone, { label: string; icon: typeof Info }> = {
  info: { label: "Update", icon: Info },
  success: { label: "Shipped", icon: CheckCircle2 },
  warning: { label: "Heads up", icon: AlertTriangle },
};

export function AnnouncementBell() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const data = await announcementService.list();
      setAnnouncements(data);
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      const newest = data[0]?.createdAt;
      setHasUnread(Boolean(newest) && (!lastSeen || new Date(newest).getTime() > new Date(lastSeen).getTime()));
    } catch {
      // Silent — a failed announcement fetch shouldn't interrupt the rest of the app.
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggleOpen() {
    setOpen((value) => {
      const next = !value;
      if (next) {
        localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
        setHasUnread(false);
      }
      return next;
    });
  }

  function openComposer() {
    setEditing(null);
    setComposerOpen(true);
  }

  function openEdit(announcement: Announcement) {
    setEditing(announcement);
    setComposerOpen(true);
  }

  async function submitAnnouncement(data: { title: string; message: string; tone: AnnouncementTone }) {
    try {
      if (editing) {
        await announcementService.update(editing._id, data);
        toast.success("Announcement updated");
      } else {
        await announcementService.create(data);
        toast.success("Announcement posted");
      }
      setComposerOpen(false);
      setEditing(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function togglePin(announcement: Announcement) {
    try {
      await announcementService.update(announcement._id, { pinned: !announcement.pinned });
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function removeAnnouncement(announcement: Announcement) {
    if (!confirm("Delete this announcement?")) return;
    try {
      await announcementService.remove(announcement._id);
      toast.success("Announcement deleted");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Button variant="ghost" size="sm" onClick={toggleOpen} aria-label="Announcements">
        <span className="relative">
          <Bell className="h-4 w-4" />
          {hasUnread && <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--text)]" />}
        </span>
      </Button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[min(22rem,90vw)] rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-sm font-semibold tracking-tight">Announcements</p>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={openComposer} aria-label="New announcement">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {announcements.length === 0 && (
              <p className="px-1 py-6 text-center text-sm text-[var(--muted)]">No announcements yet.</p>
            )}
            {announcements.map((announcement) => {
              const meta = TONE_META[announcement.tone];
              const Icon = meta.icon;
              const author = typeof announcement.createdBy === "object" ? announcement.createdBy.fullName : null;
              return (
                <div key={announcement._id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                      {announcement.pinned && <Pin className="h-3 w-3 fill-current" />}
                    </div>
                    {isAdmin && (
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          onClick={() => togglePin(announcement)}
                          aria-label={announcement.pinned ? "Unpin" : "Pin"}
                          title={announcement.pinned ? "Unpin" : "Pin"}
                          className={cn(
                            "rounded-lg p-1 transition hover:bg-[var(--surface)] hover:text-[var(--text)]",
                            announcement.pinned ? "text-[var(--text)]" : "text-[var(--muted)]"
                          )}
                        >
                          <Pin className={cn("h-3.5 w-3.5", announcement.pinned && "fill-current")} />
                        </button>
                        <button
                          onClick={() => openEdit(announcement)}
                          aria-label="Edit"
                          title="Edit"
                          className="rounded-lg p-1 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeAnnouncement(announcement)}
                          aria-label="Delete"
                          title="Delete"
                          className="rounded-lg p-1 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-medium tracking-tight">{announcement.title}</p>
                  <div className="prose-mono mt-1 max-w-full text-xs [&_p]:my-1">
                    <ReactMarkdown>{announcement.message}</ReactMarkdown>
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--muted)]">
                    {author ? `${author} · ` : ""}{timeAgo(announcement.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isAdmin && (
        <Modal
          open={composerOpen}
          title={editing ? "Edit announcement" : "New announcement"}
          onClose={() => { setComposerOpen(false); setEditing(null); }}
        >
          <AnnouncementComposer
            announcement={editing}
            onSubmit={submitAnnouncement}
            onCancel={() => { setComposerOpen(false); setEditing(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

function AnnouncementComposer({
  announcement,
  onSubmit,
  onCancel,
}: {
  announcement?: Announcement | null;
  onSubmit: (data: { title: string; message: string; tone: AnnouncementTone }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [message, setMessage] = useState(announcement?.message ?? "");
  const [tone, setTone] = useState<AnnouncementTone>(announcement?.tone ?? "info");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, message, tone });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <Select value={tone} onChange={(e) => setTone(e.target.value as AnnouncementTone)}>
        <option value="info">Update</option>
        <option value="success">Shipped</option>
        <option value="warning">Heads up</option>
      </Select>
      <MarkdownEditor value={message} onChange={setMessage} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={loading || !title.trim() || !message.trim()}>
          {loading ? "Saving..." : announcement ? "Save changes" : "Post announcement"}
        </Button>
      </div>
    </form>
  );
}
