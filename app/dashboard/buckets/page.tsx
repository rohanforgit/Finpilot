"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useSavingsBuckets } from "@/features/dashboard/hooks/useSavingsBuckets";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, PiggyBank, BrainCircuit, Shield, Flame, Activity, TrendingUp, Info, Wallet, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMonthlyPlan } from "@/features/dashboard/hooks/useMonthlyPlan";
import { useUserStore } from "@/stores/useUserStore";
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
import { useState, useEffect } from "react";
import { toast } from "sonner";

const COLORS = [
  { value: "bg-emerald-500", name: "Emerald" },
  { value: "bg-purple-500", name: "Purple" },
  { value: "bg-blue-500", name: "Blue" },
  { value: "bg-amber-500", name: "Amber" },
  { value: "bg-rose-500", name: "Rose" },
];

export default function BucketsPage() {
  const { buckets, isLoading: bucketsLoading, createBucket } = useSavingsBuckets();
  const { plan, isLoading: planLoading } = useMonthlyPlan();
  const { user } = useUserStore();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [color, setColor] = useState("bg-emerald-500");

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [riskProfile, setRiskProfile] = useState<"Easy" | "Moderate" | "Aggressive">("Moderate");

  // Load user risk profile from localStorage
  useEffect(() => {
    if (user?.id) {
      const saved = window.localStorage.getItem(`investment_profile_${user.id}`) as "Easy" | "Moderate" | "Aggressive";
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRiskProfile(saved);
      }
    }
  }, [user]);

  // Load monthly bucket allocations from localStorage
  useEffect(() => {
    if (buckets && buckets.length > 0) {
      const initial: Record<string, number> = {};
      buckets.forEach((b) => {
        const saved = window.localStorage.getItem(`savings_allocation_${b.id}`);
        initial[b.id] = saved ? parseFloat(saved) : 0;
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllocations(initial);
    }
  }, [buckets]);

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
    } catch (e) {
      toast.error("Failed to create bucket: " + (e as Error).message);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      await createBucket({
        name: "Emergency Fund",
        target_amount: 150000,
        current_amount: 25000,
        color: "bg-emerald-500",
        target_date: null,
      });
      await createBucket({
        name: "Fees & Obligations",
        target_amount: 80000,
        current_amount: 15000,
        color: "bg-blue-500",
        target_date: null,
      });
      await createBucket({
        name: "Miscellaneous Savings",
        target_amount: 30000,
        current_amount: 5000,
        color: "bg-amber-500",
        target_date: null,
      });
      toast.success("Standard financial buckets initialized!");
    } catch (e) {
      toast.error("Failed to initialize standard buckets: " + (e as Error).message);
    }
  };

  const handleAllocationChange = (bucketId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setAllocations((prev) => ({
      ...prev,
      [bucketId]: num,
    }));
  };

  const saveAllocations = () => {
    Object.entries(allocations).forEach(([bucketId, val]) => {
      window.localStorage.setItem(`savings_allocation_${bucketId}`, String(val));
    });
    toast.success("Savings allocations saved successfully!");
  };

  const handleRiskProfileChange = (profile: "Easy" | "Moderate" | "Aggressive") => {
    setRiskProfile(profile);
    if (user?.id) {
      window.localStorage.setItem(`investment_profile_${user.id}`, profile);
    }
    toast.success(`Risk profile updated to ${profile === "Easy" ? "Easy (Conservative)" : profile}!`);
  };

  // Calculations for Savings
  const savingsBudget = plan?.allocated_savings || 55000;
  const totalAllocatedSavings = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const remainingSavings = Math.max(0, savingsBudget - totalAllocatedSavings);
  const allocationPercentage = savingsBudget > 0 ? Math.min(100, Math.round((totalAllocatedSavings / savingsBudget) * 100)) : 0;

  // Investment capacity dynamically calculated as Savings Allocation minus Bucket Savings Assignments
  const investmentsBudget = Math.max(0, savingsBudget - totalAllocatedSavings);

  // Mutual Fund Splits based on Profile
  const getFundSplits = () => {
    if (riskProfile === "Easy") {
      return [
        { category: "Liquid Mutual Funds", pct: 60, amount: investmentsBudget * 0.6, funds: ["Nippon India Liquid Fund", "Tata Liquid Fund"], purpose: "Low-risk, capital safety & high liquidity." },
        { category: "Large Cap Index Funds", pct: 30, amount: investmentsBudget * 0.3, funds: ["UTI Nifty 50 Index Fund", "HDFC Index Fund"], purpose: "Growth tracking India's top 50 companies." },
        { category: "Gold Mutual Funds", pct: 10, amount: investmentsBudget * 0.1, funds: ["SBI Gold Fund", "Kotak Gold Fund"], purpose: "Inflation hedge & equity market buffer." },
      ];
    } else if (riskProfile === "Moderate") {
      return [
        { category: "Large Cap / Flexi Cap Funds", pct: 40, amount: investmentsBudget * 0.4, funds: ["Parag Parikh Flexi Cap Fund", "Mirae Asset Large Cap Fund"], purpose: "Core equity wealth compounder." },
        { category: "Mid Cap Mutual Funds", pct: 30, amount: investmentsBudget * 0.3, funds: ["HDFC Mid-Cap Opportunities Fund", "Kotak Emerging Equity Fund"], purpose: "High growth from mid-sized companies." },
        { category: "Liquid / Arbitrage Funds", pct: 30, amount: investmentsBudget * 0.3, funds: ["ICICI Prudential Equity Arbitrage Fund", "SBI Liquid Fund"], purpose: "Tax-efficient stability buffer." },
      ];
    } else {
      return [
        { category: "Mid & Small Cap Funds", pct: 50, amount: investmentsBudget * 0.5, funds: ["Nippon India Small Cap Fund", "Quant Small Cap Fund", "Axis Midcap Fund"], purpose: "Maximum compounding from fast-growing stars." },
        { category: "Flexi Cap / Large Cap Funds", pct: 40, amount: investmentsBudget * 0.4, funds: ["Parag Parikh Flexi Cap Fund", "UTI Nifty 50 Index Fund"], purpose: "Solid equity foundation to buffer risk." },
        { category: "Liquid Mutual Funds", pct: 10, amount: investmentsBudget * 0.1, funds: ["Nippon India Liquid Fund"], purpose: "Instant liquidity for market dips." },
      ];
    }
  };

  const fundSplits = getFundSplits();

  // Growth compounding calculations
  const calculateSIP = (rate: number, years: number, monthlyContribution: number) => {
    const months = years * 12;
    const r = rate / 12;
    return monthlyContribution * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  };

  const getReturnRate = () => {
    if (riskProfile === "Easy") return 0.07;
    if (riskProfile === "Moderate") return 0.12;
    return 0.15;
  };

  const returnRate = getReturnRate();

  const projections = [
    { label: "1 Year", years: 1, rateLabel: `${returnRate * 100}%` },
    { label: "3 Years", years: 3, rateLabel: `${returnRate * 100}%` },
    { label: "5 Years", years: 5, rateLabel: `${returnRate * 100}%` },
  ].map((proj) => {
    const invested = investmentsBudget * 12 * proj.years;
    const projected = Math.round(calculateSIP(returnRate, proj.years, investmentsBudget));
    const returnsGained = Math.max(0, projected - invested);
    const gainPercentage = projected > 0 ? Math.round((returnsGained / projected) * 100) : 0;
    return {
      ...proj,
      invested,
      projected,
      returnsGained,
      gainPercentage,
    };
  });

  const isLoading = bucketsLoading || planLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-12 bg-white/5 rounded-lg w-1/4" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[450px] bg-white/5 rounded-2xl" />
          <div className="h-[450px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Savings & Investments" 
        description="Allocate monthly savings budgets to your goals and build mutual fund portfolios."
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
                    placeholder="e.g. Buy Laptop, College Fees" 
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

      <Tabs defaultValue="savings" className="w-full mt-8">
        <TabsList className="bg-white/5 border border-white/10 mb-8">
          <TabsTrigger value="savings" className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4" /> Savings Allocation
          </TabsTrigger>
          <TabsTrigger value="investments" className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" /> Mutual Fund Investments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="savings">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel: Savings Allocator */}
            <motion.div variants={slideUpVariants} className="lg:col-span-1">
              <Card className="p-6 bg-card/40 border-white/10 space-y-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-lg">Savings Allocator</h3>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    Assign portions of your monthly savings budget (₹{savingsBudget.toLocaleString()}) to specific goals. 
                  </p>

                  {buckets.length > 0 ? (
                    <div className="space-y-4">
                      {buckets.map((b) => (
                        <div key={b.id} className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{b.name}</span>
                            <div className="relative w-28">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                              <Input
                                type="number"
                                value={allocations[b.id] !== undefined ? allocations[b.id] : ""}
                                onChange={(e) => handleAllocationChange(b.id, e.target.value)}
                                className="pl-6 h-8 text-xs bg-white/5 border-white/5"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center text-muted-foreground py-8">
                      Create buckets on the right to start allocating savings!
                    </p>
                  )}
                </div>

                {buckets.length > 0 && (
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Total Allocated</span>
                        <span>₹{totalAllocatedSavings.toLocaleString()} / ₹{savingsBudget.toLocaleString()}</span>
                      </div>
                      <Progress value={allocationPercentage} className="h-2 bg-white/5" />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Remaining to distribute:</span>
                      <span className={`font-mono font-semibold ${remainingSavings > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                        ₹{remainingSavings.toLocaleString()}
                      </span>
                    </div>

                    <Button onClick={saveAllocations} className="w-full rounded-full h-10 shadow-lg shadow-primary/20">
                      <Save className="w-4 h-4 mr-2" /> Save Allocations
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Right Panel: Buckets List */}
            <motion.div variants={slideUpVariants} className="lg:col-span-2 space-y-6">
              {buckets.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {buckets.map((bucket) => {
                    const percentage = bucket.target_amount > 0 ? Math.min(100, Math.round((bucket.current_amount / bucket.target_amount) * 100)) : 0;
                    const monthlyContrib = allocations[bucket.id] || 0;
                    const pureColor = bucket.color.replace('bg-', '');
                    
                    return (
                      <Card key={bucket.id} className="p-6 bg-card/40 border-white/10 hover:bg-white/5 transition-colors group flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-6">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${pureColor}/10 border border-${pureColor}/20`}>
                              <Target className={`w-5 h-5 text-${pureColor}`} />
                            </div>
                            <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-md">{percentage}% Target</span>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-1 truncate">{bucket.name}</h3>
                          <div className="flex justify-between items-end mb-4">
                            <p className="font-mono text-xl font-bold">₹{bucket.current_amount.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">/ ₹{bucket.target_amount.toLocaleString()}</p>
                          </div>
                          
                          <Progress value={percentage} className={`h-1.5 bg-white/5 mb-4 [&>div]:${bucket.color}`} />
                        </div>

                        {monthlyContrib > 0 && (
                          <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[11px]">
                            <span className="text-muted-foreground">Monthly Contribution:</span>
                            <span className="font-semibold text-primary font-mono">₹{monthlyContrib.toLocaleString()}/mo</span>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex justify-center h-full items-center">
                  <EmptyState
                    icon={<Target className="w-12 h-12 text-primary" />}
                    title="No savings buckets created yet"
                    description="Initialize standard financial goals (Emergency Fund, Fees, Miscellaneous) to start planning your savings."
                    action={
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleInitializeDefaults} className="rounded-full shadow-lg shadow-primary/20">
                          Initialize Standard Buckets
                        </Button>
                        <Button onClick={() => setIsOpen(true)} variant="outline" className="rounded-full">
                          Create Custom Bucket
                        </Button>
                      </div>
                    }
                  />
                </div>
              )}
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="investments">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel: Advisor */}
            <motion.div variants={slideUpVariants} className="lg:col-span-2">
              <Card className="p-8 bg-card/40 border-white/10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">AI Investment Advisor</h3>
                      <p className="text-xs text-muted-foreground">Suggested Indian Mutual Funds based on your profile & budget.</p>
                    </div>
                  </div>
                  
                  {/* Quick toggle for risk profile overrides */}
                  <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
                    {(["Easy", "Moderate", "Aggressive"] as const).map((prof) => {
                      const isActive = riskProfile === prof;
                      return (
                        <button
                          key={prof}
                          onClick={() => handleRiskProfileChange(prof)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {prof === "Easy" && <Shield className="w-3.5 h-3.5" />}
                          {prof === "Moderate" && <Activity className="w-3.5 h-3.5" />}
                          {prof === "Aggressive" && <Flame className="w-3.5 h-3.5" />}
                          <span>{prof === "Easy" ? "Easy" : prof}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 justify-between items-center gap-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Monthly Investment Capacity</h4>
                    <p className="text-xs text-muted-foreground">Calculated dynamically as: Monthly Savings - Bucket Allocations</p>
                  </div>
                  <div className="text-right md:text-right">
                    <span className="text-3xl font-bold font-mono text-primary">₹{investmentsBudget.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Suggested Fund Distribution</h4>

                  <div className="space-y-4">
                    {fundSplits.map((split, idx) => (
                      <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <h5 className="font-semibold text-foreground text-sm flex items-center gap-2">
                              <span>{split.category}</span>
                              <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{split.pct}% allocation</span>
                            </h5>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{split.purpose}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-lg font-bold font-mono text-foreground">₹{split.amount.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground">/mo</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/5">
                          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-2">Fund Examples:</p>
                          <div className="flex flex-wrap gap-2">
                            {split.funds.map((f, i) => (
                              <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-primary/20 text-foreground font-medium flex items-center gap-1.5 transition-colors">
                                <TrendingUp className="w-3 h-3 text-primary" />
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Right Panel: Growth Projections */}
            <motion.div variants={slideUpVariants} className="lg:col-span-1 space-y-6">
              <Card className="p-6 bg-card/40 border-white/10 flex flex-col justify-between h-full space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-lg">Growth Simulator</h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    See how your monthly SIP of ₹{investmentsBudget.toLocaleString()} will compound over time at an estimated rate of <span className="text-primary font-bold">{returnRate * 100}% p.a.</span>
                  </p>

                  <div className="space-y-5">
                    {projections.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span>{proj.label}</span>
                          <span className="text-primary font-mono">{proj.rateLabel} est.</span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Invested:</span>
                            <span className="font-mono text-muted-foreground">₹{proj.invested.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Expected Return:</span>
                            <span className="font-mono text-emerald-500 font-semibold">+₹{proj.returnsGained.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs pt-1.5 border-t border-white/5 font-semibold">
                            <span>Projected Wealth:</span>
                            <span className="font-mono text-foreground text-sm">₹{proj.projected.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <Progress value={100 - proj.gainPercentage} className="h-1.5 bg-emerald-500 [&>div]:bg-primary" />
                          <div className="flex justify-between text-[9px] text-muted-foreground">
                            <span>Invested ({100 - proj.gainPercentage}%)</span>
                            <span>Gains ({proj.gainPercentage}%)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-3 mt-6">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Projections are calculated based on monthly compounding. Mutual funds are subject to market risks, historical returns do not guarantee future performance.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
