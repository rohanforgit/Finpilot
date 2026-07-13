"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { slideUpVariants, fadeVariants } from "@/lib/animations";
import { WalletCards, Brain, History, Camera, PieChart, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Monthly Financial Planning",
    description: "Set up your income, recurring expenses, and investments once. We handle the rest every month.",
    icon: <WalletCards className="w-6 h-6 text-primary" />
  },
  {
    title: "AI Recommendations",
    description: "Receive actionable insights on how to optimize your spending and increase your savings.",
    icon: <Brain className="w-6 h-6 text-purple-400" />
  },
  {
    title: "OCR Expense Upload",
    description: "Simply upload a screenshot of your digital payment. AI extracts the merchant, amount, and category instantly.",
    icon: <Camera className="w-6 h-6 text-blue-400" />
  },
  {
    title: "Annual Savings Buckets",
    description: "Turn large yearly expenses into small monthly savings goals. Never be caught off guard again.",
    icon: <PieChart className="w-6 h-6 text-emerald-400" />
  },
  {
    title: "Financial Memory",
    description: "The AI remembers your merchant preferences and categorization rules, making it smarter over time.",
    icon: <History className="w-6 h-6 text-amber-400" />
  },
  {
    title: "Privacy First",
    description: "No bank integrations. No transaction syncing. You remain in complete control of your financial data.",
    icon: <ShieldCheck className="w-6 h-6 text-slate-300" />
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
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
            Everything You Need.
          </motion.h2>
          <motion.p variants={fadeVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive suite of tools designed to make managing money intuitive, fast, and remarkably simple.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideUpVariants}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group overflow-hidden relative">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-primary to-transparent blur-2xl -z-10" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
