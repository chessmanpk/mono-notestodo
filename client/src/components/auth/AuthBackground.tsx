import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Quote = {
  text: string[];
  highlight: number;
};

const MONTHLY_QUOTES: Record<number, Quote[]> = {
  0: [
    { text: ["Fresh", "month.", "Fresh", "mind."], highlight: 0 },
    { text: ["Start", "small.", "Stay", "consistent."], highlight: 2 },
    { text: ["The", "best", "time", "is", "today."], highlight: 4 }
  ],

  1: [
    { text: ["Momentum", "comes", "from", "showing", "up."], highlight: 0 },
    { text: ["Discipline", "beats", "motivation."], highlight: 0 },
    { text: ["Build", "quietly."], highlight: 0 }
  ],

  2: [
    { text: ["Progress", "compounds."], highlight: 0 },
    { text: ["Consistency", "creates", "confidence."], highlight: 0 },
    { text: ["Stay", "focused."], highlight: 1 }
  ],

  3: [
    { text: ["Simple", "systems", "win."], highlight: 0 },
    { text: ["Clarity", "before", "speed."], highlight: 0 },
    { text: ["Keep", "building."], highlight: 1 }
  ],

  4: [
    { text: ["Small", "wins", "matter."], highlight: 1 },
    { text: ["Focus", "creates", "freedom."], highlight: 0 },
    { text: ["Less", "noise.", "More", "progress."], highlight: 3 }
  ],

  5: [
    { text: ["Finish", "what", "matters."], highlight: 0 },
    { text: ["Every", "day", "counts."], highlight: 2 },
    { text: ["One", "workspace.", "Zero", "distractions."], highlight: 3 }
  ],

  6: [
    { text: ["Consistency", "wins."], highlight: 0 },
    { text: ["Keep", "moving."], highlight: 1 },
    { text: ["Progress", "never", "stops."], highlight: 0 }
  ],

  7: [
    { text: ["Simplify", "everything."], highlight: 0 },
    { text: ["Organize.", "Execute."], highlight: 1 },
    { text: ["Think", "clearly."], highlight: 1 }
  ],

  8: [
    { text: ["Clarity", "creates", "action."], highlight: 0 },
    { text: ["Write", "it", "down."], highlight: 2 },
    { text: ["Everything", "begins", "with", "one", "note."], highlight: 4 }
  ],

  9: [
    { text: ["Review.", "Improve."], highlight: 1 },
    { text: ["Better", "than", "yesterday."], highlight: 3 },
    { text: ["Keep", "learning."], highlight: 1 }
  ],

  10: [
    { text: ["Discipline", "becomes", "habit."], highlight: 0 },
    { text: ["Habits", "shape", "results."], highlight: 2 },
    { text: ["Stay", "present."], highlight: 1 }
  ],

  11: [
    { text: ["Reflect.", "Reset.", "Begin", "again."], highlight: 2 },
    { text: ["A", "new", "month", "awaits."], highlight: 2 },
    { text: ["Keep", "going."], highlight: 1 }
  ]
};

export function AuthBackground() {
  const month = useMemo(() => new Date().getMonth(), []);

  const quotes = MONTHLY_QUOTES[month];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((v) => (v + 1) % quotes.length);
    }, 12000);

    return () => clearInterval(interval);
  }, [quotes]);

  const quote = quotes[index];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)]" />

      <div className="absolute left-16 top-20 text-[11rem] font-black tracking-tighter text-white/[0.025]">
        MONO
      </div>

      <div className="absolute right-20 bottom-12 text-sm uppercase tracking-[0.45em] text-white/10">
        RESET • PLAN • BUILD
      </div>

      <AnimatePresence mode="wait">

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
          className="absolute left-16 top-1/2 -translate-y-1/2 max-w-sm"
        >

          {quote.text.map((word, i) => (
            <div
              key={i}
              className={`text-5xl font-semibold tracking-tight ${
                i === quote.highlight
                  ? "text-white/75"
                  : "text-white/12"
              }`}
            >
              {word}
            </div>
          ))}

        </motion.div>

      </AnimatePresence>

    </div>
  );
}