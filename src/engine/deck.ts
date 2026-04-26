import type { Tile } from "../types/game";
import { buildFreshDeck } from "./tiles";
import { shuffle, type Rng } from "./random";

/**
 * Reshuffle protocol (per spec):
 *   "When the Draw Pile is empty, add a fresh 'deck' worth of tiles, combine
 *    them with the Discard Pile, and shuffle them into a new Draw Pile."
 *
 * We follow the letter of that rule even if leftover draw tiles exist (e.g. a
 * future feature triggers a forced reshuffle) — they are folded in too.
 */
export function reshuffle(params: {
  drawPile: Tile[];
  discardPile: Tile[];
  tileIdSeed: number;
  rng: Rng;
}): { drawPile: Tile[]; discardPile: Tile[]; tileIdSeed: number } {
  const { tiles: freshTiles, nextSeed } = buildFreshDeck(params.tileIdSeed);
  const combined = [...params.drawPile, ...params.discardPile, ...freshTiles];
  return {
    drawPile: shuffle(combined, params.rng),
    discardPile: [],
    tileIdSeed: nextSeed,
  };
}

/**
 * Draw `n` tiles from the top of the draw pile. Caller must ensure enough
 * tiles remain — the engine triggers reshuffles before calling this.
 */
export function draw(
  drawPile: Tile[],
  n: number
): { drawn: Tile[]; remaining: Tile[] } {
  if (drawPile.length < n) {
    throw new Error(
      `draw: requested ${n} tiles but only ${drawPile.length} remain`
    );
  }
  return { drawn: drawPile.slice(0, n), remaining: drawPile.slice(n) };
}
