'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pizza, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setIsLoading(false);
        return;
      }

      if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') {
        router.push('/dashboard');
      } else {
        router.push('/pos');
      }
      router.refresh();
    } catch (err) {
      setError('Connection failed. Please check server.');
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
            <Pizza className="w-9 h-9 text-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Slice & Spice Pizza</h1>
            <p className="text-xs text-amber-400 font-semibold mt-1">POS & Management System</p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pizzastore.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to POS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts Quick-Click Bar */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Demo Credentials (Click to auto-fill):</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@pizzastore.com', 'admin123')}
              className="p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-colors group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">Admin Role</div>
              <div className="text-[10px] text-slate-500 font-mono">admin@pizzastore.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('cashier@pizzastore.com', 'cashier123')}
              className="p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-colors group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">Cashier Role</div>
              <div className="text-[10px] text-slate-500 font-mono">cashier@pizzastore.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
