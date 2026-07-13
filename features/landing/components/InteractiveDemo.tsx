"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { slideUpVariants, fadeVariants } from "@/lib/animations";
import { Lightbulb, Info, PiggyBank, Target } from "lucide-react";

export function InteractiveDemo() {
  return (
    <section id="demo" className="py-24 relative overflow-hidden bg-white/[0.02]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="text-center mb-16"
        >
          <motion.h2 variants={slideUpVariants} className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Interactive Financial Snapshot
          </motion.h2>
          <motion.p variants={fadeVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the calm of a perfectly organized financial dashboard. Everything you need, nothing you don't.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-8 bg-[#111113]/80 backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Left Column: Remaining & Insights */}
              <div className="space-y-8">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Remaining Money</p>
                  <h3 className="text-5xl font-mono font-bold tracking-tight text-foreground flex items-baseline">
                    <AnimatedCounter value={24500} prefix="₹" />
                    <span className="text-lg text-muted-foreground font-sans font-normal ml-2">/ ₹1,20,000</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Month Progress</span>
                    <span className="font-medium text-primary">68%</span>
                  </div>
                  <Progress value={68} className="h-2 bg-white/5" />
                  <p className="text-xs text-muted-foreground">You are spending 12% less than last month. Keep it up!</p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex gap-4 items-start">
                  <Lightbulb className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Smart Insight</h4>
                    <p className="text-sm text-primary/80 leading-relaxed">
                      You have maintained a ₹20,000 surplus for three months. Consider increasing your Mutual Fund SIP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Savings Buckets & Actions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-purple-400" /> Savings Buckets
                  </h4>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Vacation Fund</span>
                      <span className="text-sm font-mono">₹45,000 / ₹80,000</span>
                    </div>
                    <Progress value={56} className="h-1.5 bg-white/5 [&>div]:bg-purple-400" />
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Car Insurance</span>
                      <span className="text-sm font-mono">₹8,000 / ₹12,000</span>
                    </div>
                    <Progress value={66} className="h-1.5 bg-white/5 [&>div]:bg-blue-400" />
                  </div>
                </div>

                <motion.div 
                  className="mt-6 p-4 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Target className="w-5 h-5" />
                  <span className="font-medium">View All Recommendations</span>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
