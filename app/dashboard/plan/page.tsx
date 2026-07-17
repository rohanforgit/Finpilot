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
import { PieChart, Edit2, Save, X, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Category } from "@/types/database";
import { updateTransactionCategory } from "@/services/api/transactions";
import { useQueryClient } from "@tanstack/react-query";

export default function MonthlyPlanPage() {
  const { plan, isLoading: planLoading, updatePlan, isUpdating } = useMonthlyPlan();
  const { data: transactions, isLoading: txsLoading } = useTransactions(100);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

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
            <Link href="/onboarding">
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

  const handleDrop = async (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault();
    const txId = e.dataTransfer.getData("text/plain");
    if (!txId) return;

    try {
      const result = await updateTransactionCategory(txId, targetCategory);
      if (result) {
        toast.success(`Transaction moved to ${targetCategory}`);
        queryClient.invalidateQueries();
      } else {
        toast.error("Failed to move transaction category");
      }
    } catch (err: any) {
      toast.error("Error shifting category: " + err.message);
    }
  };

  const categoriesList: { key: "essentials" | "investments" | "savings" | "lifestyle" | null; label: Category; allocated: number; spent: number }[] = [
    { key: "essentials", label: "Essentials", allocated: plan.allocated_essentials, spent: spentByCategory.Essentials },
    { key: "lifestyle", label: "Lifestyle", allocated: plan.allocated_lifestyle, spent: spentByCategory.Lifestyle },
    { key: "investments", label: "Investments", allocated: plan.allocated_investments, spent: spentByCategory.Investments },
    { key: "savings", label: "Savings", allocated: plan.allocated_savings, spent: spentByCategory.Savings },
  ];

  const totalAllocated = plan.allocated_essentials + plan.allocated_investments + plan.allocated_savings + plan.allocated_lifestyle;
  const unallocatedRemainder = Math.max(0, plan.income - totalAllocated);
  const miscSpent = spentByCategory.Miscellaneous;

  // Miscellaneous allocated is hardcoded to 0 so unallocated remainder displays correctly in the banner
  const categories = [...categoriesList, { key: null, label: "Miscellaneous" as Category, allocated: 0, spent: miscSpent }];

  const toggleExpand = (label: Category) => {
    setExpandedCategory(expandedCategory === label ? null : label);
  };

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
          {/* Unallocated Money Banner */}
          {unallocatedRemainder > 0 && (
            <motion.div variants={slideUpVariants} className="mb-6">
              <Card className="p-4 bg-primary/10 border-primary/20 flex items-center gap-3">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm font-medium text-foreground">
                  Unallocated Money: <span className="font-bold text-primary">₹{unallocatedRemainder.toLocaleString()}</span> remaining of your ₹{plan.income.toLocaleString()} monthly income. Consider allocating this to Savings or Investments!
                </p>
              </Card>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((catItem, i) => {
              const { label, allocated, spent, key } = catItem;
              const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
              const isOver = allocated > 0 && spent > allocated;

              return (
                <motion.div 
                  key={label} 
                  variants={slideUpVariants} 
                  custom={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, label)}
                >
                  <Card 
                    onClick={() => !isEditing && toggleExpand(label)}
                    className={`p-6 bg-card/40 border-white/10 hover:bg-white/5 transition-colors cursor-pointer select-none relative ${
                      expandedCategory === label ? "ring-2 ring-primary/40 bg-white/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="capitalize font-semibold text-lg">{label}</h4>
                      {isEditing && key ? (
                        <div className="relative w-36" onClick={(e) => e.stopPropagation()}>
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                          <Input 
                            type="number"
                            value={editValues[key]}
                            onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                            className="pl-7 h-10 bg-white/5 border-white/10"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-mono text-muted-foreground">
                          {label === "Miscellaneous" 
                            ? `₹${spent.toLocaleString()} spent`
                            : `₹${spent.toLocaleString()} / ₹${allocated.toLocaleString()}`
                          }
                        </span>
                      )}
                    </div>
                    
                    {!isEditing && label !== "Miscellaneous" && (
                      <>
                        <Progress value={percentage > 100 ? 100 : percentage} className={`h-2 bg-white/5 mb-2 [&>div]:${isOver ? 'bg-destructive' : 'bg-primary'}`} />
                        <p className={`text-xs ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {isOver ? `Over budget by ₹${(spent - allocated).toLocaleString()}` : `${100 - percentage}% remaining`}
                        </p>
                      </>
                    )}
                    {!isEditing && label === "Miscellaneous" && (
                      <p className="text-xs text-muted-foreground">
                        Drag and drop items here to classify them as miscellaneous.
                      </p>
                    )}
                    {isEditing && !key && (
                      <div className="text-sm text-muted-foreground mt-4">
                        Miscellaneous budget is calculated dynamically from the remaining income: 
                        <span className="text-foreground ml-1 font-semibold">
                          ₹{(plan.income - (parseFloat(editValues.essentials || "0") + parseFloat(editValues.investments || "0") + parseFloat(editValues.savings || "0") + parseFloat(editValues.lifestyle || "0"))).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Drill-down transactions sub-list inside active category card */}
                    {!isEditing && expandedCategory === label && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transactions in {label}:</p>
                        {transactions && transactions.filter(t => t.category === label).length > 0 ? (
                          transactions.filter(t => t.category === label).map(t => (
                            <div 
                              key={t.id} 
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                              className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                            >
                              <div>
                                <p className="font-medium text-foreground">{t.merchant}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                              </div>
                              <span className="font-mono text-destructive font-semibold">-₹{t.amount.toLocaleString()}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No transactions found in this category.</p>
                        )}
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
                    <div 
                      key={tx.id} 
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", tx.id)}
                      className="p-4 flex items-center justify-between hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors"
                    >
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
