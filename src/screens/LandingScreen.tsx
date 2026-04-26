import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { Button } from "../components/Button";

export function LandingScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const leaderboard = useGameStore((s) => s.leaderboard);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="text-7xl mb-2 drop-shadow-lg" aria-hidden>
          🀄
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-gold-400 tracking-wider">
          Hand Betting
        </h1>
        <p className="mt-2 text-ivory/70 text-sm tracking-widest uppercase">
          A Mahjong wager game
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-col items-center gap-8 w-full max-w-md"
      >
        <Button size="lg" onClick={startGame} className="w-full">
          New Game
        </Button>

        <section className="w-full rounded-2xl border border-ivory/10 bg-felt-900/50 backdrop-blur-md p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-gold-400">Leaderboard</h2>
            <span className="text-[10px] uppercase tracking-widest text-ivory/50">
              Top 5
            </span>
          </header>

          {leaderboard.length === 0 ? (
            <p className="text-ivory/50 text-sm italic text-center py-4">
              No scores yet. Be the first.
            </p>
          ) : (
            <ol className="space-y-1">
              {leaderboard.map((entry, i) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 bg-felt-800/50 border border-ivory/5"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={[
                        "font-display text-lg w-6 text-center",
                        i === 0
                          ? "text-gold-400"
                          : i === 1
                            ? "text-ivory/80"
                            : i === 2
                              ? "text-amber-700"
                              : "text-ivory/50",
                      ].join(" ")}
                    >
                      {i + 1}
                    </span>
                    <span className="text-ivory/90 text-sm">
                      {entry.name || "Anonymous"}
                    </span>
                  </span>
                  <span className="font-display text-xl text-gold-400 tabular-nums">
                    {entry.score}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <p className="text-ivory/40 text-xs max-w-xs text-center leading-relaxed">
          Bet higher or lower on the next hand. Dragons and winds shift in value
          as they win or lose. A tile hitting 0 or 10 ends the game.
        </p>
      </motion.div>
    </div>
  );
}
