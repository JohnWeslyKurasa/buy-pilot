"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        const res = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password.");
        } else {
          onClose(); // Success
          window.location.reload(); // Quick way to sync session
        }
      } else {
        // Register
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "Something went wrong.");
        }

        // Auto login after register
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="font-bold text-lg text-foreground">
            {isLogin ? "Welcome Back" : "Create Account"}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    required 
                    placeholder="John Doe" 
                    className="pl-10 h-12 rounded-xl bg-muted/20"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-12 rounded-xl bg-muted/20"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({...p, email: e.target.value}))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 rounded-xl bg-muted/20"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({...p, password: e.target.value}))}
                />
              </div>
            </div>

            {error && <div className="text-sm text-red-500 font-medium">{error}</div>}

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base font-bold mt-2">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
