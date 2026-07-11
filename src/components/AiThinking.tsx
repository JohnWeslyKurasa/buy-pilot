"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BrainCircuit, ShoppingCart, Activity, CheckCircle2 } from "lucide-react";

const steps = [
  { id: 1, text: "Understanding your request...", icon: BrainCircuit },
  { id: 2, text: "Searching Amazon & Flipkart...", icon: Search },
  { id: 3, text: "Comparing prices & reviews...", icon: Activity },
  { id: 4, text: "Finding the best deals...", icon: ShoppingCart },
  { id: 5, text: "Preparing recommendations...", icon: CheckCircle2 },
];

export function AiThinking() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col items-center justify-center min-h-[300px]">
      <div className="relative w-24 h-24 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-r-transparent"
        />
        <div className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center">
          <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>

      <div className="h-12 overflow-hidden relative w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-lg font-medium text-foreground absolute"
          >
            {(() => {
              const Icon = steps[currentStep].icon;
              return <Icon className="w-5 h-5 text-primary" />;
            })()}
            {steps[currentStep].text}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-64 h-1.5 bg-muted rounded-full mt-6 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
