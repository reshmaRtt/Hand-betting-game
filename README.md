# Hand Betting Game

A web-based higher/lower betting game built on a Mahjong tile deck.
React + TypeScript + Vite + Tailwind + Zustand + Framer Motion.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview the production build locally
- `npm test` — run engine unit tests (vitest)

## How to play

1. Start a **new game** from the landing page.
2. A **current hand** is revealed (2 tiles). Its total is the sum of tile values.
3. Bet **Higher** or **Lower** for the next hand. The next hand is drawn and compared to the current hand's total.
4. If you were right, you **win**: the new hand's value is added to your score, and every non-number tile in that winning hand gains +1 value. If you lost, those tiles lose 1 value.
5. The new hand becomes the current hand. Previous hands slide into **History**.
6. The game ends when:
   - Any non-number tile's value hits **0** or **10**, OR
   - The draw pile runs out for the **3rd** time.

Ties count as losses by design (makes bets meaningful on a dynamic-value deck).

### UI reference: the Drift strip

Above the current hand, a compact **Drift** strip shows all 7 non-number tile types (E/S/W/N winds and Red/Green/White dragons) with their current values. Values flash **red** when they drift close to the game-over boundary (≤ 2 or ≥ 8). Use it to gauge how far the deck has shifted from its starting average of 10 per hand.

## Architecture

```
src/
├── types/game.ts          # domain types (Tile, GameState, etc.)
├── engine/
│   ├── tiles.ts           # deck composition, tile values, glyph mapping
│   ├── deck.ts            # draw / reshuffle primitives
│   ├── scoring.ts         # dynamic value adjustments + boundary checks
│   ├── random.ts          # injectable RNG (seedable for tests)
│   ├── game.ts            # newGame / placeBet — the state machine
│   └── __tests__/         # vitest unit tests
├── store/
│   └── gameStore.ts       # Zustand store — thin UI wrapper over the engine
├── storage/
│   └── leaderboard.ts     # localStorage-backed top-5 leaderboard
├── components/
│   ├── Tile.tsx           # single Mahjong tile (SVG-free, Unicode glyphs)
│   ├── TileHand.tsx       # a row of tiles + animated total
│   ├── History.tsx        # horizontally-scrolling previous hands
│   ├── PileCounter.tsx    # draw / discard / reshuffle readouts
│   └── Button.tsx         # styled button with motion affordances
├── screens/
│   ├── LandingScreen.tsx
│   ├── GameScreen.tsx
│   └── GameOverScreen.tsx
├── App.tsx                # screen router (crossfade)
├── main.tsx
└── index.css              # Tailwind + body gradient + tile 3D context
```

### Design principles

- **Pure engine.** `engine/` is a pile of pure functions with no React, no storage, no globals. `placeBet` takes a `GameState` and returns a new one. This makes the rules trivially testable and means new features (alter hand size, new tile types, alternative bet modes, deterministic replays) slot in without touching UI.
- **One config point.** Hand size, reshuffle cap, and base non-number value live as named constants in `engine/game.ts` and `engine/tiles.ts`. Change one number, everything propagates.
- **Injectable RNG.** Tests use a seeded Mulberry32 for deterministic assertions. Production uses `Math.random`. If we ever need replays or server-authoritative games, the RNG seed is already a first-class citizen.
- **Thin store.** `gameStore.ts` is ~70 lines and contains zero game logic. It dispatches to engine functions and tracks UI-only concerns (current screen, last outcome for flashes, leaderboard cache).
- **Tile-type values (not per-instance).** The spec says a non-number tile's value changes "specific to that tile." Interpreted as per-**type** (all East Winds share one value), not per physical copy — otherwise values would barely drift given four copies of each type and a large deck.

### Extension points the onsite can exercise

- **Different hand size** — change `DEFAULT_HAND_SIZE` in `engine/game.ts`, or thread `handSize` through `newGame(opts)` from the UI (already plumbed).
- **New tile kinds** — add a variant to `TileKind` in `types/game.ts`, extend `allTileKinds()` and `glyphFor()`. Scoring + game-over logic stays untouched because it keys off `isDynamicTile`.
- **New game-over rules** — add a check inside `placeBet` or factor into a list of predicates; `GameOverReason` is a tagged union so UI copy updates in one place.
- **Alternative bet modes** (e.g. "equal", wager amounts) — extend `Bet` union and the outcome branch in `placeBet`.
- **Server-authoritative play** — the engine is already pure and serializable; just ship `GameState` over the wire.

## Tile values & glyphs

Rendered with Unicode Mahjong codepoints (U+1F000..U+1F021) on an ivory card background. No image assets needed. Windows 11 / macOS / recent Chrome all render these as real tile glyphs.

Because the Mahjong glyphs can render ambiguously across fonts, every tile also carries a readable letter in the bottom-right corner:

- Number tiles — **C** / **B** / **D** (Characters / Bamboo / Dots); rank is shown in the top-right value badge
- Winds — **E** / **S** / **W** / **N**
- Dragons — **R** / **G** / **W** (Red / Green / White)

Tile details:

- Number tiles (Dots / Bamboo / Characters, 1–9, 4 copies each): face value
- Winds (E/S/W/N, 4 each): start at 5, drift with wins/losses
- Dragons (Red/Green/White, 4 each): start at 5, drift with wins/losses

Total deck: 136 tiles (same composition as a standard Mahjong set, sans flowers/seasons).

## AI assistance — honest disclosure

I want to be upfront: **most of this project was built with AI assistance (Claude)**. I was working full days during this assessment and had limited hours to spend on it, so I leaned on AI to move faster than I could on my own.

Parts of the stack were also new to me. I hadn't used Zustand, Framer Motion, or some of the more modern React/TypeScript patterns before — Claude suggested them, generated the initial code, and I went through each piece to understand what it was doing and why. Specifically, AI helped me with:

- Project scaffolding and tooling config (Vite, Tailwind, tsconfig, PostCSS)
- Large portions of the React components and screens (JSX structure, hooks usage, Tailwind classes)
- Framer Motion animations (initial/animate/exit props, crossfade transitions)
- The Zustand store wiring
- Unicode Mahjong glyph lookup and the tile rendering approach
- Vitest test scaffolding and most of the test cases
- Most of the README prose itself

What I contributed directly:
- Reading, understanding, and signing off on every piece before it went in — I didn't ship anything I couldn't explain
- Product/UX decisions and interpretation of ambiguous spec points (tie-as-loss, per-type value drift, hand size)
- Iteration on game feel and tuning
- Debugging and pushing back when AI output didn't fit or was wrong

So: the architectural ideas are mine, the judgment calls are mine, but a lot of the actual code came from AI and I then went through it to learn and adjust. I'd rather be honest about that than overstate what I wrote from scratch.

## Testing

Engine unit tests live in `src/engine/__tests__/`. They cover:

- Deck composition (136 tiles, correct type counts)
- Initial value map (non-numbers at 5, no entries for numbers)
- `placeBet` history bookkeeping and tie-as-loss semantics
- `adjustValues` only modifies non-number types
- `hasBoundaryBreach` at 0 and 10
- Reshuffle accounting

```bash
npm test
```

## License

MIT — built as a technical assessment, reuse freely.
