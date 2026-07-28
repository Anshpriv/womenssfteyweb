import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    } catch (err) {
      console.error("Login error:", err);
      let msg = "Failed to sign in. Check your credentials.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Invalid email or password.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "Please enter a valid email address.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center py-6">
      
      {/* Login Container */}
      <div className="relative w-full max-w-md">
        <div className="glass-panel p-8 sm:p-10 rounded-[36px] shadow-xl shadow-slate-200/50 relative z-10 border border-slate-200 backdrop-blur-3xl bg-white/90">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FF5F8A] to-purple-600 shadow-lg shadow-[#FF5F8A]/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-wide">
                  Shrimati Setu
                </h2>
                <Sparkles className="w-4 h-4 text-[#FF5F8A]" />
              </div>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Guardian Console
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Sign in to Guardian Console
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time emergency SOS protection & live telemetry monitoring console.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Guardian Email
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guardian@shrimatisetu.org"
                  required
                  className="w-full px-4 py-3.5 pl-11 rounded-2xl glass-input text-sm text-slate-900 placeholder-slate-400"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 pl-11 rounded-2xl glass-input text-sm text-slate-900 placeholder-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#FF5F8A] to-[#D63162] hover:opacity-90 active:scale-[0.99] shadow-xl shadow-[#FF5F8A]/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Launch Guardian Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
