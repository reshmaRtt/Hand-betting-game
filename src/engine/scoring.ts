import type { Tile, ValueMap } from "../types/game";
import { isDynamicTile } from "./tiles";

/**
 * Apply the dynamic-scaling rule to a set of tiles after a hand resolves.
 *
 *   - win  -> each non-number tile's type value += 1
 *   - loss -> each non-number tile's type value -= 1
 *
 * Tiles of the same type share one value (e.g. all four East Winds).
 * If the same type appears multiple times in the hand, the adjustment applies
 * once per appearance. This matches the spec's "every time a tile is part of a
 * winning/losing hand" wording.
 */
export function adjustValues(
  values: ValueMap,
  tiles: Tile[],
  outcome: "win" | "loss"
): ValueMap {
  const delta = outcome === "win" ? 1 : -1;
  const next: Record<string, number> = { ...values };
  for (const tile of tiles) {
    if (!isDynamicTile(tile)) continue;
    const current = next[tile.typeId] ?? 0;
    next[tile.typeId] = current + delta;
  }
  return next;
}

/** True if any non-number tile's value has reached the 0/10 boundary. */
export function hasBoundaryBreach(values: ValueMap): boolean {
  for (const v of Object.values(values)) {
    if (v <= 0 || v >= 10) return true;
  }
  return false;
}
