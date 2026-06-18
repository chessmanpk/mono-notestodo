import {
  BarChart3,
  FileText,
  FolderKanban,
  Home,
  Info,
  ListTodo,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import type { UserRole } from "../../types";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";

type NavItem = {
  label: string;
  path: string;
  icon: typeof Home;
  allowedRoles?: UserRole[];
};

const nav: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Tasks", path: "/tasks", icon: ListTodo },
  { label: "Notes", path: "/notes", icon: FileText },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Admin", path: "/admin/users", icon: ShieldCheck, allowedRoles: ["admin"] },
  { label: "About", path: "/about", icon: Info },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  const visibleNav = nav.filter((item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.role)));

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 md:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-dvh w-72 flex-col border-r border-[var(--border)] bg-[var(--background)] p-4 transition-transform duration-300",
          "md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight">Mono</p>
            <p className="text-xs text-[var(--muted)]">NotesToDo</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                    isActive
                      ? "bg-[var(--text)] text-[var(--background)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm font-medium">Fresh month mindset</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Unfinished work moves forward. Old noise gets archived.
          </p>
        </div>
      </aside>
    </>
  );
}
