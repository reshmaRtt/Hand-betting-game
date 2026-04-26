import { motion } from "framer-motion";

interface PileCounterProps {
  label: string;
  count: number;
  /** Emphasis tier — affects color treatment. */
  tone?: "neutral" | "warn" | "danger";
  sub?: string;
}

export function PileCounter({
  label,
  count,
  tone = "neutral",
  sub,
}: PileCounterProps) {
  const toneClass =
    tone === "danger"
      ? "border-crimson/70 text-crimson"
      : tone === "warn"
        ? "border-gold-500/70 text-gold-400"
        : "border-ivory/20 text-ivory";

  return (
    <div
      className={[
        "flex flex-col items-center gap-1 rounded-xl px-4 py-3",
        "bg-felt-900/40 backdrop-blur-sm border",
        toneClass,
      ].join(" ")}
    >
      <span className="text-[10px] uppercase tracking-[0.25em] text-ivory/60">
        {label}
      </span>
      <motion.span
        key={count}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className="font-display text-3xl tabular-nums"
      >
        {count}
      </motion.span>
      {sub && <span className="text-[10px] text-ivory/40">{sub}</span>}
    </div>
  );
}
