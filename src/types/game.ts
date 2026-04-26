/**
 * Core domain types for the Hand Betting Game.
 *
 * The engine is pure — these types describe immutable game state.
 * All state transitions are performed by reducer-style functions in `engine/`.
 */

export type Suit = "dots" | "bamboo" | "characters";
export type Wind = "east" | "south" | "west" | "north";
export type Dragon = "red" | "green" | "white";

export type TileKind =
  | { kind: "number"; suit: Suit; rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | { kind: "wind"; wind: Wind }
  | { kind: "dragon"; dragon: Dragon };

/** Stable string id for a tile type (not a physical instance). */
export type TileTypeId = string;

/** A physical tile in the deck. Multiple instances share the same typeId. */
export interface Tile {
  id: string; // unique per physical tile
  typeId: TileTypeId;
  kind: TileKind;
}

/** Map of typeId -> current value. Only non-number tiles mutate. */
export type ValueMap = Readonly<Record<TileTypeId, number>>;

export type Bet = "higher" | "lower";

export type Phase =
  | "awaiting-bet" // current hand revealed; waiting for higher/lower
  | "resolved" // next hand revealed and bet resolved; waiting for player to continue
  | "game-over";

export type GameOverReason =
  | "tile-value-boundary" // a non-number tile hit 0 or 10
  | "third-reshuffle"; // draw pile exhausted for the 3rd time

export interface HandHistoryEntry {
  tiles: Tile[];
  total: number;
  bet: Bet | null; // bet that was placed AGAINST this hand (null for the first hand)
  outcome: "win" | "loss" | null; // null for the very first hand
}

export interface GameState {
  drawPile: Tile[];
  discardPile: Tile[];
  values: ValueMap;
  currentHand: Tile[];
  history: HandHistoryEntry[];
  score: number;
  reshuffleCount: number;
  phase: Phase;
  gameOverReason: GameOverReason | null;
  /** Monotonic counter used to derive deterministic physical-tile ids across reshuffles. */
  tileIdSeed: number;
}

export interface LeaderboardEntry {
  id: string;
  score: number;
  timestamp: number;
  name?: string;
}
