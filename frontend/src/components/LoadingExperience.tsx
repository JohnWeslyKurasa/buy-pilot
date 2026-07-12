"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Search, ShoppingCart, Zap, CheckCircle2 } from "lucide-react";

export function LoadingExperience({ isSearching, query }: { isSearching: boolean; query: string }) {
  const steps = [
    { text: "Understanding your request...", icon: Bot },
    { text: "Searching Amazon & Flipkart...", icon: ShoppingCart },
    { text: "Searching Myntra & Ajio...", icon: ShoppingCart },
    { text: "Searching Croma & Reliance Digital...", icon: ShoppingCart },
    { text: "Searching Nykaa & Meesho...", icon: ShoppingCart },
    { text: "Comparing prices across all 8 marketplaces...", icon: Search },
    { text: "Reading reviews...", icon: CheckCircle2 },
    { text: "Generating AI recommendations...", icon: Zap }
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isSearching) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500); // Progress every 1.5s

    return () => clearInterval(interval);
  }, [isSearching, steps.length]);

  if (!isSearching) return null;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-20 px-4 min-h-[50vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-border/50 shadow-xl rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-foreground">
            Analyzing <span className="text-primary">"{query}"</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Our AI is fetching real-time data...</p>
        </div>

        <div className="space-y-6 relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-muted"></div>
          <AnimatePresence>
            {steps.slice(0, currentStep + 1).map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 relative z-10"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${isPast ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-500 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.text}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
