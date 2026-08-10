'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting until the component is mounted on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-muted/40 border border-border/50 animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:bg-muted/80 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer shadow-sm hover:shadow-md"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <Sun className="absolute w-5 h-5 text-amber-400 transition-all duration-500 transform rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        <Moon className="absolute w-5 h-5 text-indigo-600 transition-all duration-500 transform rotate-0 scale-100 dark:rotate-90 dark:scale-0" />
      </div>
    </button>
  );
}
