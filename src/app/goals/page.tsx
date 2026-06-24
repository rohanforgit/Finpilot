"use client";

import React, { useState, useEffect } from "react";
import { Plus, Target, PiggyBank, Calendar, ShieldCheck, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getDashboardData, addGoal, addGoalContribution } from "@/app/actions/finance";
import { formatINR, calculateGoalFeasibility } from "@/lib/utils";

const GOAL_TYPES = [
  { value: "bike", label: "Two Wheeler / Bike" },
  { value: "car", label: "Four Wheeler / Car" },
  { value: "house", label: "Property / House" },
  { value: "vacation", label: "Vacation / Travel" },
  { value: "education", label: "Education / Degrees" },
  { value: "custom", label: "Custom Asset Target" },
];

export default function GoalsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [contributionOpen, setContributionOpen] = useState<string | null>(null);

  // New Goal Form State
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState("car");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Contribution Form State
  const [contribAmount, setContribAmount] = useState("");
  const [contribSubmitting, setContribSubmitting] = useState(false);

  async function loadGoals() {
    try {
      const dbData = await getDashboardData();
      setData(dbData);
    } catch (err) {
      console.error("Failed to load goals", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmount) return;

    setSubmitting(true);
    try {
      await addGoal({
        goal_name: goalName,
        goal_type: goalType,
        target_amount: Number(targetAmount),
        target_date: targetDate || undefined
      });
      setGoalName("");
      setTargetAmount("");
      setTargetDate("");
      setFormOpen(false);
      loadGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributionOpen || !contribAmount) return;

    setContribSubmitting(true);
    try {
      await addGoalContribution(contributionOpen, Number(contribAmount));
      setContribAmount("");
      setContributionOpen(null);
      loadGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setContribSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <Target className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  const { goals, monthlyIncome, monthlySurplus } = data;

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <Target className="h-7 w-7 text-accent animate-pulse" /> Saving Goals Command
            </h1>
            <p className="text-gray-400 text-xs mt-1">Plan savings targets, allocate surpluses, and monitor feasibility metrics.</p>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent text-[#09090b] hover:bg-accent/90 text-xs font-bold rounded-lg transition duration-300 shadow-md"
          >
            <Plus className="h-4 w-4" /> Create New Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {formOpen && (
          <form onSubmit={handleAddGoal} className="bg-[#111113] border border-border/40 p-6 rounded-xl space-y-4 max-w-xl">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Initialize Goal Target</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Goal Milestone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BMW Car Downpayment"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Milestone Category</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                >
                  {GOAL_TYPES.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Target Capital Required</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 350000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Target Date (Optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-accent text-[#09090b] rounded-lg text-xs font-bold hover:bg-accent/80 transition"
              >
                {submitting ? "Processing..." : "Commit Goal"}
              </button>
            </div>
          </form>
        )}

        {/* Dynamic contribution modal */}
        {contributionOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <form onSubmit={handleContribute} className="bg-[#111113] border border-border/40 p-6 rounded-2xl w-full max-w-sm space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-accent animate-bounce" /> Save Cash Contribution
              </h3>
              <p className="text-xs text-gray-400">Specify the capital sum you are moving into this goal container.</p>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Amount (Rupees)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(e.target.value)}
                    className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setContributionOpen(null)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contribSubmitting}
                  className="px-4 py-2 bg-accent text-[#09090b] rounded-lg text-xs font-bold hover:bg-accent/80 transition"
                >
                  {contribSubmitting ? "Locking..." : "Lock Savings"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals Catalog layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {goals.length === 0 ? (
            <div className="lg:col-span-2 text-center py-20 bg-[#111113] border border-border/40 rounded-xl text-gray-500 text-sm">
              No saving goals registered. Click Create New Goal to get started!
            </div>
          ) : (
            goals.map((item: any) => {
              const { feasibilityScore, affordabilityScore, projectedCompletionDate, requiredMonthlySavings } =
                calculateGoalFeasibility(item, monthlyIncome, monthlySurplus);

              const progressPct = Math.min(Math.round((item.current_progress / item.target_amount) * 100), 100);

              return (
                <div key={item.id} className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl flex flex-col justify-between space-y-6 hover:border-accent/20 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-black/30 border border-border/30 flex items-center justify-center text-accent">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">{item.goal_name}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-0.5">{item.goal_type}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      {progressPct}% Completed
                    </span>
                  </div>

                  {/* Savings Progress Meter */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-accent h-2.5 rounded-full shadow-md shadow-accent/15"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-400">
                      <span>Valued: {formatINR(item.current_progress)}</span>
                      <span>Target: {formatINR(item.target_amount)}</span>
                    </div>
                  </div>

                  {/* Feasibility/Affordability Metrics Dashboard */}
                  <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-border/20">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">Feasibility Score</span>
                      <span className={`text-xs font-bold mt-1.5 block flex items-center gap-1 ${feasibilityScore > 75 ? "text-success" : feasibilityScore > 40 ? "text-warning" : "text-error"}`}>
                        <Sparkles className="h-3.5 w-3.5" /> {feasibilityScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">Affordability Score</span>
                      <span className={`text-xs font-bold mt-1.5 block flex items-center gap-1 ${affordabilityScore > 75 ? "text-success" : affordabilityScore > 40 ? "text-warning" : "text-error"}`}>
                        <ShieldCheck className="h-3.5 w-3.5" /> {affordabilityScore}/100
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border/10">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">Needed Monthly Savings</span>
                      <span className="text-xs font-extrabold text-white mt-1 block">{formatINR(requiredMonthlySavings)}/mo</span>
                    </div>
                    <div className="pt-2 border-t border-border/10">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">Est. Completion Target</span>
                      <span className="text-xs font-semibold text-gray-300 mt-1 block flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-accent" /> {projectedCompletionDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setContributionOpen(item.id)}
                      className="px-4 py-2 bg-accent text-[#09090b] hover:bg-accent/80 text-xs font-bold rounded-lg transition duration-200 flex items-center gap-1"
                    >
                      <PiggyBank className="h-4 w-4" /> Contribute Savings
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
