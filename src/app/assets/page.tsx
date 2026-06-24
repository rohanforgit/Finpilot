"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Wallet, Landmark, BarChart3, Coins, Building, ShieldAlert, Sparkles } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getDashboardData, addAsset, deleteAsset } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const ASSET_TYPES = [
  { value: "cash", label: "Cash", icon: Coins, color: "#10B981" },
  { value: "bank_account", label: "Bank Account", icon: Landmark, color: "#3B82F6" },
  { value: "fixed_deposit", label: "Fixed Deposit", icon: ShieldAlert, color: "#6366F1" },
  { value: "mutual_fund", label: "Mutual Fund", icon: BarChart3, color: "#8B5CF6" },
  { value: "stock", label: "Stock", icon: Sparkles, color: "#EC4899" },
  { value: "gold", label: "Gold", icon: Coins, color: "#F59E0B" },
  { value: "epf", label: "EPF (Provident)", icon: Building, color: "#14B8A6" },
  { value: "real_estate", label: "Real Estate", icon: Building, color: "#EF4444" },
];

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // Form State
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("bank_account");
  const [currentValue, setCurrentValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadAssets() {
    try {
      const data = await getDashboardData();
      setAssets(data.assets);
    } catch (err) {
      console.error("Failed to load assets", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !currentValue) return;

    setSubmitting(true);
    try {
      await addAsset({
        asset_name: assetName,
        asset_type: assetType,
        current_value: Number(currentValue)
      });
      setAssetName("");
      setCurrentValue("");
      setFormOpen(false);
      loadAssets();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to retire this asset from your balance sheet?")) {
      const success = await deleteAsset(id);
      if (success) {
        loadAssets();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <Landmark className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  // Calculate allocation metrics
  const totalValue = assets.reduce((sum, item) => sum + Number(item.current_value), 0);

  // Grouped by type for Chart
  const typeMap = assets.reduce((map: any, item) => {
    const type = item.asset_type;
    map[type] = (map[type] || 0) + Number(item.current_value);
    return map;
  }, {});

  const chartData = Object.keys(typeMap).map(typeKey => {
    const config = ASSET_TYPES.find(t => t.value === typeKey);
    return {
      name: config?.label || typeKey,
      value: typeMap[typeKey],
      color: config?.color || "#A1A1AA"
    };
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <Wallet className="h-7 w-7 text-accent" /> Asset Portfolios
            </h1>
            <p className="text-gray-400 text-xs mt-1">Audit cash balances, stock holdings, FDs, and real estate equity.</p>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent text-[#09090b] hover:bg-accent/90 text-xs font-bold rounded-lg transition duration-300 shadow-md shadow-accent/10"
          >
            <Plus className="h-4 w-4" /> Add Asset Account
          </button>
        </div>

        {/* Dynamic add form */}
        {formOpen && (
          <form onSubmit={handleAddAsset} className="bg-[#111113] border border-border/40 p-6 rounded-xl space-y-4 max-w-xl">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Record New Capital Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zerodha Stock Brokerage"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500">Asset Category</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                >
                  {ASSET_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500">Current Valuation (Rupees)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-gray-400">₹</span>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="w-full bg-black/40 border border-border/50 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
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
                className="px-4 py-2 bg-accent text-[#09090b] rounded-lg text-xs font-bold hover:bg-accent/80 transition disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Commit Asset"}
              </button>
            </div>
          </form>
        )}

        {/* Analytics Allocation Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Assets */}
          <div className="lg:col-span-2 bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Asset Catalog</span>
              <span className="text-xs text-accent font-semibold">Total Capital: {formatINR(totalValue)}</span>
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No asset accounts recorded. Click Add above to register one.</div>
            ) : (
              <div className="divide-y divide-border/20">
                {assets.map(item => {
                  const typeConfig = ASSET_TYPES.find(t => t.value === item.asset_type);
                  const Icon = typeConfig?.icon || Wallet;
                  return (
                    <div key={item.id} className="flex items-center justify-between py-4 group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-black/30 border border-border/30 flex items-center justify-center text-gray-400 group-hover:border-accent/40 group-hover:text-accent transition">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white block">{item.asset_name}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-0.5">{typeConfig?.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-white">{formatINR(item.current_value)}</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-500 hover:text-error transition p-1 rounded hover:bg-muted/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Allocation Recharts visual */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20">Portfolio Allocation</span>

            {assets.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-sm">No asset distribution data available.</div>
            ) : (
              <>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111113", borderColor: "#27272A", borderRadius: "8px" }}
                        formatter={(val) => [formatINR(val as number), "Value"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-4">
                  {chartData.map((item, idx) => {
                    const pct = ((item.value / totalValue) * 100).toFixed(1);
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </span>
                        <span className="font-semibold text-white">{pct}% ({formatINR(item.value)})</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
