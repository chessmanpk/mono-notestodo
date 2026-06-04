import { Download, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ThemeToggle } from "../components/shared/ThemeToggle";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { api, getErrorMessage } from "../services/api";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [prefs, setPrefs] = useState(user?.notificationPreferences ?? { monthlyReport: true, overdueTasks: true, quietMode: true });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPrefs(user.notificationPreferences);
    }
  }, [user]);

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      const updated = await authService.updateProfile({ fullName, notificationPreferences: prefs });
      setUser(updated);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function exportData() {
    const res = await api.get("/auth/export");
    const blobUrl = window.URL.createObjectURL(new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "mono-my-data.json";
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  }

  async function deleteAccount() {
    if (!confirm("This permanently deletes your account and all workspace data. Continue?")) return;
    await authService.deleteAccount();
    setUser(null);
    toast.success("Account deleted");
    navigate("/register");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Profile, theme, exports, and account controls.</p>
      </div>

      <form onSubmit={save} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-medium">Notifications</h3>
          <div className="grid gap-2 text-sm text-[var(--muted)]">
            <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.monthlyReport} onChange={(e) => setPrefs({ ...prefs, monthlyReport: e.target.checked })} /> Monthly report reminders</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.overdueTasks} onChange={(e) => setPrefs({ ...prefs, overdueTasks: e.target.checked })} /> Overdue task reminders</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.quietMode} onChange={(e) => setPrefs({ ...prefs, quietMode: e.target.checked })} /> Quiet mode</label>
          </div>
        </div>
        <div className="mt-5 flex justify-end"><Button>Save settings</Button></div>
      </form>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold tracking-tight">Theme</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Use light, dark, or system mode.</p>
        <div className="mt-4"><ThemeToggle /></div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold tracking-tight">Data</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Export all your tasks, notes, projects, reports, and archives as JSON.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}><Download className="h-4 w-4" /> Export data</Button>
          <Button variant="danger" onClick={deleteAccount}><Trash2 className="h-4 w-4" /> Delete account</Button>
        </div>
      </section>
    </div>
  );
}
