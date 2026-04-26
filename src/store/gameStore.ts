import { create } from "zustand";
import type { Bet, GameState, LeaderboardEntry } from "../types/game";
import { newGame, placeBet } from "../engine/game";
import {
  readLeaderboard,
  submitScore,
  wouldEnterBoard,
} from "../storage/leaderboard";

export type Screen = "landing" | "playing" | "game-over";

/**
 * UI store. The engine owns game rules and is fully pure; this store is just
 * a thin wrapper plus UI-only concerns (which screen, leaderboard cache,
 * transient "last outcome" for flash animations).
 */
interface UIState {
  screen: Screen;
  /** The most recent bet outcome, used by the UI to flash a win/loss banner. */
  lastOutcome: "win" | "loss" | null;
  leaderboard: LeaderboardEntry[];
  gameState: GameState | null;

  startGame: () => void;
  exitToLanding: () => void;
  bet: (bet: Bet) => void;
  submitCurrentScore: (name?: string) => void;
  /** Clear the transient outcome flag after its UI flash completes. */
  clearLastOutcome: () => void;
}

export const useGameStore = create<UIState>((set, get) => ({
  screen: "landing",
  lastOutcome: null,
  leaderboard: readLeaderboard(),
  gameState: null,

  startGame: () => {
    set({
      screen: "playing",
      lastOutcome: null,
      gameState: newGame(),
    });
  },

  exitToLanding: () => {
    set({
      screen: "landing",
      lastOutcome: null,
      gameState: null,
      leaderboard: readLeaderboard(),
    });
  },

  bet: (bet) => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== "awaiting-bet") return;
    const next = placeBet(gameState, bet);
    const lastOutcome = next.history[0]?.outcome ?? null;
    set({
      gameState: next,
      lastOutcome,
      screen: next.phase === "game-over" ? "game-over" : "playing",
    });
  },

  submitCurrentScore: (name) => {
    const { gameState } = get();
    if (!gameState) return;
    if (!wouldEnterBoard(gameState.score)) return;
    const next = submitScore(gameState.score, name);
    set({ leaderboard: next });
  },

  clearLastOutcome: () => set({ lastOutcome: null }),
}));

/** Selector helpers — avoids re-renders for unrelated slices. */
export const selectDrawCount = (s: UIState) =>
  s.gameState?.drawPile.length ?? 0;
export const selectDiscardCount = (s: UIState) =>
  s.gameState?.discardPile.length ?? 0;
export const selectReshuffles = (s: UIState) =>
  s.gameState?.reshuffleCount ?? 0;
