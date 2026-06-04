import { Moon, Monitor, Sun } from "lucide-react";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import type { Theme } from "../../types";
import { Button } from "../ui/Button";

const options: Array<{ label: string; value: Theme; icon: typeof Sun }> = [
  { label: "Light", value: "light", icon: Sun },
  { label: "Dark", value: "dark", icon: Moon },
  { label: "System", value: "system", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const { user, setUser } = useAuthStore();

  async function changeTheme(value: Theme) {
    setTheme(value);
    if (user) {
      const updated = await authService.updateProfile({ theme: value });
      setUser(updated);
    }
  }

  return (
    <div className="flex rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            key={option.value}
            size="sm"
            variant={theme === option.value ? "primary" : "ghost"}
            onClick={() => changeTheme(option.value)}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
