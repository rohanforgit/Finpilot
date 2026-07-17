"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { slideUpVariants } from "@/lib/animations";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/services/supabase/client";
import { toast } from "sonner";
import { useMonthlyPlan } from "@/features/dashboard/hooks/useMonthlyPlan";
import { Category } from "@/types/database";

interface FixedExpense {
  id: number;
  name: string;
  amount: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<FixedExpense[]>([
    { id: 1, name: "Rent", amount: "" },
    { id: 2, name: "Utilities", amount: "" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const { user, setUser } = useUserStore();
  const router = useRouter();

  const { plan, isLoading: planLoading } = useMonthlyPlan();

  // Redirect to dashboard if plan already exists to prevent hydration locks
  useEffect(() => {
    if (!planLoading && plan) {
      router.push("/dashboard");
    }
  }, [plan, planLoading, router]);

  const addExpenseField = () => {
    setExpenses([...expenses, { id: Date.now(), name: "", amount: "" }]);
  };

  const updateExpense = (id: number, field: "name" | "amount", value: string) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };
  
  const nextStep = async () => {
    if (step === 1) {
      if (!income || parseFloat(income) <= 0) {
        toast.error("Please enter a valid monthly income.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate that at least name or amount is entered if the row exists, or filter them out
      const hasInvalidRow = expenses.some(e => (e.name && !e.amount) || (!e.name && e.amount));
      if (hasInvalidRow) {
        toast.error("Please fill in both name and amount for all expenses, or remove empty rows.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      await handleFinishOnboarding();
    }
  };

  const handleFinishOnboarding = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save onboarding data.");
      return;
    }
    
    setIsSaving(true);
    const supabase = createClient();
    
    const incomeVal = parseFloat(income) || 0;
    const validExpenses = expenses.filter(e => e.name && parseFloat(e.amount) > 0);

    const autoCategorizeExpense = (name: string): Category => {
      const clean = name.toLowerCase();
      if (clean.includes("sip") || clean.includes("invest") || clean.includes("fund") || clean.includes("stock") || clean.includes("equity") || clean.includes("gold")) {
        return "Investments";
      }
      if (clean.includes("saving") || clean.includes("deposit") || clean.includes("emergency")) {
        return "Savings";
      }
      if (clean.includes("gym") || clean.includes("netflix") || clean.includes("spotify") || clean.includes("dine") || clean.includes("restaurant") || clean.includes("movie") || clean.includes("shopping") || clean.includes("entertainment") || clean.includes("lifestyle") || clean.includes("travel")) {
        return "Lifestyle";
      }
      if (clean.includes("tithe") || clean.includes("donation") || clean.includes("charity") || clean.includes("gift") || clean.includes("dad") || clean.includes("support") || clean.includes("transfer") || clean.includes("misc")) {
        return "Miscellaneous";
      }
      return "Essentials";
    };

    const essentialsAlloc = validExpenses.filter(e => autoCategorizeExpense(e.name) === "Essentials").reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const investmentsAlloc = validExpenses.filter(e => autoCategorizeExpense(e.name) === "Investments").reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const savingsAlloc = validExpenses.filter(e => autoCategorizeExpense(e.name) === "Savings").reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const lifestyleAlloc = validExpenses.filter(e => autoCategorizeExpense(e.name) === "Lifestyle").reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

    // 1. Update Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ monthly_income: incomeVal })
      .eq("id", user.id);

    if (profileError) {
      toast.error("Failed to update profile: " + profileError.message);
      setIsSaving(false);
      return;
    }

    // Update Zustand state
    setUser({
      ...user,
      monthly_income: incomeVal,
    });

    // 2. Create Monthly Plan
    const date = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[date.getMonth()];
    const currentYear = date.getFullYear();

    const { data: planData, error: planError } = await supabase
      .from("monthly_plans")
      .insert([
        {
          user_id: user.id,
          month: currentMonth,
          year: currentYear,
          income: incomeVal,
          allocated_essentials: essentialsAlloc,
          allocated_investments: investmentsAlloc,
          allocated_savings: savingsAlloc,
          allocated_lifestyle: lifestyleAlloc,
        }
      ])
      .select()
      .single();

    if (planError) {
      toast.error("Failed to create monthly plan: " + planError.message);
      setIsSaving(false);
      return;
    }

    // 3. Create Transactions for each fixed expense
    if (validExpenses.length > 0) {
      const txs = validExpenses.map(e => ({
        user_id: user.id,
        monthly_plan_id: planData.id,
        date: new Date().toISOString(),
        merchant: e.name,
        amount: parseFloat(e.amount),
        category: autoCategorizeExpense(e.name),
        status: "Recurring" as const,
        is_planned: true,
      }));

      const { error: txError } = await supabase
        .from("transactions")
        .insert(txs);

      if (txError) {
        toast.error("Failed to save initial expenses: " + txError.message);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    toast.success("Onboarding completed successfully!");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md bg-card/40 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl"
          >
            <h2 className="text-2xl font-bold font-heading mb-2 text-foreground">Welcome to FinPilot</h2>
            <p className="text-sm text-muted-foreground mb-6">Let&apos;s start by setting up your monthly income capacity.</p>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Income (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <Input 
                    type="number" 
                    placeholder="e.g. 1,20,000" 
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="pl-8 bg-white/5 border-white/10 h-12 text-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <Button onClick={nextStep} className="w-full rounded-full h-11 shadow-lg shadow-primary/20">
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-xl bg-card/40 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl"
          >
            <h2 className="text-2xl font-bold font-heading mb-2 text-foreground">Fixed Expenses</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter details of your fixed recurring obligations (e.g. Rent, Loans, SIPs).</p>
            
            <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex gap-3 items-center">
                  <Input 
                    placeholder="Expense Name (e.g. Rent)" 
                    value={exp.name}
                    onChange={(e) => updateExpense(exp.id, "name", e.target.value)}
                    className="bg-white/5 border-white/10 flex-1"
                  />
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                    <Input 
                      type="number"
                      placeholder="Amount" 
                      value={exp.amount}
                      onChange={(e) => updateExpense(exp.id, "amount", e.target.value)}
                      className="pl-6 bg-white/5 border-white/10 font-mono"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeExpense(exp.id)}
                    className="text-muted-foreground hover:text-destructive text-xs h-9"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={addExpenseField} className="rounded-full flex-1">
                Add Expense
              </Button>
              <Button onClick={nextStep} className="rounded-full flex-1 shadow-lg shadow-primary/20">
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md bg-card/40 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl text-center"
          >
            <h2 className="text-2xl font-bold font-heading mb-2 text-foreground font-medium">Ready to Analyze!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We&apos;ll auto-categorize your recurring expenses and build your custom budget dashboard.
            </p>

            <div className="py-6 border-y border-white/5 mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total Income:</span>
                <span className="font-bold text-foreground font-mono">₹{parseFloat(income).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fixed Expenses:</span>
                <span className="font-bold text-destructive font-mono">
                  -₹{expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="rounded-full flex-1">
                Back
              </Button>
              <Button onClick={nextStep} disabled={isSaving} className="rounded-full flex-1 shadow-lg shadow-primary/20">
                {isSaving ? "Initializing..." : "Finish Setup"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
