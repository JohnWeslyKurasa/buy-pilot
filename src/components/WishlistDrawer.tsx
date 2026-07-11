"use client";

import { useState, useEffect } from "react";
import { X, Heart, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedProduct {
  id: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  originalUrl: string;
  marketplace: string;
}

export function WishlistDrawer({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await fetch(`/api/wishlist?id=${id}`, { method: "DELETE" });
      setItems(items.filter(i => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex justify-end bg-black/60 backdrop-blur-sm transition-all">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <Heart className="w-5 h-5 fill-red-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">My Wishlist</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              Loading wishlist...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Heart className="w-16 h-16 text-border mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground text-sm max-w-[200px]">
                Save items you like by clicking the heart icon on any product.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-white shadow-sm group hover:border-primary/30 transition-all">
                <div className="w-20 h-20 shrink-0 bg-muted/20 rounded-xl flex items-center justify-center p-2">
                  <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      {item.marketplace} • {item.brand}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="font-bold text-base">₹{item.price.toLocaleString("en-IN")}</div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-red-500 rounded-full" onClick={() => removeProduct(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <a href={item.originalUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
