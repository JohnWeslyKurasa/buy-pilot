"use client";

import { motion } from "framer-motion";
import { Sparkles, Trophy, Wallet, ThumbsUp, AlertCircle, ArrowRight, Battery, Volume2, Headphones, Percent, Gamepad2, PhoneCall, Star, Sun, CheckCircle2 } from "lucide-react";
import { AiAnalysis } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const iconMap: Record<string, any> = {
  Trophy, Wallet, Percent, Battery, Volume2, Headphones, Gamepad2, PhoneCall, Sparkles, Star, Sun, ThumbsUp, CheckCircle2
};

export function AiSummary({ analysis }: { analysis: AiAnalysis }) {
  
  const renderCard = (rec: any, idx: number) => {
    const { title, iconType, colorClass, product } = rec;
    if (!product) return null;
    
    const Icon = iconMap[iconType] || Star;
    const bestOffer = product.offers.find((o: any) => o.price === product.lowestPrice) || product.offers[0];

    return (
      <Card key={idx} className="p-5 bg-white border-primary/10 shadow-sm flex flex-col hover:shadow-md transition-shadow">
        <div className={`flex items-center gap-2 font-bold mb-4 ${colorClass}`}>
          <Icon className="w-4 h-4" />
          {title}
        </div>
        <div className="flex items-start gap-4 flex-1">
          {product.image && product.image.startsWith('http') ? (
            <img src={product.image} alt={product.title} className="w-16 h-16 object-contain rounded-lg shrink-0 bg-muted/20 p-1" />
          ) : (
            <div className="w-16 h-16 rounded-lg shrink-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 flex flex-col items-center justify-center p-1 text-center overflow-hidden">
               <div className="font-bold text-[8px] text-indigo-900/40 truncate w-full">{product.brand}</div>
            </div>
          )}
          <div className="flex flex-col h-full w-full">
            <h4 className="font-semibold text-foreground text-sm line-clamp-2 mb-2">{product.title}</h4>
            <div className="mt-auto flex items-end justify-between w-full">
              <div>
                <p className="text-lg font-bold text-foreground leading-none">₹{product.lowestPrice.toLocaleString("en-IN")}</p>
                {bestOffer && <p className="text-xs text-muted-foreground mt-1">via {bestOffer.marketplace}</p>}
              </div>
              {bestOffer && (
                <a 
                  href={bestOffer.productUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-3 rounded-lg text-xs" })}
                >
                  Get <ArrowRight className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/5 to-secondary/30 border border-primary/20 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-primary" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">AI Buying Guide</h2>
        </div>

        <p className="text-base text-muted-foreground mb-8 max-w-4xl leading-relaxed">
          {analysis.summary}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {analysis.recommendations?.map((rec, idx) => renderCard(rec, idx))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/60 p-6 rounded-2xl border border-white/50 backdrop-blur-sm">
          <div>
            <h4 className="flex items-center gap-2 font-bold text-foreground mb-4">
              <ThumbsUp className="w-5 h-5 text-green-500" /> Key Advantages
            </h4>
            <ul className="space-y-3">
              {analysis.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-3 text-muted-foreground text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center gap-2 font-bold text-foreground mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" /> Things to Consider
            </h4>
            <ul className="space-y-3">
              {analysis.cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-3 text-muted-foreground text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
