"use client";

import { motion } from "framer-motion";
import { Star, ShoppingBag, ArrowRight, TrendingDown, Scale, CheckCircle2, Heart } from "lucide-react";
import { GroupedProduct } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function ProductResults({ 
  results, 
  onToggleCompare,
  compareIds 
}: { 
  results: GroupedProduct[]; 
  onToggleCompare: (id: string) => void;
  compareIds: string[];
}) {
  if (!results || results.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-foreground mb-3">No products found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We couldn't find this product in any connected shopping marketplace.
        </p>
        <div className="text-left bg-white p-6 rounded-xl border shadow-sm">
          <p className="font-semibold mb-3">Try:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
            <li>Different keywords</li>
            <li>Different spelling</li>
            <li>Another brand</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-foreground">All Results ({results.length})</h3>
      </div>
      
      <div className="flex flex-col gap-6">
        {results.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-xl bg-white group">
              <CardContent className="p-0 flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="w-full md:w-64 h-56 md:h-64 bg-white shrink-0 flex items-center justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r border-border/30 relative">
                  {product.badges.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {product.badges.map(b => (
                        <span key={b} className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider uppercase shadow-sm">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    <button 
                      onClick={() => onToggleCompare(product.id)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shadow-sm ${compareIds.includes(product.id) ? 'bg-primary border-primary text-white' : 'bg-white border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                      title="Compare"
                    >
                      {compareIds.includes(product.id) ? <CheckCircle2 className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                    </button>
                    <button 
                      className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors shadow-sm bg-white border-border text-muted-foreground hover:border-rose-500 hover:text-rose-500"
                      title="Keep / Save"
                      onClick={() => alert("Added to Saved Items!")}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full p-8 opacity-40 hover:opacity-80 transition-all">
                      {product.offers[0]?.marketplace === "Croma" && <img src="https://media.croma.com/image/upload/v1637733954/Croma%20Assets/UI%20Assets/croma_logo_light.svg" className="max-w-[120px]" alt="Croma" />}
                      {product.offers[0]?.marketplace === "Reliance Digital" && <img src="https://www.reliancedigital.in/build/client/images/loaders/rd_logo.svg" className="max-w-[120px]" alt="Reliance Digital" />}
                      {product.offers[0]?.marketplace === "Nykaa" && <img src="https://cdn.iconscout.com/icon/free/png-256/free-nykaa-3384013-2822953.png" className="max-w-[80px]" alt="Nykaa" />}
                      {product.offers[0]?.marketplace === "Meesho" && <img src="https://images.meesho.com/images/pow/play_icon.png" className="max-w-[80px]" alt="Meesho" />}
                      {!["Croma", "Reliance Digital", "Nykaa", "Meesho"].includes(product.offers[0]?.marketplace) && (
                        <span className="font-bold text-xl text-muted-foreground">{product.brand}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Details Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">{product.brand}</div>
                      <h3 className="font-bold text-lg text-foreground leading-tight">{product.title}</h3>
                    </div>
                    {product.rating && (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 shrink-0">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-amber-700 text-sm">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Aggregated Specs */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 mb-6 text-sm text-muted-foreground">
                    {product.batteryLife && <div><strong className="text-foreground">Battery:</strong> {product.batteryLife}</div>}
                    {product.anc && <div><strong className="text-foreground">ANC:</strong> Yes</div>}
                    {product.bluetoothVersion && <div><strong className="text-foreground">Bluetooth:</strong> {product.bluetoothVersion}</div>}
                  </div>
                  
                  <div className="mt-auto">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Compare Prices</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {product.offers.map((offer, oIdx) => {
                        const isLowest = offer.price === product.lowestPrice;
                        return (
                          <div key={oIdx} className={`rounded-xl border p-3 flex flex-col justify-between transition-colors ${isLowest ? 'border-green-500/50 bg-green-50/30' : 'border-border/50 bg-muted/20'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3 text-muted-foreground" />
                                {offer.marketplace}
                              </span>
                              {isLowest && <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-1.5 rounded-sm">Lowest</span>}
                            </div>
                            <div className="flex items-end justify-between">
                              <div>
                                <div className="font-bold text-lg text-foreground leading-none">
                                  {offer.price && offer.price > 0 ? `₹${offer.price.toLocaleString("en-IN")}` : "Check Site"}
                                </div>
                                {offer.originalPrice && offer.originalPrice > offer.price && (
                                  <div className="flex items-center gap-1 mt-1 text-xs">
                                    <span className="text-muted-foreground line-through">₹{offer.originalPrice?.toLocaleString("en-IN") || offer.originalPrice}</span>
                                    {offer.discount && <span className="text-green-600 font-bold flex items-center"><TrendingDown className="w-3 h-3 mr-0.5"/>{offer.discount}%</span>}
                                  </div>
                                )}
                              </div>
                              <a 
                                href={offer.productUrl || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={buttonVariants({ size: "sm", className: "rounded-lg text-xs" })}
                              >
                                View <ArrowRight className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
