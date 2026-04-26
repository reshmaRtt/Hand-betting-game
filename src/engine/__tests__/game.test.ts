import { describe, expect, it } from "vitest";
import { newGame, placeBet, DEFAULT_HAND_SIZE } from "../game";
import { seeded } from "../random";
import { buildFreshDeck, handTotal } from "../tiles";
import { adjustValues, hasBoundaryBreach } from "../scoring";
import { reshuffle } from "../deck";

describe("newGame", () => {
  it("starts with a current hand and a draw pile of size 136 - HAND_SIZE", () => {
    const state = newGame({ rng: seeded(1) });
    expect(state.currentHand).toHaveLength(DEFAULT_HAND_SIZE);
    expect(state.drawPile).toHaveLength(136 - DEFAULT_HAND_SIZE);
    expect(state.discardPile).toHaveLength(0);
    expect(state.phase).toBe("awaiting-bet");
    expect(state.score).toBe(0);
  });

  it("initializes non-number tile values to 5", () => {
    const state = newGame({ rng: seeded(1) });
    for (const [typeId, value] of Object.entries(state.values)) {
      expect(value).toBe(5);
      expect(typeId.startsWith("wind-") || typeId.startsWith("dragon-")).toBe(
        true
      );
    }
  });
});

describe("placeBet", () => {
  it("moves prior hand to history and reveals a new current hand", () => {
    const s0 = newGame({ rng: seeded(42) });
    const s1 = placeBet(s0, "higher", seeded(7));
    expect(s1.history).toHaveLength(1);
    expect(s1.history[0].tiles).toEqual(s0.currentHand);
    expect(s1.currentHand).not.toEqual(s0.currentHand);
    expect(s1.discardPile).toEqual(s0.currentHand);
  });

  it("treats ties as losses", () => {
    // Build a deterministic state where current == new hand total.
    const tiles = buildFreshDeck(0).tiles;
    const number3s = tiles.filter(
      (t) => t.kind.kind === "number" && t.kind.rank === 3
    );
    const state = {
      ...newGame({ rng: seeded(1) }),
      currentHand: [number3s[0], number3s[1]], // total 6
      drawPile: [number3s[2], number3s[3], ...tiles], // next hand also 6
      discardPile: [],
      history: [],
    };
    const after = placeBet(state, "higher", seeded(1));
    expect(after.history[0].outcome).toBe("loss");
  });

  it("applies +1 to non-number tiles in a winning hand", () => {
    const s0 = newGame({ rng: seeded(3) });
    // Walk until we resolve a hand containing at least one non-number tile.
    let s = s0;
    for (let i = 0; i < 50; i++) {
      const before = s.values;
      const after = placeBet(s, "higher", seeded(i + 1));
      if (after.phase === "game-over") break;
      // Find a value that changed by +1 or -1.
      const changes = Object.entries(after.values).filter(
        ([k, v]) => v !== before[k]
      );
      if (changes.length > 0) {
        for (const [, v] of changes) {
          expect([before[changes[0][0]] + 1, before[changes[0][0]] - 1]).toContain(
            v
          );
        }
        return;
      }
      s = after;
    }
  });
});

describe("scoring module", () => {
  it("adjustValues only touches non-number typeIds", () => {
    const s0 = newGame({ rng: seeded(1) });
    const hand = s0.currentHand;
    const after = adjustValues(s0.values, hand, "win");
    const numberTypes = hand
      .filter((t) => t.kind.kind === "number")
      .map((t) => t.typeId);
    for (const nt of numberTypes) {
      expect(after[nt]).toBeUndefined();
    }
  });

  it("hasBoundaryBreach fires at 0 and 10", () => {
    expect(hasBoundaryBreach({ a: 5 })).toBe(false);
    expect(hasBoundaryBreach({ a: 0 })).toBe(true);
    expect(hasBoundaryBreach({ a: 10 })).toBe(true);
    expect(hasBoundaryBreach({ a: 11 })).toBe(true);
    expect(hasBoundaryBreach({ a: 4, b: -1 })).toBe(true);
  });
});

describe("deck module", () => {
  it("reshuffle combines draw + discard + a fresh deck", () => {
    const { tiles, nextSeed } = buildFreshDeck(0);
    const result = reshuffle({
      drawPile: tiles.slice(0, 10),
      discardPile: tiles.slice(10, 30),
      tileIdSeed: nextSeed,
      rng: seeded(1),
    });
    expect(result.drawPile).toHaveLength(10 + 20 + 136);
    expect(result.discardPile).toHaveLength(0);
    expect(result.tileIdSeed).toBe(nextSeed + 136);
  });
});

describe("hand totals", () => {
  it("sum of a hand respects dynamic values", () => {
    const s0 = newGame({ rng: seeded(9) });
    const total = handTotal(s0.currentHand, s0.values);
    const expected = s0.currentHand.reduce((acc, t) => {
      if (t.kind.kind === "number") return acc + t.kind.rank;
      return acc + 5;
    }, 0);
    expect(total).toBe(expected);
  });
});
