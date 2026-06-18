import { ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { getErrorMessage } from "../services/api";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import type { User, UserRole } from "../types";
import { niceDate } from "../utils/format";

const roleOptions: UserRole[] = ["user", "manager", "admin"];

const roleDescriptions: Record<UserRole, string> = {
  admin: "Full access, including user role management.",
  manager: "Elevated access for future team/admin tools.",
  user: "Standard personal workspace access.",
};

function roleLabel(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function AdminUsers() {
  const { user: currentUser, setUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const adminsCount = useMemo(() => users.filter((user) => user.role === "admin").length, [users]);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await authService.listUsers();
      setUsers(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function changeRole(targetUser: User, role: UserRole) {
    if (targetUser.role === role) return;

    if (targetUser._id === currentUser?._id && role !== "admin") {
      toast.error("You cannot remove your own Admin access.");
      return;
    }

    if (targetUser.role === "admin" && role !== "admin" && adminsCount <= 1) {
      toast.error("At least one Admin account is required.");
      return;
    }

    try {
      setSavingUserId(targetUser._id);
      const updated = await authService.updateUserRole(targetUser._id, role);
      setUsers((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));

      if (updated._id === currentUser?._id) {
        setUser(updated);
      }

      toast.success(`${updated.fullName} is now ${roleLabel(updated.role)}.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em]">Admin</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">User access</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Grant Manager or Admin access from here. New signups stay User by default.
          </p>
        </div>
        <Button variant="secondary" onClick={loadUsers} disabled={loading}>
          Refresh
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {roleOptions.map((role) => (
          <div key={role} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-semibold">{roleLabel(role)}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{roleDescriptions[role]}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] p-5">
          <UsersRound className="h-4 w-4 text-[var(--muted)]" />
          <h2 className="text-lg font-semibold tracking-tight">All users</h2>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-[var(--muted)]">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-5 text-sm text-[var(--muted)]">No users found.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {users.map((appUser) => {
              const isSelf = appUser._id === currentUser?._id;
              const disableSelect = savingUserId === appUser._id || (isSelf && appUser.role === "admin");

              return (
                <div key={appUser._id} className="grid gap-4 p-5 md:grid-cols-[1fr_220px] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">{appUser.fullName}</p>
                      {isSelf && (
                        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          You
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-[var(--muted)]">{appUser.email}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Joined {niceDate(appUser.createdAt)}</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Role</label>
                    <Select
                      value={appUser.role}
                      disabled={disableSelect}
                      onChange={(event) => changeRole(appUser, event.target.value as UserRole)}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {roleLabel(role)}
                        </option>
                      ))}
                    </Select>
                    {isSelf && appUser.role === "admin" && (
                      <p className="mt-2 text-xs text-[var(--muted)]">Self-demotion is blocked for safety.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
