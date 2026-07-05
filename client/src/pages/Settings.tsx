import { Download, MapPin, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ThemeToggle } from "../components/shared/ThemeToggle";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { api, getErrorMessage } from "../services/api";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import type { NamazTrackerSettings } from "../types";
import { CALCULATION_METHOD_OPTIONS } from "../utils/prayerTimes";

const DEFAULT_NAMAZ_SETTINGS: NamazTrackerSettings = {
  enabled: false,
  calculationMethod: "MuslimWorldLeague",
  madhab: "shafi",
  location: { lat: null, lng: null, label: "" },
};

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [prefs, setPrefs] = useState(user?.notificationPreferences ?? { monthlyReport: true, overdueTasks: true, quietMode: true });
  const [namaz, setNamaz] = useState<NamazTrackerSettings>(user?.namazTracker ?? DEFAULT_NAMAZ_SETTINGS);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPrefs(user.notificationPreferences);
      setNamaz(user.namazTracker ?? DEFAULT_NAMAZ_SETTINGS);
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

  async function saveNamaz(event: FormEvent) {
    event.preventDefault();
    try {
      const updated = await authService.updateProfile({ namazTracker: namaz });
      setUser(updated);
      toast.success("Namaz Tracker settings saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Location is not available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNamaz((prev) => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: prev.location.label || "Current location",
          },
        }));
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location. Enter it manually instead.");
      }
    );
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

      <form onSubmit={saveNamaz} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Namaz Tracker</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Track your five daily prayers and see today's prayer times. Off by default — nothing changes unless you turn it on.
            </p>
          </div>
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={namaz.enabled}
              onChange={(e) => setNamaz({ ...namaz, enabled: e.target.checked })}
            />
            <span className="text-sm">{namaz.enabled ? "On" : "Off"}</span>
          </label>
        </div>

        {namaz.enabled && (
          <div className="mt-5 space-y-4 border-t border-[var(--border)] pt-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Location</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="City, country (e.g. Lahore, Pakistan)"
                  value={namaz.location.label}
                  onChange={(e) => setNamaz({ ...namaz, location: { ...namaz.location, label: e.target.value } })}
                />
                <Button type="button" variant="secondary" onClick={useCurrentLocation} disabled={locating}>
                  <MapPin className="h-4 w-4" /> {locating ? "Locating..." : "Use current location"}
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                {typeof namaz.location.lat === "number" && typeof namaz.location.lng === "number"
                  ? `Coordinates set (${namaz.location.lat.toFixed(2)}, ${namaz.location.lng.toFixed(2)})`
                  : "No coordinates set yet — prayer times need this to calculate."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Calculation method</label>
                <Select
                  value={namaz.calculationMethod}
                  onChange={(e) => setNamaz({ ...namaz, calculationMethod: e.target.value })}
                >
                  {CALCULATION_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Madhab (affects Asr)</label>
                <Select
                  value={namaz.madhab}
                  onChange={(e) => setNamaz({ ...namaz, madhab: e.target.value as "shafi" | "hanafi" })}
                >
                  <option value="shafi">Shafi / Maliki / Hanbali</option>
                  <option value="hanafi">Hanafi</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end"><Button>Save Namaz Tracker settings</Button></div>
      </form>

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
