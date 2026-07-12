"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VisualSearchModal } from "./VisualSearchModal";

const examples = [
  "Running shoes under ₹3000",
  "Gaming laptop under ₹80000",
  "Baby stroller",
  "Wireless headphones",
  "Wedding dress",
  "Coffee maker",
];

export function SearchHero({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pt-20 pb-32 flex flex-col items-center justify-center text-center">
      {/* Decorative gradient blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
          Find the Best Product <br className="hidden md:block" />
          <span className="text-primary bg-clip-text">in Seconds.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Ask. Compare. Buy Smarter. One search. Every marketplace. AI recommendations.
        </p>

        <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 -z-10" />
          <div className="relative flex items-center bg-white border border-border shadow-lg shadow-black/5 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-shadow">
            <div className="pl-6 text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for today?"
              className="flex-1 border-0 focus-visible:ring-0 text-lg md:text-xl h-16 md:h-20 px-4 bg-transparent shadow-none"
            />
            <div className="pr-1 flex items-center">
              <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary mr-1" onClick={() => setShowScanner(true)} title="Scan Barcode">
                <Camera className="w-6 h-6" />
              </Button>
              <Button type="submit" size="lg" className="h-12 md:h-14 rounded-xl px-6 md:px-8 text-base font-semibold shadow-md">
                Search
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-10">
          <p className="text-sm text-muted-foreground mb-4 font-medium">Try asking:</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {examples.map((example, idx) => (
              <motion.button
                key={example}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                onClick={() => {
                  setQuery(example);
                  onSearch(example);
                }}
                className="px-4 py-2 bg-white border border-border rounded-full text-sm font-medium text-foreground hover:border-primary hover:text-primary hover:shadow-sm transition-all"
              >
                {example}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
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
