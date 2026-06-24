"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowRight,
  Shield,
  Activity,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Calendar,
  Layers,
  RefreshCw,
  Target
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getDashboardData, markObligationPaid } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    setRefreshing(true);
    try {
      const dbData = await getDashboardData();
      if (dbData.profile && !dbData.profile.onboarded) {
        router.push("/onboarding");
        return;
      }
      setData(dbData);
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const handlePayBill = async (id: string) => {
    const success = await markObligationPaid(id);
    if (success) {
      loadDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <Layers className="h-10 w-10 text-accent animate-pulse" />
          <span className="text-sm font-semibold uppercase tracking-widest text-accent/80">Synchronizing Vault...</span>
        </div>
      </div>
    );
  }

  // Calculate Net Worth changes (Mock trend for visualization)
  const netWorthTrend = [
    { month: "Jan", value: data.netWorth.value - 60000 },
    { month: "Feb", value: data.netWorth.value - 45000 },
    { month: "Mar", value: data.netWorth.value - 25000 },
    { month: "Apr", value: data.netWorth.value - 15000 },
    { month: "May", value: data.netWorth.value - 5000 },
    { month: "Jun", value: data.netWorth.value }
  ];

  // Cash flow visual chart data
  const cashFlowTrend = [
    { category: "Inflow", amount: data.monthlyIncome, color: "#00E5A8" },
    { category: "Outflow", amount: data.monthlyExpensesTotal + data.emiTotal, color: "#FF5A5F" },
    { category: "Net Surplus", amount: data.monthlySurplus, color: "#00E676" }
  ];

  // Active Goals
  const activeGoals = data.goals.slice(0, 3);
  // Pending Obligations
  const pendingBills = data.obligations.filter((o: any) => o.status === "pending").slice(0, 3);

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white">Financial Command Center</h1>
            <p className="text-gray-400 text-xs mt-1">Real-time wealth aggregates, OCR vision transactions, and active goals.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboard}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-4 py-2 bg-muted/40 hover:bg-muted/80 border border-border/50 text-xs font-semibold text-white rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-accent" : ""}`} />
              {refreshing ? "Re-syncing..." : "Sync Systems"}
            </button>
            <Link
              href="/coach"
              className="flex items-center gap-1.5 px-4 py-2 bg-accent text-[#09090b] hover:bg-accent/90 text-xs font-bold rounded-lg transition duration-300 shadow-md shadow-accent/10"
            >
              <Sparkles className="h-3.5 w-3.5" /> AI Coach Prompt
            </Link>
          </div>
        </div>

        {/* HERO SECTION - Net Worth Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Net Worth Card */}
          <div className="lg:col-span-2 bg-[#111113] border border-border/40 rounded-xl p-6 relative overflow-hidden shadow-xl hover:border-accent/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Layers className="h-40 w-40 text-white" />
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">True Net Worth</span>
                <h2 className="text-4xl font-extrabold font-display text-white tracking-tight mt-1">
                  {formatINR(data.netWorth.value)}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-success font-semibold mt-2.5">
                  <TrendingUp className="h-4 w-4" />
                  <span>+₹45,000 this month (+5.2%)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Net Worth Formula</span>
                <span className="text-xs font-mono text-gray-300 mt-1 block bg-black/40 px-2.5 py-1 rounded border border-border/30">
                  {formatINR(data.netWorth.totalAssets)} (Assets) - {formatINR(data.netWorth.totalLiabilities)} (Liabilities)
                </span>
              </div>
            </div>

            {/* Sparkline trend */}
            <div className="h-28 mt-8 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthTrend}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00E5A8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111113", borderColor: "#27272A", color: "#FFF", borderRadius: "8px" }}
                    formatter={(val) => [formatINR(val as number), "Net Worth"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#00E5A8" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-accent/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Financial Health Score</span>
              <Shield className="h-4.5 w-4.5 text-accent" />
            </div>

            <div className="flex items-center justify-center my-4 relative">
              {/* Custom Circular Progress */}
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#1E1E22"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#00E5A8"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - (data.profile?.health_score || 80) / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: "drop-shadow(0 0 6px rgba(0, 229, 168, 0.4))" }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold font-display tracking-tight text-white block">
                    {data.profile?.health_score || 80}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block">Score</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-center text-gray-400">
                Score is <span className="text-accent font-semibold">Strong</span>. Your liquidity reserves and low credit card utilization contribute positively.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: CASH FLOW & EXPENSES */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Cash Flow Overview */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4">Monthly Cash Flow</span>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-black/30 p-3 rounded-lg border border-border/20 text-center">
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Inflow</span>
                <span className="text-sm font-bold text-accent block mt-1">{formatINR(data.monthlyIncome)}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-border/20 text-center">
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Outflow</span>
                <span className="text-sm font-bold text-error block mt-1">{formatINR(data.monthlyExpensesTotal + data.emiTotal)}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-border/20 text-center">
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Surplus</span>
                <span className="text-sm font-bold text-success block mt-1">{formatINR(data.monthlySurplus)}</span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowTrend} barSize={28}>
                  <XAxis dataKey="category" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111113", borderColor: "#27272A", borderRadius: "8px" }}
                    formatter={(val) => [formatINR(val as number), "Amount"]}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {cashFlowTrend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights & Alerts */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/20">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block">AI Advisor Highlight</span>
                <span className="flex items-center gap-1 text-[10px] bg-accent/10 border border-accent/20 px-2 py-0.5 rounded text-accent font-semibold">
                  <Sparkles className="h-3 w-3 animate-pulse" /> FinPilot Coach
                </span>
              </div>

              {/* Insights List */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 text-xs bg-error/10 border border-error/20 p-3 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-error block">High Credit Card Interest Risk</span>
                    <p className="text-gray-300 mt-0.5">Your credit card balance has an outstanding amount of ₹32,000 gathering 42.0% annual interest rate.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs bg-accent/10 border border-accent/20 p-3 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-accent block">Goal Acceleration Opportunity</span>
                    <p className="text-gray-300 mt-0.5">By increasing your monthly savings towards the Royal Enfield Bike by ₹3,000, you will reach it 1 month earlier.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/20 flex justify-end">
              <Link href="/coach" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                Open full Coach consultation <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 3: GOALS & UPCOMING OBLIGATIONS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Obligations */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Upcoming Obligations</span>
              <Link href="/obligations" className="text-xs font-bold text-accent hover:underline flex items-center gap-0.5">
                View Calendar <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {pendingBills.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">All obligations paid. Excellent job!</div>
            ) : (
              <div className="space-y-3">
                {pendingBills.map((ob: any) => (
                  <div key={ob.id} className="flex items-center justify-between p-3.5 bg-black/30 border border-border/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-semibold text-white block">{ob.name}</span>
                        <span className="text-[10px] text-gray-500 block uppercase tracking-wider mt-0.5">Due: {ob.due_date} | {ob.obligation_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <span className="text-sm font-bold text-white">{formatINR(ob.amount)}</span>
                      <button
                        onClick={() => handlePayBill(ob.id)}
                        className="px-3 py-1 bg-accent hover:bg-accent/80 text-[#09090b] text-xs font-bold rounded transition"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal Progress */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Saving Goal Progress</span>
              <Link href="/goals" className="text-xs font-bold text-accent hover:underline flex items-center gap-0.5">
                Manage Goals <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {activeGoals.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No active saving goals set up yet.</div>
            ) : (
              <div className="space-y-4">
                {activeGoals.map((g: any) => {
                  const pct = Math.min(Math.round((g.current_progress / g.target_amount) * 100), 100);
                  return (
                    <div key={g.id} className="bg-black/30 border border-border/20 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Target className="h-4.5 w-4.5 text-accent" /> {g.goal_name}
                        </span>
                        <span className="text-xs font-bold text-accent">{pct}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all duration-500 shadow-md shadow-accent/15"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Funded: {formatINR(g.current_progress)}</span>
                        <span>Target: {formatINR(g.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
