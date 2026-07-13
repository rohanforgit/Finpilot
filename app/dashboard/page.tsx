"use client";

import { motion } from "framer-motion";
import { fadeVariants, slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { mockMonthlyPlan, mockTransactions, mockRecommendations } from "@/lib/mockData";
import { Lightbulb, ArrowRight, Wallet, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const remaining = mockMonthlyPlan.income - Object.values(mockMonthlyPlan.spent).reduce((a, b) => a + b, 0);
  const progress = Math.round((remaining / mockMonthlyPlan.income) * 100);

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Financial Snapshot" 
        description={`Here is your overview for ${mockMonthlyPlan.month} ${mockMonthlyPlan.year}.`}
        actions={
          <Link href="/dashboard/upload">
            <Button className="rounded-full shadow-lg shadow-primary/20">
              Upload Receipt
            </Button>
          </Link>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={slideUpVariants} className="lg:col-span-2">
          <Card className="p-8 bg-card/40 backdrop-blur-md border-white/10 h-full flex flex-col justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Remaining Money</p>
              <h3 className="text-5xl md:text-6xl font-mono font-bold tracking-tight text-foreground flex items-baseline">
                <AnimatedCounter value={remaining} prefix="₹" />
                <span className="text-lg text-muted-foreground font-sans font-normal ml-2">/ ₹{mockMonthlyPlan.income.toLocaleString()}</span>
              </h3>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Month Progress</span>
                <span className="font-medium text-primary">{100 - progress}% Spent</span>
              </div>
              <Progress value={100 - progress} className="h-2 bg-white/5" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={slideUpVariants} className="space-y-6">
          <Card className="p-6 bg-primary/10 border-primary/20 relative overflow-hidden group hover:bg-primary/20 transition-colors">
            <Lightbulb className="w-6 h-6 text-primary mb-4" />
            <h4 className="font-semibold text-primary mb-2">Smart Insight</h4>
            <p className="text-sm text-primary/80 leading-relaxed mb-4">
              {mockRecommendations[0].description}
            </p>
            <Link href="/dashboard/recommendations" className="text-xs font-bold text-primary flex items-center group-hover:underline">
              {mockRecommendations[0].action} <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Card>

          <Card className="p-6 bg-card/40 border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <p className="text-2xl font-mono font-bold">24%</p>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={slideUpVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-heading font-semibold">Recent Transactions</h3>
          <Link href="/dashboard/plan" className="text-sm text-muted-foreground hover:text-foreground hover:underline">View All</Link>
        </div>
        <Card className="bg-card/40 border-white/10 overflow-hidden backdrop-blur-sm">
          <div className="divide-y divide-white/5">
            {mockTransactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{tx.merchant}</p>
                    <p className="text-xs text-muted-foreground">{tx.date} • {tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium text-destructive">-₹{tx.amount.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground opacity-60">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
