import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SafeZones from './pages/SafeZones';
import { Shield, Loader2 } from 'lucide-react';

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
      <div className="min-h-screen bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-slate-800 relative overflow-hidden">
        <div className="relative p-4 rounded-full bg-gradient-to-br from-[#FF5F8A] to-purple-600 shadow-2xl shadow-[#FF5F8A]/30 z-10">
          <Shield className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5F8A]" />
          <span>Initializing Guardian Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 relative overflow-x-hidden selection:bg-[#FF5F8A] selection:text-white">
      
      {/* Navbar */}
      <Navbar 
        currentRoute={currentRoute} 
        setRoute={setRoute} 
        user={user} 
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {!user ? (
          <Login />
        ) : currentRoute === 'dashboard' ? (
          <Dashboard user={user} />
        ) : (
          <SafeZones user={user} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl relative z-10 text-center text-xs text-slate-500 font-medium">
        <p>Shrimati Setu &copy; {new Date().getFullYear()} Guardian Console &bull; Real-time Protection & Safety Platform</p>
      </footer>
    </div>
  );
}
