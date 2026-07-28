import React from 'react';
import { Shield, LogOut, Navigation, Radio } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/75 border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Header */}
        <div 
          onClick={() => setRoute('dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative p-2 sm:p-2.5 rounded-full bg-gradient-to-br from-[#FF5F8A] to-purple-600 shadow-md shadow-[#FF5F8A]/30 group-hover:scale-105 transition-transform duration-300">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-wide text-slate-900 group-hover:text-[#FF5F8A] transition-colors">
                Shrimati Setu
              </h1>
              <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SENTINEL
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-500 uppercase hidden xs:block">
              Guardian Console
            </p>
          </div>
        </div>

        {/* Right Navigation & Logout Actions */}
        {user && (
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setRoute('dashboard')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                currentRoute === 'dashboard'
                  ? 'bg-[#FF5F8A]/15 text-[#FF5F8A] border border-[#FF5F8A]/30 shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5F8A]" />
              <span className="inline">Overview</span>
            </button>

            <button
              onClick={() => setRoute('safe-zones')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                currentRoute === 'safe-zones'
                  ? 'bg-purple-100/80 text-purple-700 border border-purple-200 shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
              <span className="inline">Safe Zones</span>
            </button>

            <div className="h-4 sm:h-5 w-px bg-slate-300/60 mx-0.5 sm:mx-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all active:scale-95"
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
