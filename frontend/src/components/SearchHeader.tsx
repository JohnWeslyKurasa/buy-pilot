"use client";

import { useState } from "react";
import { Search, Mic, Camera, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisualSearchModal } from "./VisualSearchModal";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "./AuthModal";
import { WishlistDrawer } from "./WishlistDrawer";

export function SearchHeader({ initialQuery = "", onSearch }: { initialQuery?: string, onSearch: (q: string) => void }) {
  const [query, setQuery] = useState(initialQuery);
  const [showScanner, setShowScanner] = useState(false);
  const { user: session, logout: signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const chips = ["All", "Shopping", "Images", "Videos", "News", "Short Videos", "Nearby", "Brands", "Price", "Rating", "Offers", "Availability"];

  return (
    <div className="w-full bg-white border-b border-border shadow-sm sticky top-0 z-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6">
        {/* Logo */}
        <div 
          className="font-bold text-2xl tracking-tight text-primary flex items-center gap-2 cursor-pointer mb-2 md:mb-0"
          onClick={() => window.location.href = "/"}
        >
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20">
            BP
          </div>
          <span className="hidden md:inline">Buy Pilot</span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 w-full max-w-3xl relative">
          <div className="flex items-center w-full bg-white border border-border/80 hover:border-primary/50 shadow-sm rounded-full px-4 py-2 transition-all focus-within:shadow-md focus-within:border-primary">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 outline-none text-foreground bg-transparent text-base"
            />
            <div className="flex items-center gap-2 text-muted-foreground ml-2">
              <Mic className="w-5 h-5 cursor-pointer hover:text-primary transition-colors hidden sm:block" />
              <button type="button" onClick={() => setShowScanner(true)} title="Scan Barcode" className="flex items-center justify-center p-1 rounded-full hover:bg-muted transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </button>
              <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
              <button type="submit" className="text-primary hover:text-primary/80 transition-colors p-1">
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>

        {/* User Profile */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <button 
                onClick={() => setShowWishlist(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="My Wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {session.name?.[0]?.toUpperCase() || session.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <div className="px-4 py-2 border-b border-border/50 text-sm">
                    <p className="font-semibold text-foreground truncate">{session.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{session.email}</p>
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
              Sign In
            </Button>
          )}
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showWishlist && <WishlistDrawer onClose={() => setShowWishlist(false)} />}
      {showScanner && (
        <VisualSearchModal 
          onClose={() => setShowScanner(false)} 
          onSearch={(text) => {
            setShowScanner(false);
            setQuery(text);
            onSearch(text);
          }} 
        />
      )}
    </div>
  );
}
