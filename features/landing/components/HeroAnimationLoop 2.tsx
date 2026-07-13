"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Wallet, PieChart, ScanLine, BrainCircuit, Lightbulb } from "lucide-react";

const steps = [
  { id: 1, title: "Salary Received", icon: <Wallet className="w-6 h-6 text-emerald-400" />, amount: "+₹1,20,000", subtitle: "Bank Account" },
  { id: 2, title: "Monthly Plan Active", icon: <PieChart className="w-6 h-6 text-blue-400" />, amount: "₹65,000", subtitle: "Allocated Budget" },
  { id: 3, title: "Screenshot Uploaded", icon: <ScanLine className="w-6 h-6 text-purple-400" />, amount: "-₹3,200", subtitle: "Unknown Expense" },
  { id: 4, title: "AI Categorization", icon: <BrainCircuit className="w-6 h-6 text-amber-400" />, amount: "Dining", subtitle: "Paradise Biryani" },
  { id: 5, title: "Smart Insight", icon: <Lightbulb className="w-6 h-6 text-emerald-400" />, amount: "Invest Surplus", subtitle: "₹12,000 Remaining" },
];

export function HeroAnimationLoop() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md h-[400px] flex items-center justify-center mx-auto">
      {/* Decorative blurred background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px]" />
      
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="w-full relative z-10"
        >
          <Card className="p-6 bg-card/60 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                {steps[currentStep].icon}
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground">
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].subtitle}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Result</span>
              <span className="font-mono text-lg font-bold text-foreground">
                {steps[currentStep].amount}
              </span>
            </div>
            
            {/* Minimal Progress Bar */}
            <div className="w-full h-1 bg-white/5 mt-6 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "linear" }}
                className="h-full bg-primary"
              />
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
