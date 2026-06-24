"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  AlertCircle, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  DollarSign
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getDashboardData } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";

export default function BudgetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    needs: false,
    wants: false,
    savings: false
  });

  async function loadBudget() {
    try {
      const dbData = await getDashboardData();
      setData(dbData);
    } catch (err) {
      console.error("Failed to load budget parameters", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudget();
  }, []);

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <Calculator className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  const { budgetRecommend, monthlyIncome, monthlyExpensesTotal, emiTotal } = data;

  // Actual values calculation from database
  // Needs: EMIs + Bills/Insurance obligations
  const actualNeeds = emiTotal + data.obligations
    .filter((o: any) => o.obligation_type === "emi" || o.obligation_type === "insurance" || o.obligation_type === "bills")
    .reduce((sum: number, o: any) => sum + Number(o.amount), 0);

  // Wants: Shopping + Entertainment expenses
  const actualWants = data.expenses
    .filter((e: any) => e.category === "shopping" || e.category === "entertainment" || e.category === "food")
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  // Calculate actual monthly savings allocations (SIPs, monthly goals targets, emergency buffers)
  const goalMonthlyAllocations = data.goals.reduce((sum: number, g: any) => sum + Number(g.required_monthly_savings || 0), 0);
  
  const assetSIPAllocations = data.assets
    .filter((a: any) => ["mutual_fund", "stock", "gold"].includes(a.asset_type))
    .reduce((sum: number, a: any) => {
      if (a.asset_type === "mutual_fund") return sum + 15000;
      if (a.asset_type === "gold") return sum + 5000;
      if (a.asset_type === "stock") return sum + 10000;
      return sum;
    }, 0);

  const emergencyAllocation = Math.round(budgetRecommend.emergencyFundAllocation || 5550);
  const actualSavings = goalMonthlyAllocations + assetSIPAllocations + emergencyAllocation;

  const budgetItems = [
    {
      key: "needs",
      name: "Essential Needs (50%)",
      recommended: budgetRecommend.needs,
      actual: actualNeeds,
      description: "Home rent, EMIs, insurance premium bills, electricity, utilities.",
      color: "#3B82F6",
      type: "limit" as const,
      items: [
        ...data.liabilities.map((l: any) => ({ name: `${l.liability_name} (Liability EMI)`, amount: l.emi })),
        ...data.obligations
          .filter((o: any) => o.obligation_type === "emi" || o.obligation_type === "insurance" || o.obligation_type === "bills")
          .map((o: any) => ({ name: `${o.name} (${o.obligation_type} obligation)`, amount: o.amount }))
      ]
    },
    {
      key: "wants",
      name: "Lifestyle Wants (30%)",
      recommended: budgetRecommend.wants,
      actual: actualWants,
      description: "Dining out, shopping, Netflix, custom goals entertainment, vacations.",
      color: "#EC4899",
      type: "limit" as const,
      items: data.expenses
        .filter((e: any) => e.category === "shopping" || e.category === "entertainment" || e.category === "food")
        .map((e: any) => ({ name: e.merchant_name, amount: e.amount, details: `${e.category} • ${e.date}` }))
    },
    {
      key: "savings",
      name: "Savings & Investments (20%)",
      recommended: budgetRecommend.savings,
      actual: actualSavings,
      description: "Mutual fund index funds, SIPs, gold, emergency fund stash.",
      color: "#00E5A8",
      type: "target" as const,
      items: [
        ...data.assets
          .filter((a: any) => ["mutual_fund", "stock", "gold"].includes(a.asset_type))
          .map((a: any) => {
            let sip = 15000;
            if (a.asset_type === "gold") sip = 5000;
            if (a.asset_type === "stock") sip = 10000;
            return { name: `${a.asset_name} (Monthly SIP)`, amount: sip };
          }),
        ...data.goals.map((g: any) => ({ name: `${g.goal_name} (Monthly Goal Allocation)`, amount: g.required_monthly_savings || 0 })),
        { name: "Emergency Buffer Cash Reserve (Monthly Allocation)", amount: emergencyAllocation }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <Calculator className="h-7 w-7 text-accent" /> 50/30/20 Budget Architect
            </h1>
            <p className="text-gray-400 text-xs mt-1">Simulate budgeting recommended envelopes based on verified liabilities, income streams, and goals.</p>
          </div>
        </div>

        {/* Overview cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#111113] border border-border/40 p-4.5 rounded-xl shadow-xl">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider">Income base</span>
            <span className="text-xl font-bold text-white block mt-1 tracking-tight">{formatINR(monthlyIncome)}</span>
          </div>
          <div className="bg-[#111113] border border-border/40 p-4.5 rounded-xl shadow-xl">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider">Needs allocation (Max 50%)</span>
            <span className="text-xl font-bold text-[#3B82F6] block mt-1 tracking-tight">{formatINR(budgetRecommend.needs)}</span>
          </div>
          <div className="bg-[#111113] border border-border/40 p-4.5 rounded-xl shadow-xl">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider">Wants limit (Max 30%)</span>
            <span className="text-xl font-bold text-[#EC4899] block mt-1 tracking-tight">{formatINR(budgetRecommend.wants)}</span>
          </div>
          <div className="bg-[#111113] border border-border/40 p-4.5 rounded-xl shadow-xl">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider">Savings threshold (Min 20%)</span>
            <span className="text-xl font-bold text-accent block mt-1 tracking-tight">{formatINR(budgetRecommend.savings)}</span>
          </div>
        </section>

        {/* Comparative Envelopes Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Comparative Progress cards */}
          <div className="lg:col-span-2 bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-6">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-2 pb-2 border-b border-border/20">Budget envelope comparison</span>

            <div className="space-y-6">
              {budgetItems.map((item, idx) => {
                // Determine statuses based on limit vs target
                const isLimit = item.type === "limit";
                const isOver = isLimit && item.actual > item.recommended;
                const isShortfall = !isLimit && item.actual < item.recommended;

                // Adjust progress ratio representation (cap visually at 150%)
                const rawRatio = item.recommended > 0 ? (item.actual / item.recommended) * 100 : 0;
                const progressWidthRatio = Math.min(Math.round(rawRatio), 150);

                return (
                  <div key={idx} className="bg-black/30 border border-border/20 p-5 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white block">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">Actual: {formatINR(item.actual)}</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Budget: {formatINR(item.recommended)}</span>
                      </div>
                    </div>

                    {/* Progress Bar comparison */}
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${progressWidthRatio}%`,
                            backgroundColor: isOver ? "#FF5A5F" : isShortfall ? "#FFB020" : item.color
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-medium">
                        <span style={{ color: isOver ? "#FF5A5F" : isShortfall ? "#FFB020" : "#9CA3AF" }}>
                          {Math.round(rawRatio)}% of budget allocation used
                        </span>
                        
                        {/* Inline Badging */}
                        {isOver && (
                          <span className="text-[#FF5A5F] flex items-center gap-1 font-bold">
                            <AlertTriangle className="h-3 w-3" /> Over Limit
                          </span>
                        )}
                        {isShortfall && (
                          <span className="text-[#FFB020] flex items-center gap-1 font-bold">
                            <AlertCircle className="h-3 w-3" /> Shortfall
                          </span>
                        )}
                        {!isLimit && !isShortfall && (
                          <span className="text-accent flex items-center gap-1 font-bold">
                            <ShieldCheck className="h-3 w-3" /> Target Met
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Highly Structured, Neat Warning & Success Banners */}
                    {isOver && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2.5 text-xs text-red-400 animate-fadeIn">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-[#FF5A5F] mt-0.5" />
                        <div>
                          <span className="font-bold text-white block">Budget Overrun Alert</span>
                          <p className="opacity-80 mt-0.5">Expenses in this category exceed the recommended 50/30/20 maximum cap. Review the detailed item list below to cut back on discretionary outflows.</p>
                        </div>
                      </div>
                    )}

                    {isShortfall && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-400 animate-fadeIn">
                        <AlertCircle className="h-4 w-4 shrink-0 text-[#FFB020] mt-0.5" />
                        <div>
                          <span className="font-bold text-white block">Savings Target Warning</span>
                          <p className="opacity-80 mt-0.5">Your monthly savings rate is currently lower than the recommended 20% minimum rate. Allocate surplus income into SIPs or goal contributions.</p>
                        </div>
                      </div>
                    )}

                    {!isLimit && !isShortfall && (
                      <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-start gap-2.5 text-xs text-accent animate-fadeIn">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                        <div>
                          <span className="font-bold text-white block">Savings Target Exceeded</span>
                          <p className="opacity-80 mt-0.5">Superb! Your current capital allocation meets the minimum 20% investment requirements. Leftover reserves are protected as liquid net surplus.</p>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Dropdown Toggle */}
                    <div className="pt-2 border-t border-border/10 flex justify-between items-center text-[10px]">
                      <span className="text-gray-500 font-medium">
                        {item.items.length} dynamic parameters active
                      </span>
                      <button
                        onClick={() => toggleExpand(item.key)}
                        className="flex items-center gap-1.5 text-accent hover:text-accent/80 font-bold transition"
                      >
                        {expanded[item.key] ? (
                          <>Hide Items <ChevronUp className="h-3.5 w-3.5" /></>
                        ) : (
                          <>View Details Breakdown <ChevronDown className="h-3.5 w-3.5" /></>
                        )}
                      </button>
                    </div>

                    {/* Detailed Collapsible list drawer */}
                    {expanded[item.key] && (
                      <div className="bg-black/40 border border-border/30 rounded-lg divide-y divide-border/20 max-h-48 overflow-y-auto no-scrollbar animate-fadeIn">
                        {item.items.length === 0 ? (
                          <div className="p-3 text-center text-xs text-gray-500">No active parameters logged in this envelope.</div>
                        ) : (
                          item.items.map((sub: any, sIdx: number) => (
                            <div key={sIdx} className="p-2.5 flex justify-between items-center text-xs hover:bg-[#111113]/40 transition">
                              <div className="min-w-0 pr-3">
                                <span className="text-gray-300 font-semibold block truncate">{sub.name}</span>
                                {sub.details && (
                                  <span className="text-[9px] text-gray-500 block mt-0.5">{sub.details}</span>
                                )}
                              </div>
                              <span className="text-white font-mono font-semibold shrink-0">
                                {formatINR(sub.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-allocations of savings envelope */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20">Recommended Savings Split</span>
              
              <div className="space-y-4">
                <div className="p-3.5 bg-black/30 border border-border/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-accent" />
                    <div>
                      <span className="text-xs font-semibold text-white block">Investments Allocation</span>
                      <span className="text-[9px] text-gray-500 block mt-0.5">Index stock funds, SIPs, gold</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">{formatINR(budgetRecommend.investments)}</span>
                </div>

                <div className="p-3.5 bg-black/30 border border-border/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-[#3B82F6]" />
                    <div>
                      <span className="text-xs font-semibold text-white block">Goal Contributions</span>
                      <span className="text-[9px] text-gray-500 block mt-0.5">Saving targets backing goals</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">{formatINR(budgetRecommend.goalContributions)}</span>
                </div>

                <div className="p-3.5 bg-black/30 border border-border/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-[#FFB020]" />
                    <div>
                      <span className="text-xs font-semibold text-white block">Emergency Buffer</span>
                      <span className="text-[9px] text-gray-500 block mt-0.5">Liquid cash for contingency</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">{formatINR(budgetRecommend.emergencyFundAllocation)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-muted/20 border border-border/40 p-3.5 rounded-lg text-[11px] text-gray-400">
              Note: The 50/30/20 guide represents optimal capital management thresholds. Custom allocation modeling can be requested from the **AI Coach**.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
