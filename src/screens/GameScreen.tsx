import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import {
  selectDiscardCount,
  selectDrawCount,
  selectReshuffles,
  useGameStore,
} from "../store/gameStore";
import { Button } from "../components/Button";
import { PileCounter } from "../components/PileCounter";
import { TileHand } from "../components/TileHand";
import { History } from "../components/History";
import { ValueMapStrip } from "../components/ValueMapStrip";
import { MAX_RESHUFFLES } from "../engine/game";

export function GameScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const bet = useGameStore((s) => s.bet);
  const exitToLanding = useGameStore((s) => s.exitToLanding);
  const lastOutcome = useGameStore((s) => s.lastOutcome);
  const clearLastOutcome = useGameStore((s) => s.clearLastOutcome);

  const drawCount = useGameStore(selectDrawCount);
  const discardCount = useGameStore(selectDiscardCount);
  const reshuffles = useGameStore(selectReshuffles);

  // Clear the outcome flash after it plays.
  useEffect(() => {
    if (!lastOutcome) return;
    const t = setTimeout(clearLastOutcome, 1200);
    return () => clearTimeout(t);
  }, [lastOutcome, clearLastOutcome]);

  if (!gameState) return null;

  const disabled = gameState.phase !== "awaiting-bet";
  const lowDraw = drawCount < 8;

  return (
    <div className="min-h-screen flex flex-col px-4 sm:px-6 py-4">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-6 sm:mb-8">
        <Button variant="ghost" size="sm" onClick={exitToLanding}>
          ← Exit
        </Button>
        <motion.div
          key={gameState.score}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="text-[10px] uppercase tracking-[0.3em] text-ivory/50">
            Score
          </div>
          <div className="font-display text-3xl text-gold-400 tabular-nums">
            {gameState.score}
          </div>
        </motion.div>
        <div className="w-[80px]" aria-hidden />
      </header>

      {/* Piles row */}
      <div className="flex justify-center gap-3 mb-6">
        <PileCounter
          label="Draw"
          count={drawCount}
          tone={lowDraw ? "warn" : "neutral"}
        />
        <PileCounter label="Discard" count={discardCount} />
        <PileCounter
          label="Reshuffles"
          count={reshuffles}
          sub={`of ${MAX_RESHUFFLES}`}
          tone={reshuffles >= MAX_RESHUFFLES - 1 ? "danger" : "neutral"}
        />
      </div>

      {/* Non-number value map */}
      <div className="flex justify-center mb-6">
        <ValueMapStrip values={gameState.values} />
      </div>

      {/* Current hand */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative">
          <TileHand
            tiles={gameState.currentHand}
            values={gameState.values}
            size="lg"
            label="Current Hand"
            highlight
          />

          <AnimatePresence>
            {lastOutcome && (
              <motion.div
                key={lastOutcome}
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: -40, scale: 1 }}
                exit={{ opacity: 0, y: -80 }}
                transition={{ duration: 0.8 }}
                className={[
                  "absolute left-1/2 -translate-x-1/2 -top-4 px-4 py-1.5 rounded-full",
                  "font-display uppercase tracking-widest text-sm",
                  lastOutcome === "win"
                    ? "bg-emerald-500/90 text-felt-900"
                    : "bg-crimson text-ivory",
                ].join(" ")}
              >
                {lastOutcome === "win" ? "Won" : "Lost"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bet buttons */}
        <div className="mt-10 flex gap-4">
          <Button
            variant="danger"
            size="lg"
            onClick={() => bet("lower")}
            disabled={disabled}
            aria-label="Bet lower"
          >
            ▼ Lower
          </Button>
          <Button
            variant="success"
            size="lg"
            onClick={() => bet("higher")}
            disabled={disabled}
            aria-label="Bet higher"
          >
            ▲ Higher
          </Button>
        </div>
      </main>

      {/* History */}
      <section className="mt-8">
        <h3 className="uppercase text-[10px] tracking-[0.3em] text-ivory/50 px-1 mb-2">
          History
        </h3>
        <History entries={gameState.history} values={gameState.values} />
      </section>
    </div>
  );
}
