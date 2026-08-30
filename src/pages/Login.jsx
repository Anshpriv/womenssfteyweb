import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles, Activity } from 'lucide-react';
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
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center py-10">
      
      {/* Background Glowing Rings */}
      <div className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-[#FF5F8A]/20 to-purple-600/20 rounded-full blur-[90px] pointer-events-none animate-pulse-slow" />

      {/* Login Container */}
      <div className="relative w-full max-w-md">
        <div className="glass-panel p-8 sm:p-10 rounded-[32px] shadow-2xl relative z-10 border border-white/10 backdrop-blur-3xl bg-[#090A18]/85 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FF5F8A] via-pink-600 to-purple-600 shadow-xl shadow-[#FF5F8A]/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-wide">
                  Shrimati Setu
                </h2>
                <Sparkles className="w-4 h-4 text-[#FF5F8A]" />
              </div>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Guardian Emergency Console
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              Sign in to Sentinel Access
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Access real-time emergency SOS dispatch, live satellite GPS telemetry & encrypted media vault.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Guardian Account Email
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guardian@shrimatisetu.org"
                  required
                  className="w-full px-4 py-3.5 pl-11 rounded-2xl glass-input text-sm text-white placeholder-slate-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-4 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Security Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 pl-11 rounded-2xl glass-input text-sm text-white placeholder-slate-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-4 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#FF5F8A] via-pink-600 to-purple-600 hover:opacity-95 active:scale-[0.99] shadow-xl shadow-[#FF5F8A]/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 border border-white/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Launch Sentinel Console</span>
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
