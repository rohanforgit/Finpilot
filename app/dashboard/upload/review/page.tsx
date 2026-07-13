"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useOcrStore } from "@/stores/useOcrStore";
import { useMonthlyPlan } from "@/features/dashboard/hooks/useMonthlyPlan";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/services/supabase/client";
import { useState, useEffect } from "react";
import { Category } from "@/types/database";

export default function OCRReviewPage() {
  const router = useRouter();
  const { pendingTransactions, clearPendingTransactions } = useOcrStore();
  const { plan, isLoading: planLoading } = useMonthlyPlan();
  const { user } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  const tx = pendingTransactions[0];

  // Local state for edits
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Miscellaneous");
  const [date, setDate] = useState("");
  const [isPlanned, setIsPlanned] = useState(false);

  useEffect(() => {
    if (tx) {
      setMerchant(tx.merchant);
      setAmount(String(tx.amount));
      setCategory(tx.category);
      
      const d = new Date(tx.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      setIsPlanned(tx.is_planned);
    }
  }, [tx]);

  if (!tx) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-heading font-semibold mb-2">No Transactions to Review</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">Upload a screenshot of your receipt to run AI OCR extraction.</p>
        <Button onClick={() => router.push("/dashboard/upload")} className="rounded-full shadow-lg shadow-primary/20">
          <ArrowLeft className="w-4 h-4 mr-2" /> Upload Screenshot
        </Button>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!merchant.trim()) {
      toast.error("Please enter a merchant name.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!user?.id) {
      toast.error("You must be logged in.");
      return;
    }
    if (!plan) {
      toast.error("Active monthly plan not found. Setup a plan first.");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            monthly_plan_id: plan.id,
            merchant: merchant.trim(),
            amount: parsedAmount,
            date: new Date(date).toISOString(),
            category,
            status: isPlanned ? "Recurring" : "Paid",
            is_planned: isPlanned,
          }
        ]);

      if (error) throw error;

      toast.success("Transaction recorded successfully!");
      clearPendingTransactions();
      router.push("/dashboard/plan");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save transaction: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    clearPendingTransactions();
    router.push("/dashboard/upload");
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Review Extraction" 
        description="Verify the AI-extracted details before saving the transaction."
      />

      <motion.div variants={slideUpVariants} className="max-w-xl mt-8">
        <Card className="p-8 bg-card/40 border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-8">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-500">AI extraction successful. Confidence: 98%</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Merchant</label>
              <Input 
                value={merchant} 
                onChange={(e) => setMerchant(e.target.value)}
                className="bg-white/5 border-white/10 font-medium h-12" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
              <Input 
                type="number"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10 font-mono font-medium h-12" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Transaction Date & Time</label>
              <Input 
                type="datetime-local"
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/5 border-white/10 font-medium h-12" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/10 font-medium text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="Essentials" className="bg-[#111] text-foreground">Essentials</option>
                <option value="Lifestyle" className="bg-[#111] text-foreground">Lifestyle</option>
                <option value="Investments" className="bg-[#111] text-foreground">Investments</option>
                <option value="Savings" className="bg-[#111] text-foreground">Savings</option>
                <option value="Miscellaneous" className="bg-[#111] text-foreground">Miscellaneous</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <label className="text-sm font-semibold block">Fixed / Recurring Expense</label>
                <span className="text-xs text-muted-foreground">Is this a planned monthly EMI, rent, or bill payment?</span>
              </div>
              <input 
                type="checkbox" 
                checked={isPlanned}
                onChange={(e) => setIsPlanned(e.target.checked)}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <Button variant="outline" className="flex-1 h-12 bg-white/5" onClick={handleCancel} disabled={isSaving}>
              Retake
            </Button>
            <Button className="flex-1 h-12 text-base" onClick={handleConfirm} disabled={isSaving}>
              {isSaving ? "Saving..." : "Confirm & Save"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

