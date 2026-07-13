"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { mockBuckets } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BucketsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Savings Buckets" 
        description="Allocate funds towards your specific annual goals."
        actions={
          <Button className="rounded-full h-10 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Bucket
          </Button>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {mockBuckets.map((bucket, i) => {
          const percentage = Math.round((bucket.current / bucket.target) * 100);
          
          return (
            <motion.div key={bucket.id} variants={slideUpVariants} custom={i}>
              <Card className="p-6 bg-card/40 border-white/10 hover:bg-white/5 transition-colors group">
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bucket.color}/10 border border-${bucket.color}/20`}>
                    <Target className={`w-6 h-6 text-${bucket.color.replace('bg-', '')}`} />
                  </div>
                  <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded-md">{percentage}%</span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{bucket.name}</h3>
                <div className="flex justify-between items-end mb-3">
                  <p className="font-mono text-2xl font-bold">₹{bucket.current.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-mono">/ ₹{bucket.target.toLocaleString()}</p>
                </div>
                
                <Progress value={percentage} className={`h-1.5 bg-white/5 [&>div]:${bucket.color}`} />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
