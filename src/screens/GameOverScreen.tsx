import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { Button } from "../components/Button";
import { wouldEnterBoard } from "../storage/leaderboard";

function reasonText(reason: string | null): string {
  switch (reason) {
    case "tile-value-boundary":
      return "A tile reached the 0/10 boundary.";
    case "third-reshuffle":
      return "The draw pile ran out for the third time.";
    default:
      return "Game ended.";
  }
}

export function GameOverScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const submitCurrentScore = useGameStore((s) => s.submitCurrentScore);
  const startGame = useGameStore((s) => s.startGame);
  const exitToLanding = useGameStore((s) => s.exitToLanding);

  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const score = gameState?.score ?? 0;
  const makesBoard = wouldEnterBoard(score);

  // Auto-submit anonymous if name is skipped AND score makes board
  useEffect(() => {
    if (!gameState) return;
    if (submitted) return;
    // no auto-submit; let user choose
  }, [gameState, submitted]);

  if (!gameState) return null;

  const handleSubmit = () => {
    submitCurrentScore(name.trim() || undefined);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="w-full max-w-md rounded-2xl border border-gold-500/40 bg-felt-900/80 backdrop-blur-md p-8 text-center shadow-2xl"
      >
        <div className="text-5xl mb-3" aria-hidden>
          🀫
        </div>
        <h1 className="font-display text-3xl text-gold-400 mb-1 tracking-wide">
          Game Over
        </h1>
        <p className="text-ivory/60 text-sm mb-6">
          {reasonText(gameState.gameOverReason)}
        </p>

        <div className="rounded-xl bg-felt-800/60 border border-ivory/10 py-6 mb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-ivory/50">
            Final Score
          </div>
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
            className="font-display text-6xl text-gold-400 tabular-nums"
          >
            {score}
          </motion.div>
          <div className="text-xs text-ivory/50 mt-2">
            {gameState.history.length} hands played ·{" "}
            {gameState.history.filter((h) => h.outcome === "win").length} wins
          </div>
        </div>

        {makesBoard && !submitted && (
          <div className="mb-5">
            <p className="text-emerald-300 font-semibold mb-2">
              You made the leaderboard!
            </p>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 16))}
                placeholder="Your name (optional)"
                className="flex-1 rounded-lg bg-felt-800 border border-ivory/10 px-3 py-2 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold-400"
              />
              <Button size="md" onClick={handleSubmit}>
                Save
              </Button>
            </div>
          </div>
        )}

        {submitted && (
          <p className="text-emerald-300 mb-5 text-sm">Score saved.</p>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={exitToLanding}
            className="flex-1"
          >
            Home
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={startGame}
            className="flex-1"
          >
            Play again
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
