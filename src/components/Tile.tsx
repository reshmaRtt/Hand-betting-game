import { motion } from "framer-motion";
import type { Tile as TileType, ValueMap } from "../types/game";
import { isDynamicTile, valueOf } from "../engine/tiles";

/**
 * Unicode Mahjong tile codepoints:
 *   Characters (Man): U+1F007..U+1F00F (1..9)
 *   Bamboo (Sou):     U+1F010..U+1F018
 *   Dots (Pin):       U+1F019..U+1F021
 *   Winds E/S/W/N:    U+1F000..U+1F003
 *   Dragons R/G/W:    U+1F004..U+1F006
 */
export function glyphFor(tile: TileType): string {
  const k = tile.kind;
  if (k.kind === "number") {
    const base = { characters: 0x1f007, bamboo: 0x1f010, dots: 0x1f019 }[
      k.suit
    ];
    return String.fromCodePoint(base + k.rank - 1);
  }
  if (k.kind === "wind") {
    return String.fromCodePoint(
      { east: 0x1f000, south: 0x1f001, west: 0x1f002, north: 0x1f003 }[k.wind]
    );
  }
  return String.fromCodePoint(
    { red: 0x1f004, green: 0x1f005, white: 0x1f006 }[k.dragon]
  );
}

export function shortLabel(tile: TileType): string {
  const k = tile.kind;
  if (k.kind === "number")
    return `${k.rank}${k.suit[0].toUpperCase()}`;
  if (k.kind === "wind") return k.wind[0].toUpperCase();
  return `${k.dragon[0].toUpperCase()}D`;
}

export interface TileProps {
  tile: TileType;
  values: ValueMap;
  size?: "sm" | "md" | "lg";
  /** Highlight ring — used for the active current hand. */
  highlight?: boolean;
  /** Visual-only delta badge, shown after a win/loss resolves. */
  delta?: 1 | -1 | 0;
}

const SIZES: Record<
  NonNullable<TileProps["size"]>,
  { w: string; glyph: string; label: string }
> = {
  sm: { w: "w-10 h-14", glyph: "text-3xl", label: "text-[10px]" },
  md: { w: "w-16 h-24", glyph: "text-5xl", label: "text-xs" },
  lg: { w: "w-20 h-28 sm:w-24 sm:h-32", glyph: "text-6xl sm:text-7xl", label: "text-sm" },
};

export function Tile({
  tile,
  values,
  size = "md",
  highlight,
  delta,
}: TileProps) {
  const s = SIZES[size];
  const value = valueOf(tile, values);
  const dynamic = isDynamicTile(tile);
  const isRed =
    (tile.kind.kind === "dragon" && tile.kind.dragon === "red") ||
    (tile.kind.kind === "number" && tile.kind.rank === 1);
  const cornerMark =
    tile.kind.kind === "number"
      ? tile.kind.suit[0].toUpperCase()
      : tile.kind.kind === "dragon"
        ? tile.kind.dragon[0].toUpperCase()
        : tile.kind.wind[0].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, rotateX: 60 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={[
        "relative shrink-0 rounded-lg bg-ivory border border-gold-600",
        "flex items-center justify-center",
        "shadow-tile select-none",
        highlight
          ? "ring-2 ring-gold-400 ring-offset-2 ring-offset-felt-800 animate-pulseGlow"
          : "",
        s.w,
      ].join(" ")}
      style={{ transformStyle: "preserve-3d" }}
      title={tile.typeId}
    >
      <span
        className={[
          "font-display leading-none",
          s.glyph,
          isRed ? "text-crimson" : "text-felt-900",
        ].join(" ")}
        aria-label={tile.typeId}
      >
        {glyphFor(tile)}
      </span>

      {/* Value badge — shows current dynamic value for non-numbers, face value otherwise */}
      <span
        className={[
          "absolute -top-2 -right-2 min-w-[1.4rem] h-6 px-1.5 rounded-full",
          "flex items-center justify-center",
          "font-bold",
          s.label,
          dynamic
            ? value <= 2 || value >= 8
              ? "bg-crimson text-ivory"
              : "bg-gold-500 text-felt-900"
            : "bg-felt-900 text-ivory border border-gold-500",
        ].join(" ")}
      >
        {value}
      </span>

      {/* Transient +/- delta overlay */}
      {delta ? (
        <motion.span
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: -24 }}
          transition={{ duration: 1.1 }}
          className={[
            "absolute left-1/2 -translate-x-1/2 -top-4 font-bold",
            delta > 0 ? "text-emerald-300" : "text-red-300",
            s.label,
          ].join(" ")}
        >
          {delta > 0 ? "+1" : "−1"}
        </motion.span>
      ) : null}

      {/* Suit/dragon letter — readable fallback when the Unicode glyph renders ambiguously */}
      {cornerMark && size !== "sm" && (
        <span className="absolute bottom-1 right-1 text-[10px] font-semibold text-felt-800/70 uppercase tracking-wide">
          {cornerMark}
        </span>
      )}
    </motion.div>
  );
}
