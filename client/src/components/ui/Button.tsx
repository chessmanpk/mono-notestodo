import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-3" : "h-10 px-4",
        variant === "primary" && "border-[var(--text)] bg-[var(--text)] text-[var(--background)] hover:opacity-90",
        variant === "secondary" && "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-soft)]",
        variant === "ghost" && "border-transparent bg-transparent text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]",
        variant === "danger" && "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-500/15",
        className
      )}
      {...props}
    />
  );
}
