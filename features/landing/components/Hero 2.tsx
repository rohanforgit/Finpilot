"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { slideUpVariants, fadeVariants } from "@/lib/animations";
import { HeroAnimationLoop } from "./HeroAnimationLoop";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      
      <div className="max-w-[1280px] mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="max-w-2xl"
        >
          <motion.div variants={fadeVariants} className="inline-block mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-sm font-medium text-primary flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              FinPilot Phase 1 Complete
            </span>
          </motion.div>
          
          <motion.h1 variants={slideUpVariants} className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1] mb-6">
            Plan Once.<br />
            <span className="text-muted-foreground">Track Effortlessly.</span><br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-300">
              Let AI Guide Every Month.
            </span>
          </motion.h1>
          
          <motion.p variants={slideUpVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
            Create your monthly financial plan once. Upload your daily expenses using screenshots. Let AI organize everything and recommend smarter financial decisions.
          </motion.p>
          
          <motion.div variants={slideUpVariants} className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105">
              Start Planning
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-md transition-transform hover:scale-105">
              <Play className="w-4 h-4 mr-2" />
              Watch Interactive Demo
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full flex justify-center lg:justify-end"
        >
          <HeroAnimationLoop />
        </motion.div>
      </div>
    </section>
  );
}
