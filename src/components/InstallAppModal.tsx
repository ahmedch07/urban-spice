'use client';

import { useState } from 'react';
import {
  X,
  Download,
  Laptop,
  CheckCircle2,
  Sparkles,
  Apple,
  Monitor,
  AppWindow,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export default function InstallAppModal({
  isOpen,
  onClose,
  deferredPrompt,
}: InstallAppModalProps) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Urban Spice desktop app installed to your laptop!');
        onClose();
      }
    } else {
      toast.info(
        'To install as standalone desktop app: Click the Install icon (⤓) in your Chrome/Edge address bar, or download the Mac / Windows launcher below!'
      );
    }
  };

  // Download Mac Standalone App Launcher (.command) that opens in dedicated App Window (no browser tabs/URL bar)
  const handleDownloadMacLauncher = () => {
    const scriptContent = `#!/bin/bash
# Urban Spice POS Standalone App Launcher for macOS
# Opens POS in dedicated borderless App Window mode

POS_URL="http://localhost:3000/pos"

if [ -d "/Applications/Google Chrome.app" ]; then
  open -na "Google Chrome" --args --app="$POS_URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
  open -na "Microsoft Edge" --args --app="$POS_URL"
elif [ -d "/Applications/Brave Browser.app" ]; then
  open -na "Brave Browser" --args --app="$POS_URL"
else
  open "$POS_URL"
fi
`;

    const blob = new Blob([scriptContent], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Launch Urban Spice App.command';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    toast.success('Downloaded Mac App Launcher! Double-click it from your Desktop or Dock to launch as a standalone app.');
  };

  // Download Windows Standalone App Launcher (.bat)
  const handleDownloadWindowsLauncher = () => {
    const batContent = `@echo off
:: Urban Spice POS Standalone App Launcher for Windows
start chrome.exe --app="http://localhost:3000/pos" 2>nul || start msedge.exe --app="http://localhost:3000/pos" 2>nul || start http://localhost:3000/pos
`;

    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Launch Urban Spice App.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    toast.success('Downloaded Windows App Launcher! Double-click to launch in standalone app window.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <AppWindow className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                  Launch as Standalone Laptop App
                </h2>
                <Badge variant="warning">Standalone</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Opens in its own dedicated window without browser URL bar or tabs
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="rounded-xl border-slate-800 bg-slate-950 hover:bg-slate-800"
          >
            <X className="w-5 h-5 text-slate-300" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Option 1: Native 1-Click PWA Installation */}
          <div className="bg-gradient-to-r from-amber-500/15 to-amber-600/15 border border-amber-500/35 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-amber-400">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>1-Click Browser App Install</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Installs as a native Mac / Windows App in your Applications menu and Dock
              </p>
            </div>
            <Button
              onClick={handleInstallPWA}
              variant="default"
              size="sm"
              className="font-extrabold text-xs shadow-md shadow-amber-500/20 shrink-0"
            >
              Install App
            </Button>
          </div>

          {/* Option 2: Standalone Desktop Window Launchers */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Download Standalone Window Launcher
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Mac App Launcher */}
              <button
                onClick={handleDownloadMacLauncher}
                className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl flex items-center space-x-3 text-left transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0 group-hover:text-amber-400 group-hover:border-amber-500/40">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-100 flex items-center space-x-1">
                    <span>Mac App Launcher</span>
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Standalone Window (.command)</p>
                </div>
              </button>

              {/* Windows App Launcher */}
              <button
                onClick={handleDownloadWindowsLauncher}
                className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl flex items-center space-x-3 text-left transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0 group-hover:text-amber-400 group-hover:border-amber-500/40">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-100 flex items-center space-x-1">
                    <span>Windows Launcher</span>
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Standalone Window (.bat)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-slate-100">Direct Browser Install Shortcut:</span>
            <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
              <li>
                In <strong>Chrome / Edge / Brave</strong>: Look at the top right of your address bar and click the <strong className="text-amber-400">Install App</strong> icon (⤓).
              </li>
              <li>
                Once installed, Urban Spice will open in its <strong>own standalone window</strong> with its own icon in the macOS Dock / Windows Taskbar!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Target: <code className="text-amber-400 font-mono">http://localhost:3000/pos</code>
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
