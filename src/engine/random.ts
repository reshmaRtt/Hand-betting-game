/**
 * Seedable RNG wrapper. Default is Math.random; tests inject a deterministic
 * source. Keeping this in one place makes the engine trivially testable.
 */
export type Rng = () => number;

export const defaultRng: Rng = Math.random;

/** Fisher–Yates shuffle. Pure: returns a new array. */
export function shuffle<T>(input: readonly T[], rng: Rng = defaultRng): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Mulberry32 — small deterministic RNG for tests. */
export function seeded(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
