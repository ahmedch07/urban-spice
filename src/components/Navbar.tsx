'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Percent, Keyboard, Wifi } from 'lucide-react';

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

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h1>
      </div>

      {/* POS Shortcuts & Clock */}
      <div className="flex items-center space-x-6 text-sm">
        {/* Keyboard Shortcuts guide */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs text-slate-300">
          <Keyboard className="w-4 h-4 text-amber-400" />
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono text-amber-300">F2</kbd> Search
          <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono text-amber-300">F4</kbd> New Order
          <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono text-amber-300">F8</kbd> Checkout
        </div>

        {/* Live Tax Indicator */}
        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          <Percent className="w-3.5 h-3.5" />
          <span>GST Tax: 5% Active</span>
        </div>

        {/* Online Status */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center space-x-2 font-mono font-medium text-amber-400 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-inner">
          <Clock className="w-4 h-4" />
          <span>{time || '00:00:00 AM'}</span>
        </div>
      </div>
    </header>
  );
}
