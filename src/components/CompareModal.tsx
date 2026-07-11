"use client";

import { X, Trophy, Star } from "lucide-react";
import { GroupedProduct } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export function CompareModal({ 
  products, 
  onClose,
  onRemove
}: { 
  products: GroupedProduct[]; 
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  if (products.length === 0) return null;

  // Compute Winners
  const lowestPriceVal = Math.min(...products.map(p => p.lowestPrice));
  const highestRatingVal = Math.max(...products.map(p => parseFloat(p.rating || "0")));

  const specs = [
    { label: "Price", key: "lowestPrice", format: (v: number) => `₹${v.toLocaleString("en-IN")}` },
    { label: "Rating", key: "rating", format: (v: string) => `${v} ★` },
    { label: "Brand", key: "brand" },
    { label: "Total Offers", key: "offers", format: (v: any[]) => `${v.length} Store${v.length > 1 ? 's' : ''}` },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="bg-background/90 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] w-full max-w-7xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-border/30 bg-gradient-to-r from-background to-muted/20 relative z-10">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Head-to-Head Comparison
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Analyzing {products.length} product{products.length > 1 ? 's' : ''} exactly</p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 overflow-x-auto relative scrollbar-hide">
            <div className="min-w-max pb-8">
              {/* Product Cards Row */}
              <div className="flex gap-6 mb-12">
                <div className="w-48 shrink-0"></div>
                {products.map(p => {
                  const isPriceWinner = p.lowestPrice === lowestPriceVal;
                  return (
                    <div key={p.id} className="w-72 shrink-0 flex flex-col relative group">
                      <button 
                        onClick={() => onRemove(p.id)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-background border shadow-md text-muted-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all z-20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className={`w-full h-56 bg-white border-2 rounded-3xl p-6 flex items-center justify-center mb-6 relative overflow-hidden transition-all ${isPriceWinner ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)]' : 'border-border/40'}`}>
                        {isPriceWinner && (
                          <div className="absolute top-0 inset-x-0 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 text-center z-10">
                            Best Value
                          </div>
                        )}
                        {p.image && p.image.startsWith('http') ? (
                          <img 
                            src={p.image} 
                            alt={p.title} 
                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 relative z-0" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex flex-col items-center justify-center p-4 text-center">
                             <div className="font-bold text-indigo-900/40 text-lg mb-1">{p.brand}</div>
                             <div className="text-xs text-indigo-900/30 font-medium line-clamp-3">{p.title}</div>
                          </div>
                        )}
                      </div>
                      <div className="px-2">
                        <h3 className="font-bold text-foreground text-base line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                        <div className="flex items-center gap-3">
                          <div className={`font-black text-2xl tracking-tight ${isPriceWinner ? 'text-green-600' : 'text-foreground'}`}>
                            ₹{p.lowestPrice.toLocaleString("en-IN")}
                          </div>
                          {isPriceWinner && <Trophy className="w-5 h-5 text-green-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Specs Rows */}
              <div className="space-y-6">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex gap-6 items-center p-4 rounded-2xl hover:bg-muted/30 transition-colors group">
                    <div className="w-48 shrink-0 font-semibold text-muted-foreground/70 uppercase tracking-widest text-xs flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary/20 rounded-full group-hover:bg-primary transition-colors"></div>
                      {spec.label}
                    </div>
                    {products.map(p => {
                      const val = (p as any)[spec.key];
                      const displayVal = spec.format && val !== undefined ? spec.format(val) : (val || "N/A");
                      
                      const isRatingWinner = spec.key === "rating" && parseFloat(val || "0") === highestRatingVal && highestRatingVal > 0;
                      const isPriceWinner = spec.key === "lowestPrice" && val === lowestPriceVal;
                      
                      return (
                        <div key={p.id} className="w-72 shrink-0 px-2 flex flex-col justify-center">
                          <div className={`text-base font-bold flex items-center gap-2
                            ${isRatingWinner ? 'text-amber-500' : ''}
                            ${isPriceWinner ? 'text-green-600' : ''}
                            ${!isRatingWinner && !isPriceWinner ? 'text-foreground/90' : ''}
                          `}>
                            {displayVal}
                            {isRatingWinner && <Star className="w-4 h-4 fill-amber-500" />}
                          </div>
                          
                          {/* Visual Bar for Rating */}
                          {spec.key === "rating" && val && (
                            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isRatingWinner ? 'bg-amber-500' : 'bg-primary/40'}`} 
                                style={{ width: `${(parseFloat(val) / 5) * 100}%` }}
                              />
                            </div>
                          )}
                          {/* Visual Bar for Price (Inverted, lower is better) */}
                          {spec.key === "lowestPrice" && (
                            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden flex justify-end">
                              <div 
                                className={`h-full rounded-full ${isPriceWinner ? 'bg-green-500' : 'bg-primary/20'}`} 
                                style={{ width: `${(lowestPriceVal / val) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
