'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'navbar' | 'sidebar' | 'standalone';
  className?: string;
}

export default function ThemeToggle({ variant = 'navbar', className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.add('light');
    } else {
      setTheme('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-xl bg-slate-800 animate-pulse ${className}`} />
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Night Theme'}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
          theme === 'dark'
            ? 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border-amber-500/30'
        } ${className}`}
      >
        <div className="flex items-center space-x-2">
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
          <span>{theme === 'dark' ? 'White Theme' : 'Night Theme'}</span>
        </div>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Night Theme'}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${
        theme === 'dark'
          ? 'bg-slate-950 hover:bg-slate-900 text-amber-400 border-slate-800'
          : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span className="hidden sm:inline">White Theme</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-950" />
          <span className="hidden sm:inline">Night Theme</span>
        </>
      )}
    </button>
  );
}
