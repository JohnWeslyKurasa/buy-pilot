"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, API_URL } from "@/context/AuthContext";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

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
        
        if (!res.ok) throw new Error("Invalid email or password.");
        const data = await res.json();
        login(data.token);
        onClose();
      } else {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "Something went wrong.");
        }
        
        const data = await res.json();
        login(data.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-violet-600/30 via-fuchsia-600/10 to-pink-600/30 rounded-full blur-[80px] pointer-events-none opacity-80" />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* Top glowing bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
              {isLogin ? "Welcome Back" : "Get Started"}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full border border-white/5 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-8 pt-4">
          <p className="text-neutral-400 text-sm mb-6">
            {isLogin 
              ? "Access your dashboard, save items to your wishlist, and track price changes." 
              : "Create an account to start scanning products, comparing prices, and getting AI insights."
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-violet-400 transition-colors" />
                  <Input 
                    required 
                    placeholder="John Doe" 
                    className="pl-11 h-13 rounded-2xl border-white/5 bg-white/5 text-white placeholder-neutral-500 focus:border-violet-500 focus:ring-violet-500/20 focus:bg-white/10 transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-violet-400 transition-colors" />
                <Input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-11 h-13 rounded-2xl border-white/5 bg-white/5 text-white placeholder-neutral-500 focus:border-violet-500 focus:ring-violet-500/20 focus:bg-white/10 transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({...p, email: e.target.value}))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs font-medium text-violet-400 hover:text-violet-300 hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-violet-400 transition-colors" />
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-11 h-13 rounded-2xl border-white/5 bg-white/5 text-white placeholder-neutral-500 focus:border-violet-500 focus:ring-violet-500/20 focus:bg-white/10 transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({...p, password: e.target.value}))}
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-400 font-medium">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-13 rounded-2xl text-base font-bold mt-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  {isLogin ? "Sign In" : "Sign Up"}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-neutral-400">
            {isLogin ? "New to Buy Pilot?" : "Already have an account?"}{" "}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-violet-400 font-extrabold hover:text-violet-300 hover:underline transition-colors"
            >
              {isLogin ? "Create an account" : "Sign in here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
