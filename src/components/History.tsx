import { AnimatePresence, motion } from "framer-motion";
import type { HandHistoryEntry, ValueMap } from "../types/game";
import { Tile } from "./Tile";

interface HistoryProps {
  entries: HandHistoryEntry[];
  values: ValueMap;
}

/**
 * Horizontal scroller of past hands, most recent first. Each entry shows
 * its tiles at small size, the hand total, and a bet-outcome badge.
 */
export function History({ entries, values }: HistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="text-ivory/40 text-sm italic px-4">
        History will appear here after your first bet.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-2 px-1 scroll-smooth snap-x">
        <AnimatePresence initial={false}>
          {entries.map((entry, idx) => (
            <motion.div
              key={`${entry.tiles[0]?.id ?? "h"}-${idx}`}
              layout
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className={[
                "snap-start shrink-0 rounded-xl px-3 py-2",
                "border bg-felt-900/40 backdrop-blur-sm",
                entry.outcome === "win"
                  ? "border-emerald-500/60"
                  : entry.outcome === "loss"
                    ? "border-crimson/60"
                    : "border-ivory/10",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-ivory/50">
                  #{entries.length - idx}
                </span>
                {entry.bet && (
                  <span
                    className={[
                      "text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase",
                      entry.outcome === "win"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-crimson/20 text-red-300",
                    ].join(" ")}
                  >
                    {entry.bet} · {entry.outcome}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {entry.tiles.map((t) => (
                  <Tile key={t.id} tile={t} values={values} size="sm" />
                ))}
              </div>
              <div className="mt-1 text-center font-display text-lg text-gold-400 tabular-nums">
                {entry.total}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
