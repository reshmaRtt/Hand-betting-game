import { motion } from "framer-motion";
import type { ValueMap } from "../types/game";
import { DRAGONS, WINDS, typeIdOf } from "../engine/tiles";

interface Entry {
  typeId: string;
  glyph: string;
  label: string;
  isRed?: boolean;
}

const ENTRIES: Entry[] = [
  ...WINDS.map((wind) => ({
    typeId: typeIdOf({ kind: "wind", wind }),
    glyph: String.fromCodePoint(
      { east: 0x1f000, south: 0x1f001, west: 0x1f002, north: 0x1f003 }[wind]
    ),
    label: wind[0].toUpperCase(),
  })),
  ...DRAGONS.map((dragon) => ({
    typeId: typeIdOf({ kind: "dragon", dragon }),
    glyph: String.fromCodePoint(
      { red: 0x1f004, green: 0x1f005, white: 0x1f006 }[dragon]
    ),
    label: `${dragon[0].toUpperCase()}D`,
    isRed: dragon === "red",
  })),
];

interface ValueMapStripProps {
  values: ValueMap;
}

export function ValueMapStrip({ values }: ValueMapStripProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.25em] text-ivory/50">
        Drift
      </span>
      <div className="flex gap-1.5 items-center">
        {ENTRIES.map((e) => {
          const value = values[e.typeId] ?? 5;
          const danger = value <= 2 || value >= 8;
          return (
            <div
              key={e.typeId}
              className="flex flex-col items-center"
              title={`${e.label}: ${value}`}
            >
              <div
                className={[
                  "w-8 h-10 rounded-md bg-ivory/90 border border-gold-600/70",
                  "flex items-center justify-center",
                ].join(" ")}
              >
                <span
                  className={[
                    "font-display text-2xl leading-none",
                    e.isRed ? "text-crimson" : "text-felt-900",
                  ].join(" ")}
                >
                  {e.glyph}
                </span>
              </div>
              <motion.span
                key={value}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className={[
                  "mt-1 text-[11px] font-bold tabular-nums",
                  danger ? "text-crimson" : "text-gold-400",
                ].join(" ")}
              >
                {value}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
