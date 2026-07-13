"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { mockMonthlyPlan, mockTransactions } from "@/lib/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function MonthlyPlanPage() {
  const categories = Object.keys(mockMonthlyPlan.allocated) as (keyof typeof mockMonthlyPlan.allocated)[];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Monthly Plan" 
        description="Allocate your budget and track spending per category."
      />

      <Tabs defaultValue="overview" className="w-full mb-8">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((cat, i) => {
              const allocated = mockMonthlyPlan.allocated[cat];
              const spent = mockMonthlyPlan.spent[cat];
              const percentage = Math.round((spent / allocated) * 100);
              const isOver = spent > allocated;

              return (
                <motion.div key={cat} variants={slideUpVariants} custom={i}>
                  <Card className="p-6 bg-card/40 border-white/10 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="capitalize font-semibold text-lg">{cat}</h4>
                      <span className="text-sm font-mono text-muted-foreground">₹{spent.toLocaleString()} / ₹{allocated.toLocaleString()}</span>
                    </div>
                    <Progress value={percentage > 100 ? 100 : percentage} className={`h-2 bg-white/5 mb-2 [&>div]:${isOver ? 'bg-destructive' : 'bg-primary'}`} />
                    <p className={`text-xs ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {isOver ? `Over budget by ₹${(spent - allocated).toLocaleString()}` : `${100 - percentage}% remaining`}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <motion.div variants={slideUpVariants}>
            <Card className="bg-card/40 border-white/10 overflow-hidden">
              <div className="divide-y divide-white/5">
                {mockTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <p className="font-medium">{tx.merchant}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted-foreground hidden sm:block">{tx.category}</span>
                      <p className="font-mono font-medium text-destructive w-20 text-right">-₹{tx.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
