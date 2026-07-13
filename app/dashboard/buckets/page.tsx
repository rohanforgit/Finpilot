"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useSavingsBuckets } from "@/features/dashboard/hooks/useSavingsBuckets";
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const COLORS = [
  { value: "bg-emerald-500", name: "Emerald" },
  { value: "bg-purple-500", name: "Purple" },
  { value: "bg-blue-500", name: "Blue" },
  { value: "bg-amber-500", name: "Amber" },
  { value: "bg-rose-500", name: "Rose" },
];

export default function BucketsPage() {
  const { buckets, isLoading, createBucket } = useSavingsBuckets();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [color, setColor] = useState("bg-emerald-500");

  const handleCreate = async () => {
    if (!name) {
      toast.error("Please enter a bucket name.");
      return;
    }
    const targetVal = parseFloat(target);
    if (isNaN(targetVal) || targetVal <= 0) {
      toast.error("Please enter a valid target amount.");
      return;
    }

    try {
      await createBucket({
        name,
        target_amount: targetVal,
        current_amount: parseFloat(current) || 0,
        color,
        target_date: null,
      });
      toast.success("Savings bucket created!");
      setIsOpen(false);
      setName("");
      setTarget("");
      setCurrent("");
      setColor("bg-emerald-500");
    } catch (e: any) {
      toast.error("Failed to create bucket: " + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-12 bg-white/5 rounded-lg w-1/4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-[180px] bg-white/5 rounded-2xl" />
          <div className="h-[180px] bg-white/5 rounded-2xl" />
          <div className="h-[180px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Savings Buckets" 
        description="Allocate funds towards your specific annual goals."
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button className="rounded-full h-10 px-6 shadow-lg shadow-primary/20" />}>
              <Plus className="w-4 h-4 mr-2" />
              New Bucket
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-white/10 text-foreground">
              <DialogHeader>
                <DialogTitle>Create Savings Bucket</DialogTitle>
                <DialogDescription>
                  Set up a bucket to track your progress towards a specific goal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. New Laptop, Vacation" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="target">Target Amount (₹)</Label>
                    <Input 
                      id="target" 
                      type="number" 
                      placeholder="1,20,000" 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="current">Starting Balance (₹)</Label>
                    <Input 
                      id="current" 
                      type="number" 
                      placeholder="20,000" 
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="flex gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`w-8 h-8 rounded-full transition-all border-2 ${c.value} ${color === c.value ? 'scale-110 border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-full">Cancel</Button>
                <Button onClick={handleCreate} className="rounded-full shadow-lg shadow-primary/20">Create Bucket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {buckets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {buckets.map((bucket, i) => {
            const percentage = bucket.target_amount > 0 ? Math.min(100, Math.round((bucket.current_amount / bucket.target_amount) * 100)) : 0;
            const pureColor = bucket.color.replace('bg-', '');
            
            return (
              <motion.div key={bucket.id} variants={slideUpVariants} custom={i}>
                <Card className="p-6 bg-card/40 border-white/10 hover:bg-white/5 transition-colors group">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${pureColor}/10 border border-${pureColor}/20`}>
                      <Target className={`w-6 h-6 text-${pureColor}`} />
                    </div>
                    <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded-md">{percentage}%</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{bucket.name}</h3>
                  <div className="flex justify-between items-end mb-3">
                    <p className="font-mono text-2xl font-bold">₹{bucket.current_amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-mono">/ ₹{bucket.target_amount.toLocaleString()}</p>
                  </div>
                  
                  <Progress value={percentage} className={`h-1.5 bg-white/5 [&>div]:${bucket.color}`} />
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 flex justify-center">
          <EmptyState
            icon={<Target className="w-12 h-12 text-primary" />}
            title="No savings buckets yet"
            description="Create savings buckets to start tracking funds for major yearly goals like insurance, vacations, or devices."
            action={
              <Button onClick={() => setIsOpen(true)} className="rounded-full shadow-lg shadow-primary/20">
                Create First Bucket
              </Button>
            }
          />
        </div>
      )}
    </motion.div>
  );
}

