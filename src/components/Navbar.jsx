import React from 'react';
import { Shield, LogOut, Navigation, Radio, Activity, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Navbar({ currentRoute, setRoute, user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#090A18]/80 border-b border-white/10 shadow-2xl shadow-black/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        
        {/* Brand Header */}
        <div 
          onClick={() => setRoute('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-[#FF5F8A] via-pink-600 to-purple-600 shadow-lg shadow-[#FF5F8A]/30 group-hover:scale-105 group-hover:shadow-[#FF5F8A]/50 transition-all duration-300">
            <Shield className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#090A18] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-wide text-white group-hover:text-[#FF5F8A] transition-colors">
                Shrimati Setu
              </h1>
              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SENTINEL ACTIVE
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase hidden xs:block">
              Guardian Emergency Console
            </p>
          </div>
        </div>

        {/* Navigation & Logout Actions */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* System Status indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>SATELLITE SYNC OK</span>
            </div>

            {/* Overview Tab */}
            <button
              onClick={() => setRoute('dashboard')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                currentRoute === 'dashboard'
                  ? 'bg-gradient-to-r from-[#FF5F8A] to-purple-600 text-white shadow-lg shadow-[#FF5F8A]/25 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Radio className={`w-4 h-4 ${currentRoute === 'dashboard' ? 'text-white' : 'text-[#FF5F8A]'}`} />
              <span className="inline">Overview</span>
            </button>

            {/* Safe Zones Tab */}
            <button
              onClick={() => setRoute('safe-zones')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                currentRoute === 'safe-zones'
                  ? 'bg-gradient-to-r from-purple-600 to-[#FF5F8A] text-white shadow-lg shadow-purple-600/25 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Navigation className={`w-4 h-4 ${currentRoute === 'safe-zones' ? 'text-white' : 'text-purple-400'}`} />
              <span className="inline">Safe Zones</span>
            </button>

            <div className="h-5 w-px bg-white/10 mx-1" />

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
}
