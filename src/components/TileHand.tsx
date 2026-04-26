import { AnimatePresence, motion } from "framer-motion";
import type { Tile as TileType, ValueMap } from "../types/game";
import { Tile } from "./Tile";
import { handTotal } from "../engine/tiles";

interface TileHandProps {
  tiles: TileType[];
  values: ValueMap;
  size?: "sm" | "md" | "lg";
  highlight?: boolean;
  label?: string;
  /** Optional: known total override (for showing pre-adjustment totals). */
  totalOverride?: number;
}

export function TileHand({
  tiles,
  values,
  size = "lg",
  highlight,
  label,
  totalOverride,
}: TileHandProps) {
  const total = totalOverride ?? handTotal(tiles, values);

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <span className="uppercase tracking-[0.3em] text-xs text-ivory/60 font-medium">
          {label}
        </span>
      )}

      <div className="flex gap-3 items-end">
        <AnimatePresence mode="popLayout">
          {tiles.map((t, i) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -40, rotateY: 90 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 180, damping: 18 }}
            >
              <Tile tile={t} values={values} size={size} highlight={highlight} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        key={total}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="font-display text-4xl sm:text-5xl text-gold-400 tabular-nums drop-shadow"
      >
        {total}
      </motion.div>
    </div>
  );
}
