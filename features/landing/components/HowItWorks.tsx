"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { fadeVariants, slideUpVariants } from "@/lib/animations";
import { NotebookPen, ScanSearch, TrendingUp } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Plan",
    description: "Build your monthly financial structure once. Allocate your budget towards essentials, savings, and investments effortlessly.",
    icon: <NotebookPen className="w-8 h-8 text-primary" />,
  },
  {
    id: "02",
    title: "Track",
    description: "Take a quick screenshot of your payment. Our AI engine instantly reads the merchant, amount, and updates your budget.",
    icon: <ScanSearch className="w-8 h-8 text-blue-400" />,
  },
  {
    id: "03",
    title: "Improve",
    description: "Receive smart, contextual recommendations tailored to your spending habits to help you save and invest better every month.",
    icon: <TrendingUp className="w-8 h-8 text-purple-400" />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="text-center mb-16"
        >
          <motion.h2 variants={slideUpVariants} className="text-3xl md:text-5xl font-heading font-bold mb-4">
            How FinPilot Works
          </motion.h2>
          <motion.p variants={fadeVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to transform the way you manage your money. Minimal manual entry, maximum intelligence.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideUpVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-8 h-full bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-6xl font-heading font-bold opacity-5 group-hover:opacity-10 transition-opacity">
                  {step.id}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
