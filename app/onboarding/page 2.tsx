"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { slideUpVariants, fadeVariants } from "@/lib/animations";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary/20">
      <div className="max-w-md w-full relative">
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-2 mb-12 justify-center"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </motion.div>

        <div className="h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-heading font-bold text-center">What's your monthly income?</h1>
                <p className="text-center text-muted-foreground">This helps us establish your baseline budget.</p>
                <div className="relative mt-8">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input type="number" placeholder="1,20,000" className="pl-10 h-14 text-lg bg-white/5 border-white/10 text-center" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-heading font-bold text-center">Fixed Expenses</h1>
                <p className="text-center text-muted-foreground">Enter your major recurring bills (Rent, EMIs, Utilities).</p>
                <div className="space-y-3 mt-8">
                  <Input placeholder="Rent: ₹25,000" className="h-12 bg-white/5 border-white/10" />
                  <Input placeholder="Car Loan: ₹12,000" className="h-12 bg-white/5 border-white/10" />
                  <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 hover:text-primary">
                    + Add Another
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎉</span>
                </div>
                <h1 className="text-3xl font-heading font-bold text-center">You're all set!</h1>
                <p className="text-muted-foreground">We've structured your initial plan. Let AI guide you from here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div variants={slideUpVariants} initial="hidden" animate="visible" className="mt-8 flex gap-4">
          {step > 1 && (
            <Button variant="outline" className="flex-1 h-12 bg-white/5 border-white/10" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button className="flex-[2] h-12 text-base" onClick={nextStep}>
            {step === 3 ? "Go to Dashboard" : "Continue"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
