"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Target,
  Sparkles,
  Plus,
  Trash2
} from "lucide-react";
import { saveOnboardingData } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Identity & Income", description: "Who are you and what do you earn?", icon: DollarSign },
  { id: 2, title: "Active Assets", description: "What do you own?", icon: TrendingUp },
  { id: 3, title: "Liabilities & Debt", description: "What do you owe?", icon: CreditCard },
  { id: 4, title: "Obligations", description: "What are your recurring bills?", icon: Calendar },
  { id: 5, title: "Financial Goals", description: "What are we aiming for?", icon: Target }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState("Aarav Sharma");

  // Income sources state
  const [incomes, setIncomes] = useState([
    { source_name: "Primary Salary", amount: 145000, frequency: "monthly" as const }
  ]);

  // Assets state
  const [assets, setAssets] = useState([
    { asset_name: "HDFC Bank Savings", asset_type: "bank_account", current_value: 320000 },
    { asset_name: "Nippon India Mutual Fund", asset_type: "mutual_fund", current_value: 450000 }
  ]);

  // Liabilities state
  const [liabilities, setLiabilities] = useState([
    { liability_name: "Kia Seltos Car Loan", liability_type: "vehicle_loan", outstanding_amount: 540000, interest_rate: 8.75, remaining_tenure_months: 42 }
  ]);

  // Obligations state
  const [obligations, setObligations] = useState([
    { name: "YouTube Premium Subscription", obligation_type: "subscription", amount: 189, due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }
  ]);

  // Goals state
  const [goals, setGoals] = useState([
    { goal_name: "Royal Enfield Himalayan", goal_type: "bike", target_amount: 320000, target_date: new Date(Date.now() + 20 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }
  ]);

  const [loading, setLoading] = useState(false);

  // Navigation helpers
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Dynamic state helpers
  const addIncome = () => setIncomes([...incomes, { source_name: "", amount: 0, frequency: "monthly" }]);
  const removeIncome = (idx: number) => setIncomes(incomes.filter((_, i) => i !== idx));

  const addAsset = () => setAssets([...assets, { asset_name: "", asset_type: "bank_account", current_value: 0 }]);
  const removeAsset = (idx: number) => setAssets(assets.filter((_, i) => i !== idx));

  const addLiability = () => setLiabilities([...liabilities, { liability_name: "", liability_type: "personal_loan", outstanding_amount: 0, interest_rate: 10.5, remaining_tenure_months: 12 }]);
  const removeLiability = (idx: number) => setLiabilities(liabilities.filter((_, i) => i !== idx));

  const addObligation = () => setObligations([...obligations, { name: "", obligation_type: "subscription", amount: 0, due_date: new Date().toISOString().split("T")[0] }]);
  const removeObligation = (idx: number) => setObligations(obligations.filter((_, i) => i !== idx));

  const addGoal = () => setGoals([...goals, { goal_name: "", goal_type: "custom", target_amount: 0, target_date: "" }]);
  const removeGoal = (idx: number) => setGoals(goals.filter((_, i) => i !== idx));

  // Handle final submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        fullName,
        incomes: incomes.filter(i => i.source_name !== "" && i.amount > 0),
        assets: assets.filter(a => a.asset_name !== "" && a.current_value > 0),
        liabilities: liabilities.filter(l => l.liability_name !== "" && l.outstanding_amount > 0),
        obligations: obligations.filter(o => o.name !== "" && o.amount > 0),
        goals: goals.filter(g => g.goal_name !== "" && g.target_amount > 0)
      };
      await saveOnboardingData(payload);
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to submit onboarding data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090B] flex flex-col justify-between py-12 px-6 text-white select-none">
      {/* Top Header Branding */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Layers className="h-8 w-8 text-accent animate-pulse" />
          <div>
            <span className="font-display font-extrabold text-xl text-white tracking-widest">FINPILOT</span>
            <span className="text-[10px] text-accent font-semibold uppercase tracking-widest block">Operating System</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Step {currentStep} of {STEPS.length}
        </div>
      </div>

      {/* Main Form Center */}
      <div className="max-w-4xl w-full mx-auto my-12 bg-[#111113] border border-border/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Step Info */}
        <div className="mb-8 border-b border-border/20 pb-6">
          <div className="flex items-center space-x-3 mb-2">
            {React.createElement(STEPS[currentStep - 1].icon, { className: "h-6 w-6 text-accent" })}
            <h2 className="text-2xl font-bold font-display text-white">{STEPS[currentStep - 1].title}</h2>
          </div>
          <p className="text-gray-400 text-sm">{STEPS[currentStep - 1].description}</p>
        </div>

        {/* Form Body */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: IDENTITY & INCOME */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Income Streams</label>
                      <button onClick={addIncome} className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 hover:bg-accent/20 transition">
                        <Plus className="h-3 w-3" /> Add Income
                      </button>
                    </div>

                    {incomes.map((inc, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/25 p-4 rounded-xl border border-border/20">
                        <input
                          type="text"
                          value={inc.source_name}
                          onChange={(e) => {
                            const copy = [...incomes];
                            copy[index].source_name = e.target.value;
                            setIncomes(copy);
                          }}
                          placeholder="e.g. Salary"
                          className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-gray-400">₹</span>
                          <input
                            type="number"
                            value={inc.amount || ""}
                            onChange={(e) => {
                              const copy = [...incomes];
                              copy[index].amount = Number(e.target.value);
                              setIncomes(copy);
                            }}
                            placeholder="Amount"
                            className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={inc.frequency}
                            onChange={(e) => {
                              const copy = [...incomes];
                              copy[index].frequency = e.target.value as any;
                              setIncomes(copy);
                            }}
                            className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white flex-1"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="annually">Annually</option>
                          </select>
                          {incomes.length > 1 && (
                            <button onClick={() => removeIncome(index)} className="text-gray-500 hover:text-error transition p-2">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: ASSETS */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">What assets do you hold?</label>
                    <button onClick={addAsset} className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 hover:bg-accent/20 transition">
                      <Plus className="h-3 w-3" /> Add Asset
                    </button>
                  </div>

                  {assets.map((ast, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/25 p-4 rounded-xl border border-border/20">
                      <input
                        type="text"
                        value={ast.asset_name}
                        onChange={(e) => {
                          const copy = [...assets];
                          copy[index].asset_name = e.target.value;
                          setAssets(copy);
                        }}
                        placeholder="e.g. Gold Coins, HDFC Account"
                        className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                      />
                      <select
                        value={ast.asset_type}
                        onChange={(e) => {
                          const copy = [...assets];
                          copy[index].asset_type = e.target.value;
                          setAssets(copy);
                        }}
                        className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_account">Bank Account</option>
                        <option value="fixed_deposit">Fixed Deposit</option>
                        <option value="mutual_fund">Mutual Fund</option>
                        <option value="stock">Stock Equity</option>
                        <option value="gold">Gold</option>
                        <option value="epf">EPF (Employee Provident Fund)</option>
                        <option value="real_estate">Real Estate</option>
                      </select>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-xs text-gray-400">₹</span>
                          <input
                            type="number"
                            value={ast.current_value || ""}
                            onChange={(e) => {
                              const copy = [...assets];
                              copy[index].current_value = Number(e.target.value);
                              setAssets(copy);
                            }}
                            placeholder="Current Value"
                            className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                          />
                        </div>
                        {assets.length > 1 && (
                          <button onClick={() => removeAsset(index)} className="text-gray-500 hover:text-error transition p-2">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: LIABILITIES & DEBT */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Do you have outstanding loans/debts?</label>
                    <button onClick={addLiability} className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 hover:bg-accent/20 transition">
                      <Plus className="h-3 w-3" /> Add Loan/Debt
                    </button>
                  </div>

                  {liabilities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No debts declared. Click add if you have car loans or credit cards.</div>
                  ) : (
                    liabilities.map((liab, index) => (
                      <div key={index} className="bg-black/25 p-4 rounded-xl border border-border/20 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={liab.liability_name}
                            onChange={(e) => {
                              const copy = [...liabilities];
                              copy[index].liability_name = e.target.value;
                              setLiabilities(copy);
                            }}
                            placeholder="e.g. HDFC Home Loan"
                            className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                          />
                          <select
                            value={liab.liability_type}
                            onChange={(e) => {
                              const copy = [...liabilities];
                              copy[index].liability_type = e.target.value;
                              setLiabilities(copy);
                            }}
                            className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                          >
                            <option value="credit_card">Credit Card Balance</option>
                            <option value="personal_loan">Personal Loan</option>
                            <option value="vehicle_loan">Vehicle Loan</option>
                            <option value="home_loan">Home Loan</option>
                            <option value="education_loan">Education Loan</option>
                          </select>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs text-gray-400">₹</span>
                            <input
                              type="number"
                              value={liab.outstanding_amount || ""}
                              onChange={(e) => {
                                const copy = [...liabilities];
                                copy[index].outstanding_amount = Number(e.target.value);
                                setLiabilities(copy);
                              }}
                              placeholder="Outstanding Amount"
                              className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              value={liab.interest_rate || ""}
                              onChange={(e) => {
                                const copy = [...liabilities];
                                copy[index].interest_rate = Number(e.target.value);
                                setLiabilities(copy);
                              }}
                              placeholder="Interest Rate (% APR)"
                              className="w-full bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-gray-500">%</span>
                          </div>
                          <input
                            type="number"
                            value={liab.remaining_tenure_months || ""}
                            onChange={(e) => {
                              const copy = [...liabilities];
                              copy[index].remaining_tenure_months = Number(e.target.value);
                              setLiabilities(copy);
                            }}
                            placeholder="Tenure (Months)"
                            className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">Auto-Calculates EMI</span>
                            <button onClick={() => removeLiability(index)} className="text-gray-500 hover:text-error transition p-2">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* STEP 4: OBLIGATIONS & RECURRING BILLS */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recurring Payments & Subscriptions</label>
                    <button onClick={addObligation} className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 hover:bg-accent/20 transition">
                      <Plus className="h-3 w-3" /> Add Bill/Sub
                    </button>
                  </div>

                  {obligations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No recurring bills declared.</div>
                  ) : (
                    obligations.map((ob, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-black/25 p-4 rounded-xl border border-border/20">
                        <input
                          type="text"
                          value={ob.name}
                          onChange={(e) => {
                            const copy = [...obligations];
                            copy[index].name = e.target.value;
                            setObligations(copy);
                          }}
                          placeholder="e.g. Netflix Subscription"
                          className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                        />
                        <select
                          value={ob.obligation_type}
                          onChange={(e) => {
                            const copy = [...obligations];
                            copy[index].obligation_type = e.target.value;
                            setObligations(copy);
                          }}
                          className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                        >
                          <option value="subscription">Subscription</option>
                          <option value="insurance">Insurance Premium</option>
                          <option value="emi">Other Debt Payment</option>
                          <option value="credit_card_bill">Credit Card Bill</option>
                          <option value="custom">Custom Bill</option>
                        </select>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-gray-400">₹</span>
                          <input
                            type="number"
                            value={ob.amount || ""}
                            onChange={(e) => {
                              const copy = [...obligations];
                              copy[index].amount = Number(e.target.value);
                              setObligations(copy);
                            }}
                            placeholder="Amount"
                            className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="date"
                            value={ob.due_date}
                            onChange={(e) => {
                              const copy = [...obligations];
                              copy[index].due_date = e.target.value;
                              setObligations(copy);
                            }}
                            className="bg-black/40 border border-border/50 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-accent text-white flex-1"
                          />
                          <button onClick={() => removeObligation(index)} className="text-gray-500 hover:text-error transition p-2">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* STEP 5: GOALS */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">What are you saving up for?</label>
                    <button onClick={addGoal} className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 hover:bg-accent/20 transition">
                      <Plus className="h-3 w-3" /> Add Goal
                    </button>
                  </div>

                  {goals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No milestones declared.</div>
                  ) : (
                    goals.map((g, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-black/25 p-4 rounded-xl border border-border/20">
                        <input
                          type="text"
                          value={g.goal_name}
                          onChange={(e) => {
                            const copy = [...goals];
                            copy[index].goal_name = e.target.value;
                            setGoals(copy);
                          }}
                          placeholder="e.g. Car Down Payment"
                          className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                        />
                        <select
                          value={g.goal_type}
                          onChange={(e) => {
                            const copy = [...goals];
                            copy[index].goal_type = e.target.value;
                            setGoals(copy);
                          }}
                          className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                        >
                          <option value="bike">Bike</option>
                          <option value="car">Car</option>
                          <option value="house">House</option>
                          <option value="vacation">Vacation</option>
                          <option value="education">Education</option>
                          <option value="custom">Custom Goal</option>
                        </select>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-gray-400">₹</span>
                          <input
                            type="number"
                            value={g.target_amount || ""}
                            onChange={(e) => {
                              const copy = [...goals];
                              copy[index].target_amount = Number(e.target.value);
                              setGoals(copy);
                            }}
                            placeholder="Target Amount"
                            className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="date"
                            value={g.target_date}
                            onChange={(e) => {
                              const copy = [...goals];
                              copy[index].target_date = e.target.value;
                              setGoals(copy);
                            }}
                            className="bg-black/40 border border-border/50 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-accent text-white flex-1"
                          />
                          <button onClick={() => removeGoal(index)} className="text-gray-500 hover:text-error transition p-2">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Controls */}
        <div className="mt-12 border-t border-border/20 pt-6 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold border border-border text-gray-300 hover:text-white hover:bg-muted/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>

          {currentStep === STEPS.length ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold bg-accent text-[#09090b] hover:bg-accent/80 transition duration-300 shadow-lg shadow-accent/15"
            >
              {loading ? "Optimizing Portfolio..." : "Establish Command Center"}
              <Sparkles className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-[#09090b] hover:bg-white/80 transition duration-300"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer message */}
      <div className="text-center text-xs text-gray-600 font-medium">
        FinPilot AI operates local sandboxed computations. Your metrics are encrypted on-device.
      </div>
    </main>
  );
}
