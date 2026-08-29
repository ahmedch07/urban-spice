'use client';

import { useEffect, useState } from 'react';
import { Clock3, Menu, Sparkles } from 'lucide-react';

interface NavbarProps { title: string }

export default function Navbar({ title }: NavbarProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#101827]/95 px-3 backdrop-blur-xl sm:px-6"><div className="flex min-w-0 items-center gap-3"><button onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-800/80 text-amber-400 transition hover:border-amber-400/50 hover:bg-slate-700 lg:hidden" title="Toggle Navigation Menu" aria-label="Toggle Navigation Menu"><Menu className="h-5 w-5" /></button><div className="hidden h-10 w-1 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 sm:block" /><div className="min-w-0"><p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 sm:block">Urban Spice command center</p><h1 className="truncate text-sm font-black tracking-tight text-white sm:text-base md:text-lg">{title}</h1></div></div><div className="ml-3 flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 font-mono text-xs font-bold text-amber-300 shadow-inner sm:px-3 sm:text-sm"><Sparkles className="hidden h-3.5 w-3.5 text-amber-400 sm:block" /><Clock3 className="h-3.5 w-3.5 text-amber-400" /><span className="tabular-nums">{time || '00:00:00 AM'}</span></div></header>;
}
