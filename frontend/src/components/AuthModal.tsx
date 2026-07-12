"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Lock, User, Loader2, Sparkles } from "lucide-react";
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
    // Lock scroll when modal is open
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

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Soft decorative background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-violet-200/50 via-fuchsia-100/30 to-pink-200/50 rounded-full blur-[80px] pointer-events-none opacity-90" />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        {/* Top subtle glowing bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent" />

        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-700">
              {isLogin ? "Welcome Back" : "Get Started"}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full border border-neutral-200 bg-white/50 text-neutral-500 hover:text-neutral-800 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-8 pt-4">
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            {isLogin 
              ? "Access your dashboard, save items to your wishlist, and track price changes." 
              : "Create an account to start scanning products, comparing prices, and getting AI insights."
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-violet-600 transition-colors" />
                  <Input 
                    required 
                    placeholder="John Doe" 
                    className="pl-11 h-13 rounded-2xl border-neutral-200/80 bg-white text-neutral-800 placeholder-neutral-400 focus:border-violet-500 focus:ring-violet-200/50 transition-all duration-200 shadow-sm"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-violet-600 transition-colors" />
                <Input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-11 h-13 rounded-2xl border-neutral-200/80 bg-white text-neutral-800 placeholder-neutral-400 focus:border-violet-500 focus:ring-violet-200/50 transition-all duration-200 shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({...p, email: e.target.value}))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs font-semibold text-violet-600 hover:text-violet-500 hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-violet-600 transition-colors" />
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-11 h-13 rounded-2xl border-neutral-200/80 bg-white text-neutral-800 placeholder-neutral-400 focus:border-violet-500 focus:ring-violet-200/50 transition-all duration-200 shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({...p, password: e.target.value}))}
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-13 rounded-2xl text-base font-bold mt-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
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

          <div className="mt-8 text-center text-sm text-neutral-500">
            {isLogin ? "New to Buy Pilot?" : "Already have an account?"}{" "}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-violet-600 font-extrabold hover:text-violet-500 hover:underline transition-colors"
            >
              {isLogin ? "Create an account" : "Sign in here"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
