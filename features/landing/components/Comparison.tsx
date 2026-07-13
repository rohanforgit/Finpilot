"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { slideUpVariants, fadeVariants } from "@/lib/animations";
import { Check, X } from "lucide-react";

export function Comparison() {
  return (
    <section className="py-24 relative overflow-hidden bg-white/[0.02]">
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
            Why FinPilot?
          </motion.h2>
          <motion.p variants={fadeVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how FinPilot bridges the gap between total control and automated convenience.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <Card className="p-8 h-full bg-white/5 border-white/10 opacity-70">
              <h3 className="text-2xl font-bold mb-6 text-center text-muted-foreground">Excel</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-sm">Complete control</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-sm">High flexibility</span></li>
                <li className="flex items-center gap-3 text-muted-foreground"><X className="w-5 h-5 text-red-400 shrink-0" /> <span className="text-sm">Completely manual</span></li>
                <li className="flex items-center gap-3 text-muted-foreground"><X className="w-5 h-5 text-red-400 shrink-0" /> <span className="text-sm">No intelligent insights</span></li>
                <li className="flex items-center gap-3 text-muted-foreground"><X className="w-5 h-5 text-red-400 shrink-0" /> <span className="text-sm">Time consuming</span></li>
              </ul>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Card className="p-8 h-full bg-primary/10 border-primary/30 relative transform md:-translate-y-4 shadow-2xl shadow-primary/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
              <h3 className="text-3xl font-heading font-bold mb-6 text-center text-foreground flex items-center justify-center gap-2">
                FinPilot
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> <span className="text-sm font-medium">AI Expense Categorization</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> <span className="text-sm font-medium">Smart Financial Recommendations</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> <span className="text-sm font-medium">Effortless Monthly Planning</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> <span className="text-sm font-medium">Annual Savings Buckets</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> <span className="text-sm font-medium">Premium Apple-like UI</span></li>
              </ul>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <Card className="p-8 h-full bg-white/5 border-white/10 opacity-70">
              <h3 className="text-2xl font-bold mb-6 text-center text-muted-foreground">Finance Apps</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-sm">Nice dashboards</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-sm">Expense tracking</span></li>
                <li className="flex items-center gap-3 text-muted-foreground"><X className="w-5 h-5 text-red-400 shrink-0" /> <span className="text-sm">Too complicated</span></li>
                <li className="flex items-center gap-3 text-muted-foreground"><X className="w-5 h-5 text-red-400 shrink-0" /> <span className="text-sm">Focuses only on the past</span></li>
                <li className="flex items-center gap-3 text-muted-foreground"><X className="w-5 h-5 text-red-400 shrink-0" /> <span className="text-sm">No structured planning</span></li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
