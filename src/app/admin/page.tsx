"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Users, Activity, Eye, AlertOctagon, Terminal, Star, MessageSquare } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getAdminTelemetry } from "@/app/actions/admin";
import { formatINR } from "@/lib/utils";

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"telemetry" | "prompts" | "feedback" | "errors">("telemetry");

  async function loadTelemetry() {
    try {
      const res = await getAdminTelemetry();
      setData(res);
    } catch (err) {
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTelemetry();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <ShieldCheck className="h-8 w-8 text-error animate-pulse" />
      </div>
    );
  }

  const { stats, ocrLogs, aiReports, feedback, errorLogs } = data;

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="h-7 w-7 text-error" /> System Operations Console
            </h1>
            <p className="text-gray-400 text-xs mt-1">Telemetry diagnostics, AI prompts traceability, OCR error telemetry, and user feedback logs.</p>
          </div>

          {/* Quick tab controls */}
          <div className="flex bg-black/40 border border-border/40 p-1 rounded-lg">
            {(["telemetry", "prompts", "feedback", "errors"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === tab ? "bg-error text-white font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: TELEMETRY GRID OVERVIEW */}
        {activeTab === "telemetry" && (
          <div className="space-y-8">
            {/* Stat Counters */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#111113] border border-border/40 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Active Users</span>
                </div>
                <span className="text-2xl font-extrabold text-white block tracking-tight">{stats.activeUsers}</span>
                <span className="text-[10px] text-success font-semibold mt-1 block">Total onboarded profiles</span>
              </div>

              <div className="bg-[#111113] border border-border/40 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">OCR Scans Count</span>
                </div>
                <span className="text-2xl font-extrabold text-white block tracking-tight">{stats.ocrCount}</span>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {stats.ocrSuccess} Success | {stats.ocrFailed} Failed
                </span>
              </div>

              <div className="bg-[#111113] border border-border/40 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Avg Vision Latency</span>
                </div>
                <span className="text-2xl font-extrabold text-white block tracking-tight">
                  {stats.avgOcrTimeMs}ms
                </span>
                <span className="text-[10px] text-accent font-semibold mt-1 block">Gemini Flash OCR pipeline speed</span>
              </div>

              <div className="bg-[#111113] border border-border/40 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Star className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Satisfaction Rating</span>
                </div>
                <span className="text-2xl font-extrabold text-white block tracking-tight">
                  {stats.avgFeedbackRating}/5.0
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">Based on {stats.feedbackCount} feedback ratings</span>
              </div>
            </section>

            {/* OCR log monitoring */}
            <section className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20">OCR Requests Log (Max 20)</span>
              
              {ocrLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No transaction scanning calls logged yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-border/10">
                        <th className="pb-3 font-semibold">Log ID</th>
                        <th className="pb-3 font-semibold">File Reference</th>
                        <th className="pb-3 font-semibold">Result</th>
                        <th className="pb-3 font-semibold">Latency</th>
                        <th className="pb-3 font-semibold text-right">Captured</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {ocrLogs.map((row: any) => (
                        <tr key={row.id}>
                          <td className="py-3 font-mono text-[10px] text-gray-400">{row.id.slice(0, 8)}</td>
                          <td className="py-3 text-xs text-white max-w-xs truncate">{row.file_path}</td>
                          <td className="py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                              row.status === "success" ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-gray-300">{row.processing_time_ms}ms</td>
                          <td className="py-3 text-xs text-gray-500 text-right">{new Date(row.created_at).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: PROMPTS AUDIT TRAIL */}
        {activeTab === "prompts" && (
          <section className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-2 pb-2 border-b border-border/20">AI Prompts & Responses Audit Trail</span>
            
            {aiReports.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No coach responses cached in history.</div>
            ) : (
              <div className="space-y-4">
                {aiReports.map((row: any) => (
                  <div key={row.id} className="bg-black/30 border border-border/20 p-5 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-gray-500">Report ID: {row.id}</span>
                      <span className="text-gray-400">{new Date(row.created_at).toLocaleString("en-IN")}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Prompt Context Summary</span>
                        <div className="bg-black/40 border border-border/40 p-3 rounded text-[11px] font-mono text-gray-300 min-h-[60px]">
                          {row.prompt_text || "No prompt trace logged"}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Coach JSON Response</span>
                        <div className="bg-black/40 border border-border/40 p-3 rounded text-[11px] font-mono text-accent min-h-[60px] max-h-36 overflow-y-auto">
                          {row.response_text || "{}"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: FEEDBACK METRICS */}
        {activeTab === "feedback" && (
          <section className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20">User Feedback Submissions</span>
            
            {feedback.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No feedback logs found in data warehouse.</div>
            ) : (
              <div className="space-y-4">
                {feedback.map((row: any) => (
                  <div key={row.id} className="bg-black/30 border border-border/20 p-4 rounded-xl flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-black/40 border border-border/30 flex items-center justify-center text-accent shrink-0">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{row.category ? row.category.toUpperCase() : "GENERAL"}</span>
                        <span className="text-gray-500 text-[10px]">{new Date(row.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 py-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < row.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-300 pt-1 leading-relaxed">{row.comments || "No comments entered."}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: ERRORS DIAGNOSTICS */}
        {activeTab === "errors" && (
          <section className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20 text-error">System Error monitoring</span>
            
            {errorLogs.length === 0 ? (
              <div className="text-center py-12 text-success text-sm flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="h-10 w-10 text-success" />
                <span>Zero system errors reported. Healthy operations!</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {errorLogs.map((err: any) => (
                  <div key={err.id} className="bg-error/5 border border-error/25 p-4 rounded-xl flex items-start gap-3">
                    <AlertOctagon className="h-5 w-5 text-error shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-error">{err.type}</span>
                        <span className="text-gray-500 text-[10px]">{new Date(err.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-mono bg-black/30 border border-border/10 p-2.5 rounded mt-1.5">{err.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
