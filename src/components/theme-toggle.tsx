import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-12 h-7 rounded-full bg-gray-700 dark:bg-gray-600 border border-gray-600 dark:border-gray-500 flex items-center px-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      whileTap={{ scale: 0.95 }}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      <Sun className="absolute left-1.5 w-3.5 h-3.5 text-amber-400 opacity-0 dark:opacity-100 transition-opacity duration-300" />
      <Moon className="absolute right-1.5 w-3.5 h-3.5 text-blue-300 opacity-100 dark:opacity-0 transition-opacity duration-300" />

      <motion.div
        className="w-5 h-5 rounded-full bg-[var(--card)] shadow-md flex items-center justify-center"
        animate={{ x: theme === "dark" ? 0 : 20 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {theme === "dark" ? (
          <Moon className="w-3 h-3 text-[var(--text)]" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
