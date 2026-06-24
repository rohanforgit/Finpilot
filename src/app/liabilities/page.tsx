"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, CreditCard, Percent, Calendar, ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getDashboardData, addLiability, deleteLiability } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";

const LIABILITY_TYPES = [
  { value: "credit_card", label: "Credit Card", icon: CreditCard, color: "#FF5A5F" },
  { value: "personal_loan", label: "Personal Loan", icon: Sparkles, color: "#FFB020" },
  { value: "vehicle_loan", label: "Vehicle Loan", icon: Calendar, color: "#3B82F6" },
  { value: "home_loan", label: "Home Loan", icon: Percent, color: "#10B981" },
  { value: "education_loan", label: "Education Loan", icon: ShieldAlert, color: "#8B5CF6" },
];

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // Form State
  const [liabilityName, setLiabilityName] = useState("");
  const [liabilityType, setLiabilityType] = useState("personal_loan");
  const [outstandingAmount, setOutstandingAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [remainingTenure, setRemainingTenure] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadLiabilities() {
    try {
      const data = await getDashboardData();
      setLiabilities(data.liabilities);
    } catch (err) {
      console.error("Failed to load liabilities", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLiabilities();
  }, []);

  const handleAddLiability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityName || !outstandingAmount || !interestRate || !remainingTenure) return;

    setSubmitting(true);
    try {
      await addLiability({
        liability_name: liabilityName,
        liability_type: liabilityType,
        outstanding_amount: Number(outstandingAmount),
        interest_rate: Number(interestRate),
        remaining_tenure_months: Number(remainingTenure)
      });
      setLiabilityName("");
      setOutstandingAmount("");
      setInterestRate("");
      setRemainingTenure("");
      setFormOpen(false);
      loadLiabilities();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to write-off or remove this liability entry?")) {
      const success = await deleteLiability(id);
      if (success) {
        loadLiabilities();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <CreditCard className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  const totalDebt = liabilities.reduce((sum, item) => sum + Number(item.outstanding_amount), 0);
  const totalEmi = liabilities.reduce((sum, item) => sum + Number(item.emi), 0);

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <TrendingDown className="h-7 w-7 text-error" /> Debt & Liabilities
            </h1>
            <p className="text-gray-400 text-xs mt-1">Track outstanding balances, Equated Monthly Installments, and interest rates.</p>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-error/15 text-error border border-error/30 hover:bg-error/30 text-xs font-bold rounded-lg transition duration-300 shadow-md"
          >
            <Plus className="h-4 w-4" /> Declare Liability Account
          </button>
        </div>

        {/* Add Form */}
        {formOpen && (
          <form onSubmit={handleAddLiability} className="bg-[#111113] border border-border/40 p-6 rounded-xl space-y-4 max-w-xl">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-error">Record Liability Account</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Liability Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICICI Personal Loan"
                  value={liabilityName}
                  onChange={(e) => setLiabilityName(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Debt Category</label>
                <select
                  value={liabilityType}
                  onChange={(e) => setLiabilityType(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                >
                  {LIABILITY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Outstanding Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 540000"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(e.target.value)}
                    className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Interest Rate (% APR)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 8.75"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500">%</span>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Tenure (Months)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 42"
                  value={remainingTenure}
                  onChange={(e) => setRemainingTenure(e.target.value)}
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
                className="px-4 py-2 bg-error text-white font-bold rounded-lg text-xs hover:bg-error/80 transition disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Commit Debt Account"}
              </button>
            </div>
          </form>
        )}

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center pb-4 border-b border-border/20 mb-4">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Active Liabilities catalog</span>
                <span className="text-xs text-error font-semibold">Total Debt: {formatINR(totalDebt)}</span>
              </div>

              {liabilities.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">No recorded debts. Congratulations on being debt-free!</div>
              ) : (
                <div className="space-y-4">
                  {liabilities.map(item => {
                    const typeConfig = LIABILITY_TYPES.find(t => t.value === item.liability_type);
                    const Icon = typeConfig?.icon || CreditCard;
                    return (
                      <div key={item.id} className="p-4 bg-black/30 border border-border/20 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 group">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-black/40 border border-border/30 flex items-center justify-center text-gray-400 group-hover:border-error/30 group-hover:text-error transition">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white block">{item.liability_name}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-0.5">{typeConfig?.label} | {item.interest_rate}% APR</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-center md:text-right">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-500 block">Outstanding</span>
                            <span className="text-xs font-bold text-white mt-1 block">{formatINR(item.outstanding_amount)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-500 block">Monthly EMI</span>
                            <span className="text-xs font-bold text-white mt-1 block">
                              {item.emi > 0 ? formatINR(item.emi) : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-500 block">Remaining</span>
                            <span className="text-xs font-semibold text-gray-300 mt-1 block">{item.remaining_tenure_months} months</span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-500 hover:text-error transition p-1.5 rounded hover:bg-muted/40"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Aggregates Summary */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20">Debt aggregates</span>

              <div className="space-y-4">
                <div className="bg-black/30 p-4 rounded-xl border border-border/20 text-center">
                  <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Monthly EMI Drain</span>
                  <span className="text-2xl font-extrabold text-error block mt-1 tracking-tight">{formatINR(totalEmi)}</span>
                </div>

                {/* Warning Card */}
                {liabilities.some(l => l.interest_rate > 20) && (
                  <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-error">
                      <ShieldAlert className="h-4.5 w-4.5" /> High APR Interest Warning
                    </div>
                    <p className="text-gray-300">
                      You have credit cards or revolving balances with interest rates exceeding 20.0% APR.
                      The AI coach suggests paying down high-APR debt before placing extra cash in low-yield assets.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center font-medium mt-4">
              All monthly loan interest formulas computed server-side for 100% precision.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
