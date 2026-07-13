"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function OCRReviewPage() {
  const router = useRouter();

  const handleConfirm = () => {
    toast.success("Transaction added to your Monthly Plan!");
    router.push("/dashboard/plan");
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
              <Input defaultValue="Starbucks" className="bg-white/5 border-white/10 font-medium h-12" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
              <Input defaultValue="350" className="bg-white/5 border-white/10 font-mono font-medium h-12" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category (Auto-assigned)</label>
              <div className="relative">
                <Input defaultValue="Lifestyle" className="bg-white/5 border-white/10 font-medium h-12 pr-10" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <Button variant="outline" className="flex-1 h-12 bg-white/5" onClick={() => router.push("/dashboard/upload")}>
              Retake
            </Button>
            <Button className="flex-1 h-12 text-base" onClick={handleConfirm}>
              Confirm & Save
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
