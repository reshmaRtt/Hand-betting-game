import type {
  Dragon,
  Suit,
  Tile,
  TileKind,
  TileTypeId,
  ValueMap,
  Wind,
} from "../types/game";

export const SUITS: Suit[] = ["dots", "bamboo", "characters"];
export const WINDS: Wind[] = ["east", "south", "west", "north"];
export const DRAGONS: Dragon[] = ["red", "green", "white"];
export const RANKS: ReadonlyArray<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9> = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,
];

export const NON_NUMBER_BASE_VALUE = 5;
export const COPIES_PER_TYPE = 4;

/** Stable, human-readable id for a tile type. */
export function typeIdOf(kind: TileKind): TileTypeId {
  switch (kind.kind) {
    case "number":
      return `num-${kind.suit}-${kind.rank}`;
    case "wind":
      return `wind-${kind.wind}`;
    case "dragon":
      return `dragon-${kind.dragon}`;
  }
}

/** Is this tile's value dynamic (non-number)? */
export function isDynamicTile(tile: Tile): boolean {
  return tile.kind.kind !== "number";
}

/** Face value of a number tile. Throws if called on a non-number tile. */
function numberValue(tile: Tile): number {
  if (tile.kind.kind !== "number") {
    throw new Error(`numberValue called on non-number tile ${tile.typeId}`);
  }
  return tile.kind.rank;
}

/** Current value of a tile, consulting the dynamic value map for non-numbers. */
export function valueOf(tile: Tile, values: ValueMap): number {
  if (tile.kind.kind === "number") return numberValue(tile);
  const v = values[tile.typeId];
  return v ?? NON_NUMBER_BASE_VALUE;
}

/** Sum of a set of tiles' current values. */
export function handTotal(tiles: Tile[], values: ValueMap): number {
  return tiles.reduce((sum, t) => sum + valueOf(t, values), 0);
}

/**
 * Build the set of distinct tile "types" in a standard deck.
 * Used both for deck construction and for initializing the value map.
 */
export function allTileKinds(): TileKind[] {
  const kinds: TileKind[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      kinds.push({ kind: "number", suit, rank });
    }
  }
  for (const wind of WINDS) kinds.push({ kind: "wind", wind });
  for (const dragon of DRAGONS) kinds.push({ kind: "dragon", dragon });
  return kinds;
}

/**
 * Build a full fresh deck (136 tiles: 4 copies of each type).
 * `startingSeed` is used to number physical tile ids so reshuffles don't collide.
 * Returns { tiles, nextSeed } — caller should thread nextSeed through state.
 */
export function buildFreshDeck(startingSeed: number): {
  tiles: Tile[];
  nextSeed: number;
} {
  const tiles: Tile[] = [];
  let seed = startingSeed;
  for (const kind of allTileKinds()) {
    const typeId = typeIdOf(kind);
    for (let copy = 0; copy < COPIES_PER_TYPE; copy++) {
      tiles.push({
        id: `${typeId}#${seed++}`,
        typeId,
        kind,
      });
    }
  }
  return { tiles, nextSeed: seed };
}

/** Initial value map: every non-number type starts at base 5. */
export function initialValueMap(): ValueMap {
  const map: Record<TileTypeId, number> = {};
  for (const kind of allTileKinds()) {
    if (kind.kind !== "number") {
      map[typeIdOf(kind)] = NON_NUMBER_BASE_VALUE;
    }
  }
  return map;
}
