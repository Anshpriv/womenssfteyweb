import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SafeZones from './pages/SafeZones';
import { Shield, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRoute, setRoute] = useState('dashboard'); // 'dashboard' | 'safe-zones'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03030A] flex flex-col items-center justify-center gap-4 text-slate-100 relative overflow-hidden">
        {/* Background Ambient Orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5F8A]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative p-5 rounded-full bg-gradient-to-br from-[#FF5F8A] to-purple-600 shadow-2xl shadow-[#FF5F8A]/40 z-10 animate-bounce">
          <Shield className="w-9 h-9 text-white" />
        </div>
        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-300 z-10 tracking-wide">
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5F8A]" />
          <span>Initializing Guardian Sentinel System...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03030A] text-slate-100 relative overflow-x-hidden selection:bg-[#FF5F8A] selection:text-white flex flex-col">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FF5F8A]/15 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[180px] pointer-events-none z-0 animate-pulse-slow" />
      <div className="fixed top-[40%] right-[15%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Header / Navbar */}
      <Navbar 
        currentRoute={currentRoute} 
        setRoute={setRoute} 
        user={user} 
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Login />
            </motion.div>
          ) : currentRoute === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard user={user} />
            </motion.div>
          ) : (
            <motion.div
              key="safe-zones"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <SafeZones user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-white/5 bg-[#070814]/80 backdrop-blur-2xl relative z-10 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wider text-slate-300">SHRIMATI SETU SENTINEL ENGINE v2.5</span>
          </div>
          <p>© {new Date().getFullYear()} Shrimati Setu Real-time Emergency SOS & Telemetry Console</p>
        </div>
      </footer>

    </div>
  );
}
