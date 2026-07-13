"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOcrStore } from "@/stores/useOcrStore";
import { toast } from "sonner";

export default function OCRUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const { setPendingTransactions } = useOcrStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    // Basic file type validation
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files (JPEG, PNG, WebP) are supported.");
      return;
    }

    setIsUploading(true);
    setStatusMessage("Uploading receipt screenshot...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const progressInterval = setInterval(() => {
        setStatusMessage(prev => {
          if (prev.includes("Uploading")) return "Reading screenshot pixels...";
          if (prev.includes("Reading")) return "AI Engine extracting details...";
          return "Finalizing transaction categorization...";
        });
      }, 500);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "OCR extraction failed");
      }

      const parsedData = await res.json();
      
      if (parsedData.error) {
        throw new Error(parsedData.error);
      }

      // Put the extracted details in the Zustand store
      setPendingTransactions([
        {
          id: String(Date.now()),
          merchant: parsedData.merchant || "Unknown Merchant",
          amount: parseFloat(parsedData.amount) || 0,
          date: parsedData.date || new Date().toISOString(),
          category: parsedData.category || "Miscellaneous",
          is_planned: parsedData.is_planned || false,
        }
      ]);

      toast.success("AI extracted details successfully!");
      router.push("/dashboard/upload/review");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to process screenshot.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Upload Receipt" 
        description="Drop a screenshot of your digital payment to instantly extract details."
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept="image/*" 
        className="hidden" 
      />

      <motion.div variants={slideUpVariants} className="max-w-2xl mx-auto mt-8">
        <Card 
          className={`p-12 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[400px] cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-white/20 bg-card/40 hover:bg-white/5 hover:border-white/30'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!isUploading ? handleBrowseClick : undefined}
        >
          {isUploading ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-semibold text-lg">{statusMessage}</p>
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

