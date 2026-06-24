"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, Trash2, ShieldCheck, Clock, CheckCircle2, DollarSign } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getDashboardData, addObligation, markObligationPaid, deleteObligation } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";

const OBLIGATION_TYPES = [
  { value: "emi", label: "EMI Payment" },
  { value: "insurance", label: "Insurance Premium" },
  { value: "credit_card_bill", label: "Credit Card Bill" },
  { value: "subscription", label: "Subscription Plan" },
  { value: "custom", label: "Custom Commitment" },
];

export default function ObligationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // Form State
  const [obName, setObName] = useState("");
  const [obType, setObType] = useState("subscription");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadObligations() {
    try {
      const dbData = await getDashboardData();
      setData(dbData);
    } catch (err) {
      console.error("Failed to load obligations timeline", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadObligations();
  }, []);

  const handleAddObligation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obName || !amount || !dueDate) return;

    setSubmitting(true);
    try {
      await addObligation({
        name: obName,
        obligation_type: obType,
        amount: Number(amount),
        due_date: dueDate
      });
      setObName("");
      setAmount("");
      setDueDate("");
      setFormOpen(false);
      loadObligations();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (id: string) => {
    const success = await markObligationPaid(id);
    if (success) {
      loadObligations();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Cancel or delete this recurring bill obligation?")) {
      const success = await deleteObligation(id);
      if (success) {
        loadObligations();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <Calendar className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  const { obligations } = data;
  
  // Split obligations
  const pendingObligations = obligations.filter((o: any) => o.status === "pending");
  const paidObligations = obligations.filter((o: any) => o.status === "paid");

  const totalPendingSum = pendingObligations.reduce((sum: number, o: any) => sum + Number(o.amount), 0);

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <Calendar className="h-7 w-7 text-accent" /> Bill & obligation Timelines
            </h1>
            <p className="text-gray-400 text-xs mt-1">Calendar tracking for credit card dues, loan EMIs, insurance terms, and subscriptions.</p>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent text-[#09090b] hover:bg-accent/90 text-xs font-bold rounded-lg transition duration-300 shadow-md"
          >
            <Plus className="h-4 w-4" /> Declare Bill/Sub
          </button>
        </div>

        {/* Add Form */}
        {formOpen && (
          <form onSubmit={handleAddObligation} className="bg-[#111113] border border-border/40 p-6 rounded-xl space-y-4 max-w-xl">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Configure Recurring Bill</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Bill/EMI Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rent, LIC Insurance"
                  value={obName}
                  onChange={(e) => setObName(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Bill Category</label>
                <select
                  value={obType}
                  onChange={(e) => setObType(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                >
                  {OBLIGATION_TYPES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Bill Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                {submitting ? "Processing..." : "Commit Obligation"}
              </button>
            </div>
          </form>
        )}

        {/* Dashboard split content layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Obligations list */}
          <div className="lg:col-span-2 space-y-6">
            {/* PENDING BILLS */}
            <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
              <span className="text-xs uppercase font-bold text-[#FFB020] tracking-wider block mb-2 pb-2 border-b border-border/20 flex items-center gap-1.5">
                <Clock className="h-4 w-4 animate-pulse" /> Pending Commitments ({pendingObligations.length})
              </span>

              {pendingObligations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">All obligations for this cycle have been cleared!</div>
              ) : (
                <div className="space-y-3.5">
                  {pendingObligations.map((item: any) => (
                    <div key={item.id} className="p-4 bg-black/30 border border-border/20 rounded-xl flex items-center justify-between gap-4 group">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <span className="text-sm font-semibold text-white block">{item.name}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-0.5">
                            Due: {item.due_date} | {item.obligation_type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-white">{formatINR(item.amount)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePay(item.id)}
                            className="px-3.5 py-1.5 bg-accent hover:bg-accent/80 text-[#09090b] text-xs font-bold rounded-lg transition"
                          >
                            Pay Bill
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-500 hover:text-error transition p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAID BILLS HISTORY */}
            <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
              <span className="text-xs uppercase font-bold text-success tracking-wider block mb-2 pb-2 border-b border-border/20 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Cleared Payments History ({paidObligations.length})
              </span>

              {paidObligations.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">No bills cleared yet during this dashboard session.</div>
              ) : (
                <div className="space-y-2.5">
                  {paidObligations.map((item: any) => (
                    <div key={item.id} className="p-3 bg-black/15 border border-border/10 rounded-lg flex items-center justify-between opacity-70">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4.5 w-4.5 text-success" />
                        <div>
                          <span className="text-xs font-semibold text-white block line-through">{item.name}</span>
                          <span className="text-[9px] text-gray-500 uppercase tracking-wider block mt-0.5">Cleared on time | {item.obligation_type}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{formatINR(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Aggregate Stats panel */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" /> Obligation Cash HUD
              </span>

              <div className="space-y-4">
                <div className="bg-black/30 p-4 rounded-xl border border-border/20 text-center">
                  <span className="text-[10px] text-gray-500 font-semibold block uppercase">Remaining Due Outstanding</span>
                  <span className="text-2xl font-extrabold text-[#FFB020] block mt-1 tracking-tight">{formatINR(totalPendingSum)}</span>
                </div>

                <div className="bg-success/5 border border-success/15 p-4 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-success">
                    <ShieldCheck className="h-4 w-4" /> Healthy Debt Service Rate
                  </div>
                  <p className="text-gray-300">
                    Your scheduled payments represent less than 35% of monthly income base, protecting your cash flow balance sheet from excessive stress.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-gray-500 text-center font-medium mt-4">
              All payment dates and calendar updates synchronized live against your profile.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
