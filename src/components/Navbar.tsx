'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, Percent, Keyboard, Menu } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const [time, setTime] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

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

  const handleF2Search = () => {
    if (pathname === '/pos') {
      const searchInput = document.getElementById('pos-search-input');
      if (searchInput) searchInput.focus();
    } else {
      router.push('/pos');
      setTimeout(() => {
        const searchInput = document.getElementById('pos-search-input');
        if (searchInput) searchInput.focus();
      }, 300);
    }
  };

  const handleF4NewOrder = () => {
    if (pathname === '/pos') {
      window.dispatchEvent(new Event('pos-shortcut-new-order'));
    } else {
      router.push('/pos');
      setTimeout(() => {
        window.dispatchEvent(new Event('pos-shortcut-new-order'));
      }, 300);
    }
  };

  const handleF8Checkout = () => {
    if (pathname === '/pos') {
      window.dispatchEvent(new Event('pos-shortcut-checkout'));
    } else {
      router.push('/pos');
      setTimeout(() => {
        window.dispatchEvent(new Event('pos-shortcut-checkout'));
      }, 300);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleF2Search();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleF4NewOrder();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleF8Checkout();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [pathname]);

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

      {/* Right: POS Shortcuts, Tax Badge, Clock */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* Interactive Keyboard Shortcuts Guide */}
        <div className="hidden xl:flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs text-slate-300">
          <Keyboard className="w-4 h-4 text-amber-400" />
          <span>Shortcuts:</span>
          <button
            onClick={handleF2Search}
            title="Focus Search Input (F2)"
            className="flex items-center space-x-1 hover:opacity-80 transition cursor-pointer"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded font-mono text-amber-300 text-[10px]">F2</kbd>
            <span>Search</span>
          </button>
          <button
            onClick={handleF4NewOrder}
            title="Clear & Start New Order (F4)"
            className="flex items-center space-x-1 hover:opacity-80 transition cursor-pointer ml-1"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded font-mono text-amber-300 text-[10px]">F4</kbd>
            <span>New Order</span>
          </button>
          <button
            onClick={handleF8Checkout}
            title="Open Payment Checkout (F8)"
            className="flex items-center space-x-1 hover:opacity-80 transition cursor-pointer ml-1"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded font-mono text-amber-300 text-[10px]">F8</kbd>
            <span>Checkout</span>
          </button>
        </div>

        {/* Live Tax Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium">
          <Percent className="w-3.5 h-3.5" />
          <span>GST: 5%</span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center space-x-1.5 font-mono font-bold text-xs sm:text-sm text-amber-400 bg-slate-950 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner shrink-0">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <span className="tabular-nums">{time || '00:00:00 AM'}</span>
        </div>
      </div>
    </header>
  );
}
