import type { LeaderboardEntry } from "../types/game";

const STORAGE_KEY = "hbg.leaderboard.v1";
const MAX_ENTRIES = 5;

/**
 * localStorage-backed leaderboard. Kept to the top 5 entries (spec).
 *
 * All reads tolerate missing/corrupt storage by returning []. All writes are
 * no-ops when storage is unavailable (private-mode, SSR).
 */
export function readLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is LeaderboardEntry =>
          e &&
          typeof e.id === "string" &&
          typeof e.score === "number" &&
          typeof e.timestamp === "number"
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function submitScore(
  score: number,
  name?: string
): LeaderboardEntry[] {
  const entries = readLeaderboard();
  const newEntry: LeaderboardEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    score,
    timestamp: Date.now(),
    name,
  };
  const next = [...entries, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full or unavailable — swallow; leaderboard is non-critical
  }
  return next;
}

/** Returns true if this score would make the top-5 board. */
export function wouldEnterBoard(score: number): boolean {
  const entries = readLeaderboard();
  if (entries.length < MAX_ENTRIES) return score > 0;
  return score > entries[entries.length - 1].score;
}
