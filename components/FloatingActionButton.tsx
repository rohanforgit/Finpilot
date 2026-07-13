"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, UploadCloud, Receipt, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
import { useMonthlyPlan } from "@/features/dashboard/hooks/useMonthlyPlan";
import { createClient } from "@/services/supabase/client";
import { Category } from "@/types/database";

export function FloatingActionButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"manual" | "nlp" | null>(null);
  const { user } = useUserStore();
  const { plan } = useMonthlyPlan();

  // Manual Expense State
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Miscellaneous");
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:MM
  const [isSaving, setIsSaving] = useState(false);

  // NLP State
  const [noteText, setNoteText] = useState("");
  const [isParsingNlp, setIsParsingNlp] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) {
      toast.error("Please enter a merchant name.");
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    if (!plan) {
      toast.error("Please set up a monthly budget plan first.");
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
            amount: val,
            date: new Date(date).toISOString(),
            category,
            status: "Paid",
            is_planned: false
          }
        ]);

      if (error) throw error;
      toast.success("Expense logged successfully!");
      
      setMerchant("");
      setAmount("");
      setCategory("Miscellaneous");
      setActiveModal(null);
      
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to add transaction: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNlpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    if (!plan) {
      toast.error("Please set up a monthly budget plan first.");
      return;
    }

    setIsParsingNlp(true);
    try {
      const res = await fetch("/api/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText.trim() }),
      });

      if (!res.ok) throw new Error(await res.text() || "NLP parsing failed");

      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);

      // Save parsed details to supabase
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            monthly_plan_id: plan.id,
            merchant: parsed.merchant || "Quick Expense",
            amount: parsed.amount || 0,
            date: parsed.date || new Date().toISOString(),
            category: parsed.category || "Miscellaneous",
            status: parsed.is_planned ? "Recurring" : "Paid",
            is_planned: parsed.is_planned || false
          }
        ]);

      if (error) throw error;
      
      toast.success(`Logged: ₹${parsed.amount} at ${parsed.merchant}!`);
      setNoteText("");
      setActiveModal(null);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to parse quick note: " + err.message);
    } finally {
      setIsParsingNlp(false);
    }
  };

  return (
    <>
      {/* Floating Action Button Container */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {/* Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="flex flex-col items-end gap-3 mb-2"
            >
              {/* Option 1: AI Quick Note */}
              <div className="flex items-center gap-3">
                <span className="bg-card px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold shadow-md text-foreground">
                  AI Quick Note
                </span>
                <button
                  onClick={() => { setActiveModal("nlp"); setIsOpen(false); }}
                  className="w-11 h-11 rounded-full bg-card border border-white/10 hover:bg-primary/20 hover:border-primary/30 flex items-center justify-center shadow-lg transition-colors group"
                >
                  <Sparkles className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>

              {/* Option 2: Upload Screenshot */}
              <div className="flex items-center gap-3">
                <span className="bg-card px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold shadow-md text-foreground">
                  Upload Receipt
                </span>
                <button
                  onClick={() => { router.push("/dashboard/upload"); setIsOpen(false); }}
                  className="w-11 h-11 rounded-full bg-card border border-white/10 hover:bg-primary/20 hover:border-primary/30 flex items-center justify-center shadow-lg transition-colors group"
                >
                  <UploadCloud className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>

              {/* Option 3: Manual Expense */}
              <div className="flex items-center gap-3">
                <span className="bg-card px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold shadow-md text-foreground">
                  Manual Expense
                </span>
                <button
                  onClick={() => { setActiveModal("manual"); setIsOpen(false); }}
                  className="w-11 h-11 rounded-full bg-card border border-white/10 hover:bg-primary/20 hover:border-primary/30 flex items-center justify-center shadow-lg transition-colors group"
                >
                  <Receipt className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center z-50 border border-primary/20"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Backdrop for modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setActiveModal(null)}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-card border border-white/10 max-w-md w-full rounded-2xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 1. MANUAL EXPENSE MODAL */}
              {activeModal === "manual" && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <h3 className="text-lg font-semibold font-heading mb-2">Log Manual Expense</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Merchant / Vendor</label>
                    <Input 
                      value={merchant} 
                      onChange={(e) => setMerchant(e.target.value)} 
                      placeholder="e.g. Starbucks Cafe" 
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
                    <Input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      placeholder="e.g. 350" 
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Date & Time</label>
                    <Input 
                      type="datetime-local" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full h-12 px-3 rounded-lg bg-card/60 border border-white/10 text-sm font-medium outline-none focus:border-primary cursor-pointer text-foreground"
                    >
                      <option value="Essentials" className="bg-[#111] text-foreground">Essentials</option>
                      <option value="Lifestyle" className="bg-[#111] text-foreground">Lifestyle</option>
                      <option value="Investments" className="bg-[#111] text-foreground">Investments</option>
                      <option value="Savings" className="bg-[#111] text-foreground">Savings</option>
                      <option value="Miscellaneous" className="bg-[#111] text-foreground">Miscellaneous</option>
                    </select>
                  </div>

                  <Button type="submit" disabled={isSaving} className="w-full h-11 mt-4 text-sm font-semibold">
                    {isSaving ? "Saving..." : "Log Expense"}
                  </Button>
                </form>
              )}

              {/* 2. AI QUICK NOTE MODAL */}
              {activeModal === "nlp" && (
                <form onSubmit={handleNlpSubmit} className="space-y-4">
                  <h3 className="text-lg font-semibold font-heading mb-2">AI Quick Expense Note</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Type a casual note like <strong className="text-primary">"spent 250 for lunch at Burger King"</strong>. The AI will instantly parse and file it.
                  </p>
                  
                  <textarea 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Type your expense details here..."
                    className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-primary resize-none text-sm leading-relaxed text-foreground"
                  />

                  <Button type="submit" disabled={isParsingNlp} className="w-full h-11 text-sm font-semibold">
                    {isParsingNlp ? "AI Processing..." : "Parse & Save"}
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
