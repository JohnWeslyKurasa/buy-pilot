"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Lock, User, Loader2, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, API_URL } from "@/context/AuthContext";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Invalid email or password.");
        }
        login(data.token);
        onClose();
      } else {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong during registration.");
        }
        
        login(data.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-violet-600/30 via-purple-600/20 to-fuchsia-600/30 rounded-full blur-[100px] pointer-events-none opacity-80" />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-6 duration-300">
        
        {/* Top glowing accent border */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl tracking-tight text-white">
                Buy Pilot
              </h2>
              <p className="text-xs font-medium text-slate-400">
                {isLogin ? "Welcome back to your AI shopping assistant" : "Join thousands of smart shoppers"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle Switch */}
        <div className="px-8 pt-2 pb-4">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                isLogin 
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                !isLogin 
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 pb-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <Input 
                    required 
                    placeholder="John Doe" 
                    className="pl-10 h-12 rounded-xl border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <Input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-12 rounded-xl border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({...p, email: e.target.value}))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-slate-300 block">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 rounded-xl border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({...p, password: e.target.value}))}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 rounded-xl text-sm font-bold mt-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {isLogin ? "Sign In to Buy Pilot" : "Create Free Account"}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-violet-400 font-bold hover:text-violet-300 hover:underline transition-colors"
            >
              {isLogin ? "Sign up now" : "Sign in here"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
