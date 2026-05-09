"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      // Dynamic aria-label so screen readers announce what the click
      // will do, not just the toggle's identity. aria-pressed maps to
      // the toggle pattern (WAI-ARIA 1.2 button role with toggle state).
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={theme === "dark"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="group relative rounded-full cursor-pointer backdrop-blur-sm bg-white/10 hover:bg-gradient-to-br hover:from-blue-500/20 hover:via-purple-600/20 hover:to-pink-500/20 border border-white/10 hover:border-purple-400/40 shadow-sm hover:shadow-purple-500/30 transition-all duration-200 ease-out hover:scale-110 active:scale-95"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:text-yellow-500 group-hover:drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 group-hover:text-blue-400 group-hover:drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
