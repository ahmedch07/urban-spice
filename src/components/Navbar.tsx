'use client';

import { useState, useEffect } from 'react';
import { Clock, Menu, Download, Laptop } from 'lucide-react';
import InstallAppModal from '@/components/InstallAppModal';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const [time, setTime] = useState<string>('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const toggleSidebar = () => {
    window.dispatchEvent(new Event('toggle-sidebar'));
  };

  return (
    <>
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

        {/* Right: Download Shortcut Button & Clock */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Download App Shortcut Button */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/20 hover:from-amber-500/25 hover:to-amber-600/35 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/40 shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Download / Install Laptop Desktop Shortcut"
          >
            <Download className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="hidden xs:inline">App Shortcut</span>
            <span className="xs:hidden">App</span>
          </button>

          {/* Real-time Clock */}
          <div className="flex items-center space-x-1.5 font-mono font-bold text-xs sm:text-sm text-amber-400 bg-slate-950 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="tabular-nums">{time || '00:00:00 AM'}</span>
          </div>
        </div>
      </header>

      {/* Install Desktop App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </>
  );
}
