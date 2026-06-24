"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Layers, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  Wallet,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { 
  getDashboardData, 
  updateProfileInfo, 
  addIncome, 
  updateIncome, 
  deleteIncome 
} from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Profile state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [healthScore, setHealthScore] = useState(80);

  // Incomes state
  const [incomes, setIncomes] = useState<any[]>([]);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  
  // Inline edit state
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editFrequency, setEditFrequency] = useState<'monthly' | 'annually' | 'one-off'>('monthly');

  // Add income state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newFrequency, setNewFrequency] = useState<'monthly' | 'annually' | 'one-off'>('monthly');
  const [incomeMsg, setIncomeMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function loadData() {
    try {
      const data = await getDashboardData();
      if (data.profile) {
        setFullName(data.profile.full_name || "");
        setEmail(data.profile.email || "");
        setHealthScore(data.profile.health_score || 80);
      }
      setIncomes(data.incomes || []);
    } catch (err) {
      console.error("Failed to load settings data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setProfileMsg({ type: 'error', text: "Full Name and Email are required." });
      return;
    }

    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await updateProfileInfo(fullName, email);
      if (res) {
        setProfileMsg({ type: 'success', text: "Profile details updated successfully." });
        setTimeout(() => setProfileMsg(null), 3000);
      }
    } catch (err) {
      console.error("Error updating profile", err);
      setProfileMsg({ type: 'error', text: "Failed to update profile details." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleStartEdit = (inc: any) => {
    setEditingIncomeId(inc.id);
    setEditName(inc.source_name);
    setEditAmount(inc.amount);
    setEditFrequency(inc.frequency);
  };

  const handleCancelEdit = () => {
    setEditingIncomeId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || editAmount <= 0) {
      setIncomeMsg({ type: 'error', text: "Please enter a valid source name and positive amount." });
      return;
    }

    try {
      await updateIncome(id, {
        source_name: editName,
        amount: editAmount,
        frequency: editFrequency
      });
      setIncomeMsg({ type: 'success', text: "Income source updated successfully." });
      setEditingIncomeId(null);
      loadData();
      setTimeout(() => setIncomeMsg(null), 3000);
    } catch (err) {
      console.error("Failed to update income", err);
      setIncomeMsg({ type: 'error', text: "Failed to save changes." });
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newAmount <= 0) {
      setIncomeMsg({ type: 'error', text: "Please fill in a source name and valid amount." });
      return;
    }

    try {
      await addIncome({
        source_name: newName,
        amount: newAmount,
        frequency: newFrequency
      });
      setIncomeMsg({ type: 'success', text: "New income source added!" });
      setNewName("");
      setNewAmount(0);
      setNewFrequency('monthly');
      setIsAdding(false);
      loadData();
      setTimeout(() => setIncomeMsg(null), 3000);
    } catch (err) {
      console.error("Failed to add income", err);
      setIncomeMsg({ type: 'error', text: "Failed to add income stream." });
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income source?")) return;
    try {
      await deleteIncome(id);
      setIncomeMsg({ type: 'success', text: "Income source deleted." });
      loadData();
      setTimeout(() => setIncomeMsg(null), 3000);
    } catch (err) {
      console.error("Failed to delete income", err);
      setIncomeMsg({ type: 'error', text: "Failed to delete income stream." });
    }
  };

  // Calculate monthly inflow total equivalent
  const monthlyInflowEquivalent = incomes.reduce((sum, inc) => {
    if (inc.frequency === 'monthly') return sum + Number(inc.amount);
    if (inc.frequency === 'annually') return sum + Number(inc.amount) / 12;
    return sum; // one-offs do not compile into standard recurring monthly base
  }, 0);

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

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white">Profile & Settings</h1>
            <p className="text-gray-400 text-xs mt-1">Manage user identity, credential scopes, and active cash flows/income streams.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-success font-semibold bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure Environment
            </span>
          </div>
        </div>

        {/* Profile Settings Block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <User className="h-28 w-28 text-white" />
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center text-accent text-3xl font-bold shadow-lg shadow-accent/5">
                  {fullName ? fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "AS"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">{fullName || "Aarav Sharma"}</h3>
                  <span className="text-xs text-gray-500">{email || "finance@finpilot.ai"}</span>
                </div>
                <div className="bg-black/45 border border-border/30 px-4 py-2 rounded-lg text-center w-full">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Financial Health Score</span>
                  <span className="text-2xl font-extrabold text-accent block mt-0.5">{healthScore} / 100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-6">
              <h2 className="text-base font-bold text-white tracking-wide border-b border-border/20 pb-3 flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-accent" /> Identity Credentials
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {profileMsg && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 text-xs border ${
                    profileMsg.type === 'success' ? 'bg-success/15 border-success/30 text-success' : 'bg-error/15 border-error/30 text-error'
                  }`}>
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full bg-black/40 border border-border/40 hover:border-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent transition duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="finance@finpilot.ai"
                        className="w-full bg-black/40 border border-border/40 hover:border-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent transition duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#09090b] font-bold text-xs py-2.5 px-6 rounded-lg transition duration-200 flex items-center gap-1.5"
                  >
                    {savingProfile ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    {savingProfile ? "Saving..." : "Save Profile Info"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Income Streams Block */}
        <section className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/20 pb-4 gap-4">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Wallet className="h-4.5 w-4.5 text-accent" /> Income Streams
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Monthly Total Inflow Base</span>
                <span className="text-sm font-bold text-accent">{formatINR(monthlyInflowEquivalent)}</span>
              </div>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent font-bold text-xs px-4 py-2 rounded-lg transition"
              >
                {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {isAdding ? "Cancel" : "Add Income Stream"}
              </button>
            </div>
          </div>

          {incomeMsg && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-xs border ${
              incomeMsg.type === 'success' ? 'bg-success/15 border-success/30 text-success' : 'bg-error/15 border-error/30 text-error'
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{incomeMsg.text}</span>
            </div>
          )}

          {/* New Income Stream Form */}
          {isAdding && (
            <form onSubmit={handleAddIncome} className="bg-black/30 border border-accent/25 rounded-xl p-4.5 space-y-4">
              <span className="text-xs font-bold text-accent uppercase tracking-widest block">Add New Income Stream</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Source Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Side Hustle Consulting"
                    className="w-full bg-[#111113] border border-border/40 hover:border-border rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-accent transition duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Amount (INR)</label>
                  <input
                    type="number"
                    value={newAmount === 0 ? "" : newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    placeholder="e.g. 15000"
                    className="w-full bg-[#111113] border border-border/40 hover:border-border rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-accent transition duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as any)}
                    className="w-full bg-[#111113] border border-border/40 hover:border-border rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-accent transition duration-200"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                    <option value="one-off">One-off</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-muted hover:bg-muted/80 text-gray-300 font-bold text-xs py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent/80 text-[#09090b] font-bold text-xs py-2 px-4 rounded-lg transition"
                >
                  Create Stream
                </button>
              </div>
            </form>
          )}

          {/* Incomes List */}
          <div className="space-y-3">
            {incomes.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No income sources configured. Set one up to model budget surplus!</div>
            ) : (
              incomes.map((inc) => {
                const isEditing = editingIncomeId === inc.id;
                return (
                  <div 
                    key={inc.id} 
                    className={`p-4 bg-black/35 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-200 ${
                      isEditing ? 'border-accent/40 bg-accent/5' : 'border-border/30 hover:border-border/60'
                    }`}
                  >
                    {isEditing ? (
                      /* Editing fields */
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase block">Source Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-[#111113] border border-border/45 rounded-lg py-1.5 px-3.5 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase block">Amount</label>
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(Number(e.target.value))}
                            className="w-full bg-[#111113] border border-border/45 rounded-lg py-1.5 px-3.5 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase block">Frequency</label>
                          <select
                            value={editFrequency}
                            onChange={(e) => setEditFrequency(e.target.value as any)}
                            className="w-full bg-[#111113] border border-border/45 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="annually">Annually</option>
                            <option value="one-off">One-off</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      /* Display fields */
                      <div className="flex items-center gap-3.5">
                        <div className="h-9 w-9 rounded-lg bg-black/40 border border-border/40 flex items-center justify-center text-accent">
                          <DollarSign className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white block">{inc.source_name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                              inc.frequency === 'monthly' ? 'bg-[#00E5A8]/10 text-accent border border-accent/20' :
                              inc.frequency === 'annually' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                            }`}>
                              {inc.frequency}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              Added {new Date(inc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions buttons */}
                    <div className="flex items-center justify-end gap-2.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(inc.id)}
                            className="flex items-center justify-center h-8.5 w-8.5 bg-accent text-[#09090b] hover:bg-accent/80 rounded-lg transition"
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center justify-center h-8.5 w-8.5 bg-muted text-gray-400 hover:text-white rounded-lg transition"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-white mr-2">{formatINR(inc.amount)}</span>
                          <button
                            onClick={() => handleStartEdit(inc)}
                            className="flex items-center justify-center h-8.5 w-8.5 bg-black/40 border border-border/40 text-gray-400 hover:text-accent hover:border-accent/40 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(inc.id)}
                            className="flex items-center justify-center h-8.5 w-8.5 bg-black/40 border border-border/40 text-gray-500 hover:text-error hover:border-error/40 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
