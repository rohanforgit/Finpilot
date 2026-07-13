"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useMonthlyPlan } from "@/features/dashboard/hooks/useMonthlyPlan";
import { useTransactions } from "@/features/dashboard/hooks/useTransactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/EmptyState";
import { PieChart, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Category } from "@/types/database";

export default function MonthlyPlanPage() {
  const { plan, isLoading: planLoading, updatePlan, isUpdating } = useMonthlyPlan();
  const { data: transactions, isLoading: txsLoading } = useTransactions(100);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    essentials: "0",
    investments: "0",
    savings: "0",
    lifestyle: "0",
  });

  useEffect(() => {
    if (plan) {
      setEditValues({
        essentials: String(plan.allocated_essentials || 0),
        investments: String(plan.allocated_investments || 0),
        savings: String(plan.allocated_savings || 0),
        lifestyle: String(plan.allocated_lifestyle || 0),
      });
    }
  }, [plan]);

  const isLoading = planLoading || txsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-12 bg-white/5 rounded-lg w-1/4" />
        <div className="h-10 bg-white/5 rounded-lg w-1/3" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-[140px] bg-white/5 rounded-2xl" />
          <div className="h-[140px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <EmptyState
          icon={<PieChart className="w-12 h-12 text-primary" />}
          title="No budget plan found for this month"
          description="Create your first budget plan to unlock dashboard insights, track unexpected expenses, and get AI recommendations."
          action={
            <Link href="/dashboard/plan">
              <Button className="rounded-full shadow-lg shadow-primary/20">
                Set Up Monthly Plan
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  // Calculate spent per category
  const spentByCategory: Record<Category, number> = {
    Essentials: 0,
    Lifestyle: 0,
    Investments: 0,
    Savings: 0,
    Miscellaneous: 0,
  };

  if (transactions) {
    transactions.forEach(tx => {
      const cat = tx.category;
      if (spentByCategory[cat] !== undefined) {
        spentByCategory[cat] += Number(tx.amount);
      }
    });
  }

  const handleSave = async () => {
    const essentials = parseFloat(editValues.essentials) || 0;
    const investments = parseFloat(editValues.investments) || 0;
    const savings = parseFloat(editValues.savings) || 0;
    const lifestyle = parseFloat(editValues.lifestyle) || 0;

    const totalAllocated = essentials + investments + savings + lifestyle;
    if (totalAllocated > plan.income) {
      toast.error(`Allocations (₹${totalAllocated.toLocaleString()}) exceed monthly income (₹${plan.income.toLocaleString()}).`);
      return;
    }

    try {
      await updatePlan({
        planId: plan.id,
        data: {
          allocated_essentials: essentials,
          allocated_investments: investments,
          allocated_savings: savings,
          allocated_lifestyle: lifestyle,
        }
      });
      toast.success("Budget plan updated successfully!");
      setIsEditing(false);
    } catch (e: any) {
      toast.error("Failed to update plan: " + e.message);
    }
  };

  const categoriesList: { key: "essentials" | "investments" | "savings" | "lifestyle" | null; label: Category; allocated: number; spent: number }[] = [
    { key: "essentials", label: "Essentials", allocated: plan.allocated_essentials, spent: spentByCategory.Essentials },
    { key: "lifestyle", label: "Lifestyle", allocated: plan.allocated_lifestyle, spent: spentByCategory.Lifestyle },
    { key: "investments", label: "Investments", allocated: plan.allocated_investments, spent: spentByCategory.Investments },
    { key: "savings", label: "Savings", allocated: plan.allocated_savings, spent: spentByCategory.Savings },
  ];

  const totalAllocated = plan.allocated_essentials + plan.allocated_investments + plan.allocated_savings + plan.allocated_lifestyle;
  const miscAllocated = Math.max(0, plan.income - totalAllocated);
  const miscSpent = spentByCategory.Miscellaneous;

  const categories = [...categoriesList, { key: null, label: "Miscellaneous" as Category, allocated: miscAllocated, spent: miscSpent }];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Monthly Plan" 
        description="Allocate your budget and track spending per category."
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="rounded-full shadow-lg shadow-primary/20">
              <Edit2 className="w-4 h-4 mr-2" /> Edit Plan
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating} className="rounded-full">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUpdating} className="rounded-full shadow-lg shadow-primary/20">
                <Save className="w-4 h-4 mr-2" /> {isUpdating ? "Saving..." : "Save Plan"}
              </Button>
            </div>
          )
        }
      />

      <Tabs defaultValue="overview" className="w-full mb-8">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((catItem, i) => {
              const { label, allocated, spent, key } = catItem;
              const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
              const isOver = spent > allocated;

              return (
                <motion.div key={label} variants={slideUpVariants} custom={i}>
                  <Card className="p-6 bg-card/40 border-white/10 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="capitalize font-semibold text-lg">{label}</h4>
                      {isEditing && key ? (
                        <div className="relative w-36">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                          <Input 
                            type="number"
                            value={editValues[key]}
                            onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                            className="pl-7 h-10 bg-white/5 border-white/10"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-mono text-muted-foreground">₹{spent.toLocaleString()} / ₹{allocated.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <>
                        <Progress value={percentage > 100 ? 100 : percentage} className={`h-2 bg-white/5 mb-2 [&>div]:${isOver ? 'bg-destructive' : 'bg-primary'}`} />
                        <p className={`text-xs ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {isOver ? `Over budget by ₹${(spent - allocated).toLocaleString()}` : `${100 - percentage}% remaining`}
                        </p>
                      </>
                    )}
                    {isEditing && !key && (
                      <div className="text-sm text-muted-foreground mt-4">
                        Miscellaneous budget is calculated dynamically from the remaining income: 
                        <span className="text-foreground ml-1 font-semibold">
                          ₹{(plan.income - (parseFloat(editValues.essentials || "0") + parseFloat(editValues.investments || "0") + parseFloat(editValues.savings || "0") + parseFloat(editValues.lifestyle || "0"))).toLocaleString()}
                        </span>
                      </div>
                    )}
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
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div>
                        <p className="font-medium">{tx.merchant}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted-foreground hidden sm:block">{tx.category}</span>
                        <p className="font-mono font-medium text-destructive w-24 text-right">-₹{tx.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No transactions recorded yet this month.
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

