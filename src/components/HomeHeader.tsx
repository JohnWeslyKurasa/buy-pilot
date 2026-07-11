"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { AuthModal } from "./AuthModal";
import { WishlistDrawer } from "./WishlistDrawer";

export function HomeHeader() {
  const { data: session } = useSession();
  const [showAuth, setShowAuth] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  return (
    <header className="w-full h-16 border-b border-border/40 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="font-bold text-xl tracking-tight text-primary flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">BP</div>
        Buy Pilot
      </div>
      
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <button 
              onClick={() => setShowWishlist(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            <div className="relative group cursor-pointer z-50">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                <div className="px-4 py-2 border-b border-border/50 text-sm">
                  <p className="font-semibold text-foreground truncate">{session.user?.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{session.user?.email}</p>
                </div>
                <button onClick={() => setShowWishlist(true)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Wishlist
                </button>
                <button onClick={() => signOut()} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <Button onClick={() => setShowAuth(true)} className="rounded-full px-6 font-semibold shadow-sm">
            Sign In / Sign Up
          </Button>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showWishlist && <WishlistDrawer onClose={() => setShowWishlist(false)} />}
    </header>
  );
}
