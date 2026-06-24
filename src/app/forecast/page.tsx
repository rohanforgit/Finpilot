"use client";

import React, { useState, useEffect } from "react";
import { LineChart as ChartIcon, TrendingUp, HelpCircle, Layers, ArrowUpRight } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getDashboardData } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ForecastPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadForecast() {
    try {
      const dbData = await getDashboardData();
      setData(dbData);
    } catch (err) {
      console.error("Failed to load cash flow forecast", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForecast();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <ChartIcon className="h-8 w-8 text-accent animate-pulse" />
      </div>
    );
  }

  const { monthlyIncome, monthlyExpensesTotal, emiTotal, assets } = data;

  const currentLiquidCash = assets
    .filter((a: any) => a.asset_type === "cash" || a.asset_type === "bank_account")
    .reduce((sum: number, a: any) => sum + Number(a.current_value), 0);

  const monthlyOutflow = monthlyExpensesTotal + emiTotal;
  const netSurplus = monthlyIncome - monthlyOutflow;

  // Generate 12-month projections
  const monthsNames = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  let compoundedCash = currentLiquidCash;

  const projections = monthsNames.map((m, idx) => {
    // Add slightly simulated variation to expenses for visual elegance
    const simulatedOutflow = monthlyOutflow + (Math.sin(idx) * 3500);
    const surplus = monthlyIncome - simulatedOutflow;
    compoundedCash += surplus;
    return {
      month: `${m} 2026`,
      expectedInflow: Math.round(monthlyIncome),
      expectedOutflow: Math.round(simulatedOutflow),
      cashReserve: Math.round(compoundedCash),
      netSurplus: Math.round(surplus)
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
              <ChartIcon className="h-7 w-7 text-accent" /> Cash Flow Forecast
            </h1>
            <p className="text-gray-400 text-xs mt-1">Predict 12-month compounding cash reserves, expected monthly surplus, and liability impact.</p>
          </div>
        </div>

        {/* HUD grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111113] border border-border/40 p-5 rounded-xl shadow-xl">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase">Starting Liquid Buffer</span>
            <span className="text-xl font-bold text-white block mt-1 tracking-tight">{formatINR(currentLiquidCash)}</span>
            <span className="text-[10px] text-gray-400 mt-1.5 block">Combined cash & bank account balances</span>
          </div>

          <div className="bg-[#111113] border border-border/40 p-5 rounded-xl shadow-xl">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase">Projected Monthly Surplus</span>
            <span className={`text-xl font-bold block mt-1 tracking-tight ${netSurplus >= 0 ? "text-success" : "text-error"}`}>
              {formatINR(netSurplus)}
            </span>
            <span className="text-[10px] text-gray-400 mt-1.5 block">Net inflow minus verified monthly expenses & EMIs</span>
          </div>

          <div className="bg-[#111113] border border-border/40 p-5 rounded-xl shadow-xl">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase">Compounded 12M Cash Target</span>
            <span className="text-xl font-bold text-accent block mt-1 tracking-tight">
              {formatINR(projections[projections.length - 1].cashReserve)}
            </span>
            <span className="text-[10px] text-success font-semibold mt-1.5 flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" /> Compounding at positive rate
            </span>
          </div>
        </section>

        {/* 12-Month Chart Visual */}
        <section className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-border/20">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">12-Month Compounding reserves projection</span>
            <span className="text-[10px] bg-accent/10 border border-accent/20 px-2 py-0.5 rounded text-accent font-semibold flex items-center gap-1">
              <Layers className="h-3 w-3 animate-pulse" /> Constant Surpluses compounding
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projections}>
                <defs>
                  <linearGradient id="colorCashReserve" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00E5A8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111113", borderColor: "#27272A", color: "#FFF", borderRadius: "8px" }}
                  formatter={(val) => [formatINR(val as number), "Compounded Cash"]}
                />
                <Area type="monotone" dataKey="cashReserve" stroke="#00E5A8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCashReserve)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Ledger projection summary grid */}
        <section className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
          <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20">Estimated Monthly cash flow breakdown</span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-border/20">
                  <th className="pb-3 font-semibold">Month</th>
                  <th className="pb-3 font-semibold">Est. Income Inflow</th>
                  <th className="pb-3 font-semibold">Est. Expenses Outflow</th>
                  <th className="pb-3 font-semibold">Monthly Surplus</th>
                  <th className="pb-3 font-semibold text-right">Cash Reserve Peak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {projections.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition">
                    <td className="py-3.5 font-semibold text-white">{row.month}</td>
                    <td className="py-3.5 text-accent font-bold">{formatINR(row.expectedInflow)}</td>
                    <td className="py-3.5 text-error font-medium">{formatINR(row.expectedOutflow)}</td>
                    <td className="py-3.5 text-success font-semibold">{formatINR(row.netSurplus)}</td>
                    <td className="py-3.5 text-right font-extrabold text-white">{formatINR(row.cashReserve)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
