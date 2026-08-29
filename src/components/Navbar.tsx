'use client';

import { useState, useEffect } from 'react';
import { Clock, Menu } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-PK', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => {
    window.dispatchEvent(new Event('toggle-sidebar'));
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 select-none">
      {/* Left: Mobile Menu Toggle & Page Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 pr-2">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition shrink-0"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-amber-400" />
        </button>

        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-slate-100 tracking-tight truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-none">
          {title}
        </h1>
      </div>

      {/* Right: Real-time Clock */}
      <div className="flex items-center space-x-1.5 font-mono font-bold text-xs sm:text-sm text-amber-400 bg-slate-950 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner shrink-0">
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
        <span className="tabular-nums">{time || '00:00:00 AM'}</span>
      </div>
    </header>
  );
}
