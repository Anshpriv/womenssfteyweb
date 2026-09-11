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
    <header className="fixed inset-x-0 top-3 sm:top-4 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2 rounded-full border border-pink-200/70 bg-white/55 backdrop-blur-2xl shadow-lg shadow-pink-200/30 transition-all pointer-events-auto">
        
        {/* Brand Header */}
        <div 
          onClick={() => setRoute('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-[#FF5F8A] via-pink-600 to-rose-500 shadow-lg shadow-[#FF5F8A]/30 group-hover:scale-105 group-hover:shadow-[#FF5F8A]/50 transition-all duration-300">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center">
              <h1 className="text-base sm:text-lg font-extrabold tracking-wide text-white group-hover:text-pink-200 transition-colors">
                Shrimati Setu
              </h1>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase hidden xs:block">
              Guardian Emergency Console
            </p>
          </div>
        </div>

        {/* Navigation & Logout Actions */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Overview Tab */}
            <button
              onClick={() => setRoute('dashboard')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                currentRoute === 'dashboard'
                  ? 'bg-gradient-to-r from-[#FF5F8A] to-rose-500 text-white shadow-lg shadow-[#FF5F8A]/25 border border-white/20'
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
                  ? 'bg-gradient-to-r from-rose-500 to-[#FF5F8A] text-white shadow-lg shadow-rose-500/25 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Navigation className={`w-4 h-4 ${currentRoute === 'safe-zones' ? 'text-white' : 'text-pink-500'}`} />
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
