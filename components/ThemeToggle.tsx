'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

/**
 * Theme Toggle Component
 * Switches between dark and light mode
 */

const THEME_STORAGE_KEY = 'theme-preference';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first for saved preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    let shouldBeDark: boolean;
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      // Use saved preference
      shouldBeDark = savedTheme === 'dark';
    } else {
      // Fall back to system preference
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDark(shouldBeDark);
    
    // Apply theme to HTML element
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newIsDark ? 'dark' : 'light');
    
    // Apply theme to HTML element
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Prevent hydration mismatch - return placeholder until mounted
  if (!mounted) {
    return (
      <div className="p-2 glass rounded-lg border border-white/20 w-10 h-10" aria-label="Loading theme toggle" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 glass rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-blue-400" />
      )}
    </motion.button>
  );
}

