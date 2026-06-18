import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../ui/Button";
import { CommandPalette } from "../shared/CommandPalette";
import { ThemeToggle } from "../shared/ThemeToggle";

function roleLabel(role?: string) {
  if (!role) return "User";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{user?.fullName || "Workspace"}</p>
              {user?.role && (
                <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {roleLabel(user.role)}
                </span>
              )}
            </div>
            <p className="hidden text-xs text-[var(--muted)] sm:block">A quiet workspace for people who do many things.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CommandPalette />
          <div className="hidden lg:block"><ThemeToggle /></div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
