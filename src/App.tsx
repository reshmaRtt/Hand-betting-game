import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "./store/gameStore";
import { LandingScreen } from "./screens/LandingScreen";
import { GameScreen } from "./screens/GameScreen";
import { GameOverScreen } from "./screens/GameOverScreen";

/**
 * Screen-level router. The store owns "which screen"; this just crossfades
 * between them. Keeps main.tsx trivial and leaves room to swap in a real
 * router later without touching the screen components.
 */
export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {screen === "landing" && <LandingScreen />}
        {screen === "playing" && <GameScreen />}
        {screen === "game-over" && <GameOverScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
