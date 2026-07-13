"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { slideUpVariants, fadeVariants } from "@/lib/animations";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/services/supabase/client";
import { toast } from "sonner";

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
    const essentialsAlloc = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

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
          allocated_investments: 0,
          allocated_savings: 0,
          allocated_lifestyle: 0,
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
    const validExpenses = expenses.filter(e => e.name && parseFloat(e.amount) > 0);
    if (validExpenses.length > 0) {
      const txs = validExpenses.map(e => ({
        user_id: user.id,
        monthly_plan_id: planData.id,
        date: new Date().toISOString(),
        merchant: e.name,
        amount: parseFloat(e.amount),
        category: "Essentials" as const,
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
    toast.success("Financial plan setup successfully!");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary/20">
      <div className="max-w-md w-full relative">
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-2 mb-12 justify-center"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </motion.div>

        <div className="h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-heading font-bold text-center">What's your monthly income?</h1>
                <p className="text-center text-muted-foreground">This helps us establish your baseline budget.</p>
                <div className="relative mt-8">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input 
                    type="number" 
                    placeholder="1,20,000" 
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="pl-10 h-14 text-lg bg-white/5 border-white/10 text-center" 
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-heading font-bold text-center">Fixed Expenses</h1>
                <p className="text-center text-muted-foreground">Enter your major recurring bills (Rent, EMIs, Utilities).</p>
                <div className="space-y-3 mt-8 overflow-y-auto max-h-[250px] pr-2">
                  {expenses.map((e) => (
                    <div key={e.id} className="flex gap-2 items-center">
                      <Input 
                        placeholder="Expense Name (e.g. Rent)" 
                        value={e.name}
                        onChange={(val) => updateExpense(e.id, "name", val.target.value)}
                        className="h-12 bg-white/5 border-white/10 flex-[2]" 
                      />
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <Input 
                          type="number"
                          placeholder="Amount" 
                          value={e.amount}
                          onChange={(val) => updateExpense(e.id, "amount", val.target.value)}
                          className="pl-7 h-12 bg-white/5 border-white/10" 
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 h-12 w-12" 
                        onClick={() => removeExpense(e.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full text-primary hover:bg-primary/10 hover:text-primary mt-2"
                    onClick={addExpenseField}
                  >
                    + Add Another
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎉</span>
                </div>
                <h1 className="text-3xl font-heading font-bold text-center">You're all set!</h1>
                <p className="text-muted-foreground">We've structured your initial plan. Let AI guide you from here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div variants={slideUpVariants} initial="hidden" animate="visible" className="mt-8 flex gap-4">
          {step > 1 && (
            <Button 
              variant="outline" 
              className="flex-1 h-12 bg-white/5 border-white/10" 
              onClick={() => setStep(step - 1)}
              disabled={isSaving}
            >
              Back
            </Button>
          )}
          <Button 
            className="flex-[2] h-12 text-base" 
            onClick={nextStep}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : step === 3 ? "Go to Dashboard" : "Continue"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

