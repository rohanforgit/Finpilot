"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OCRUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      router.push("/dashboard/upload/review");
    }, 1500);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Upload Receipt" 
        description="Drop a screenshot of your digital payment to instantly extract details."
      />

      <motion.div variants={slideUpVariants} className="max-w-2xl mx-auto mt-8">
        <Card 
          className={`p-12 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[400px] cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-white/20 bg-card/40 hover:bg-white/5 hover:border-white/30'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={handleSimulateUpload}
        >
          {isUploading ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-semibold text-lg">AI Engine Extracting...</p>
              <p className="text-sm text-muted-foreground mt-2">Reading merchant and amount</p>
            </motion.div>
          ) : (
            <>
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 pointer-events-none">
                <UploadCloud className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Drag & Drop Screenshot</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Supports JPG, PNG, and WebP. FinPilot uses OCR to instantly categorize your expense.
              </p>
              <span className="px-4 py-2 bg-primary/20 text-primary font-medium rounded-full text-sm">
                Or click to browse
              </span>
            </>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
