import type {
  Bet,
  GameState,
  HandHistoryEntry,
  Tile,
} from "../types/game";
import { defaultRng, shuffle, type Rng } from "./random";
import { buildFreshDeck, handTotal, initialValueMap } from "./tiles";
import { draw, reshuffle } from "./deck";
import { adjustValues, hasBoundaryBreach } from "./scoring";

/**
 * Game configuration — centralized so extensions (e.g. change hand size,
 * change reshuffle cap, alter starting value) have exactly one knob to turn.
 */
export const DEFAULT_HAND_SIZE = 2;
export const MAX_RESHUFFLES = 3;

export interface NewGameOptions {
  rng?: Rng;
  handSize?: number;
}

/**
 * Build a freshly initialized GameState with the first hand already revealed
 * and awaiting a bet.
 */
export function newGame(opts: NewGameOptions = {}): GameState {
  const rng = opts.rng ?? defaultRng;
  const handSize = opts.handSize ?? DEFAULT_HAND_SIZE;

  const { tiles, nextSeed } = buildFreshDeck(0);
  const shuffled = shuffle(tiles, rng);
  const { drawn, remaining } = draw(shuffled, handSize);

  return {
    drawPile: remaining,
    discardPile: [],
    values: initialValueMap(),
    currentHand: drawn,
    history: [],
    score: 0,
    reshuffleCount: 0,
    phase: "awaiting-bet",
    gameOverReason: null,
    tileIdSeed: nextSeed,
  };
}

/**
 * Resolve the current hand by drawing the "next" hand and comparing totals.
 *
 * Flow:
 *   1. If the draw pile doesn't have enough tiles, reshuffle (increment count).
 *      If the reshuffle count hits MAX_RESHUFFLES, end the game immediately —
 *      per spec, "runs out of tiles for the 3rd time" ends the game.
 *   2. Draw the new hand.
 *   3. Compare new total vs current total using values BEFORE adjustment, so
 *      the player's read on the table is the read the bet is judged against.
 *   4. Apply dynamic scaling to the new hand's non-number tiles.
 *   5. Check for boundary breach (0 or 10) — triggers game-over.
 *   6. Score the win (cumulative new hand value on win, 0 on loss — keeps
 *      bigger, riskier hands meaningful).
 *   7. Move the prior current hand to history (with the bet and outcome).
 *
 * The bet evaluation treats ties as losses. This is a deliberate choice: in a
 * dynamic-value game, ties are cheap for the player and make bets uninteresting.
 */
export function placeBet(
  state: GameState,
  bet: Bet,
  rng: Rng = defaultRng
): GameState {
  if (state.phase !== "awaiting-bet") return state;
  const handSize = state.currentHand.length;

  let drawPile: Tile[] = state.drawPile;
  let discardPile: Tile[] = state.discardPile;
  let reshuffleCount = state.reshuffleCount;
  let tileIdSeed = state.tileIdSeed;

  if (drawPile.length < handSize) {
    const r = reshuffle({ drawPile, discardPile, tileIdSeed, rng });
    drawPile = r.drawPile;
    discardPile = r.discardPile;
    tileIdSeed = r.tileIdSeed;
    reshuffleCount += 1;

    if (reshuffleCount >= MAX_RESHUFFLES) {
      return {
        ...state,
        drawPile,
        discardPile,
        reshuffleCount,
        tileIdSeed,
        phase: "game-over",
        gameOverReason: "third-reshuffle",
      };
    }
  }

  const { drawn: newHand, remaining } = draw(drawPile, handSize);
  drawPile = remaining;

  const currentTotal = handTotal(state.currentHand, state.values);
  const newTotal = handTotal(newHand, state.values);

  const outcome: "win" | "loss" =
    bet === "higher"
      ? newTotal > currentTotal
        ? "win"
        : "loss"
      : newTotal < currentTotal
        ? "win"
        : "loss";

  const nextValues = adjustValues(state.values, newHand, outcome);
  const boundaryBreached = hasBoundaryBreach(nextValues);

  const prevEntry: HandHistoryEntry = {
    tiles: state.currentHand,
    total: currentTotal,
    bet,
    outcome,
  };

  return {
    ...state,
    drawPile,
    discardPile: [...discardPile, ...state.currentHand],
    currentHand: newHand,
    values: nextValues,
    history: [prevEntry, ...state.history],
    score: outcome === "win" ? state.score + newTotal : state.score,
    reshuffleCount,
    tileIdSeed,
    phase: boundaryBreached ? "game-over" : "awaiting-bet",
    gameOverReason: boundaryBreached ? "tile-value-boundary" : null,
  };
}

/** Convenience: current hand total using current values. */
export function currentHandTotal(state: GameState): number {
  return handTotal(state.currentHand, state.values);
}
