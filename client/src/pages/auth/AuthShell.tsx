import { AnimatePresence, motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthBackground } from "../../components/auth/AuthBackground";
import { useThemeStore } from "../../store/theme.store";

const MONTHLY_QUOTES: Record<number, string[]> = {
  0: [
    "Fresh month. Fresh mind.",
    "Start small. Stay consistent.",
    "The best time is today.",
  ],

  1: [
    "Momentum comes from showing up.",
    "Discipline beats motivation.",
    "Build quietly.",
  ],

  2: [
    "Progress compounds.",
    "Consistency creates confidence.",
    "Stay focused.",
  ],

  3: [
    "Simple systems win.",
    "Clarity before speed.",
    "Keep building.",
  ],

  4: [
    "Small wins matter.",
    "Focus creates freedom.",
    "Less noise. More progress.",
  ],

  5: [
    "Finish what matters.",
    "Every day counts.",
    "One workspace. Zero distractions.",
  ],

  6: [
    "Consistency wins.",
    "Keep moving.",
    "Progress never stops.",
  ],

  7: [
    "Simplify everything.",
    "Organize. Execute.",
    "Think clearly.",
  ],

  8: [
    "Clarity creates action.",
    "Write it down.",
    "Everything begins with one note.",
  ],

  9: [
    "Review. Improve.",
    "Better than yesterday.",
    "Keep learning.",
  ],

  10: [
    "Discipline becomes habit.",
    "Habits shape results.",
    "Stay present.",
  ],

  11: [
    "Reflect. Reset. Begin again.",
    "A new month awaits.",
    "Keep going.",
  ],
};

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const month = useMemo(() => new Date().getMonth(), []);

  const quotes = MONTHLY_QUOTES[month];

  const [quoteIndex, setQuoteIndex] = useState(0);

  const theme = useThemeStore((state) => state.theme);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [quotes]);

  return (
    <div
      className="
        relative
        flex
        min-h-screen
        items-start
        justify-center
        overflow-hidden

        bg-[var(--background)]
        text-[var(--text)]

        px-4
        pt-40
        pb-10

        lg:items-center
        lg:pt-10
      "
    >
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo
        <div className="mb-8 text-center">
          <p className="text-2xl font-semibold tracking-tight">
            Mono
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            NotesToDo
          </p>
        </div> */}

        {/* Card */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl p-6 shadow-xl">

          <h1 className="text-xl font-semibold tracking-tight">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>

          <div className="mt-6">
            {children}
          </div>

        </div>

        {/* Mobile Quote */}
        <div className="mt-10 text-center lg:hidden">

          <AnimatePresence mode="wait">

            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.7,
                ease: "easeInOut",
              }}
              className={`mx-auto max-w-xs text-lg font-medium leading-8 ${
                isDark ? "text-white/45" : "text-black/60"
              }`}
            >
              {quotes[quoteIndex]}
            </motion.p>

          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}

            className={`mt-5 text-[11px] uppercase tracking-[0.45em] ${
              isDark ? "text-white/15" : "text-black/35"
            }`}
          >
            RESET • PLAN • BUILD
          </motion.p>

        </div>

      </div>
    </div>
  );
}