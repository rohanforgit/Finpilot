"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Activity, AlertTriangle, ShieldCheck, HelpCircle, RefreshCw, Calendar, MessageSquare, Send } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { generateNewCoachReport, getPastCoachReports, askCoachLiveQuestion } from "@/app/actions/coach";
import { formatINR } from "@/lib/utils";

export default function CoachPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isMockAI, setIsMockAI] = useState(true);

  // Chat states
  const [activeTab, setActiveTab] = useState<"diagnostics" | "chat">("diagnostics");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Hello! I am your FinPilot Financial Advisor. I have full context of your assets, liabilities, and budgets. Ask me anything about how to optimize your cash flow!"
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const queryText = customText || chatInput;
    if (!queryText.trim() || chatLoading) return;

    const userMessage = { role: "user" as const, content: queryText };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await askCoachLiveQuestion(queryText, [...chatMessages, userMessage]);
      setChatMessages(prev => [...prev, { role: "assistant", content: response.answer }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: "assistant", content: "I ran into a connection issue. Please check your network and try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  async function loadReports() {
    try {
      const res = await getPastCoachReports();
      setReports(res.reports);
      setIsMockAI(res.isMockAI);
      if (res.reports.length > 0 && !activeReport) {
        setActiveReport(res.reports[0]);
      }
    } catch (err) {
      console.error("Failed to load coach reports", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateNewCoachReport();
      setActiveReport(res.report);
      await loadReports();
    } catch (err) {
      console.error("Coaching compilation crashed:", err);
      alert("Failed to analyze data via Coach API.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <Sparkles className="h-8 w-8 text-accent animate-pulse" />
      </div>
    );
  }

  // Handle active details
  const details = activeReport ? (
    typeof activeReport.report_data === "string" 
      ? JSON.parse(activeReport.report_data) 
      : activeReport.report_data
  ) : null;

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <Sparkles className="h-7 w-7 text-accent animate-pulse" /> AI Financial Coach
            </h1>
            <p className="text-gray-400 text-xs mt-1">Deep structural analysis of balance sheets, assets allocation, and debts utilizing Google Gemini.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-[10px] font-semibold px-2.5 py-1 rounded border ${
              isMockAI ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-success/10 text-success border-success/20"
            }`}>
              {isMockAI ? "Coach: Demo Mode" : "Coach: Gemini Active"}
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent text-[#09090b] hover:bg-accent/90 text-xs font-bold rounded-lg transition duration-300 shadow-md shadow-accent/15"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Scanning Systems..." : "Run Portfolio Diagnostics"}
            </button>
          </div>
        </div>

        {/* Main Content Layout Split */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis View Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Selector */}
            <div className="flex bg-black/40 border border-border/40 p-1 rounded-xl max-w-sm">
              <button
                onClick={() => setActiveTab("diagnostics")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "diagnostics" ? "bg-accent text-[#09090b] font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                <Activity className="h-3.5 w-3.5" /> Diagnostics Ledger
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "chat" ? "bg-accent text-[#09090b] font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Live Advisor Chat
              </button>
            </div>

            {activeTab === "diagnostics" ? (
              generating ? (
                <div className="bg-[#111113] border border-border/40 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl min-h-[400px]">
                  <RefreshCw className="h-10 w-10 text-accent animate-spin" />
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Compiling Financial Ledger Profiles</h4>
                  <p className="text-gray-500 text-xs max-w-sm">
                    Sending aggregate assets, liabilities, obligations timelines, and expense metrics to Google Gemini for advisory extraction.
                  </p>
                </div>
              ) : !details ? (
                <div className="bg-[#111113] border border-border/40 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl min-h-[400px]">
                  <Sparkles className="h-10 w-10 text-gray-500" />
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">No Advisory Reports Yet</h4>
                  <p className="text-gray-500 text-xs max-w-sm">
                    Click the Run Portfolio Diagnostics button above to command the AI Coach to build a new financial diagnostics report.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Health Overview Banner */}
                  <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-3.5">
                    <div className="flex justify-between items-center pb-2 border-b border-border/20">
                      <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Health Score Analysis</span>
                      <span className="text-xs text-accent font-semibold">Diagnostics ID: {activeReport.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-200">{details.healthAnalysis}</p>
                  </div>

                  {/* Grid of Insights & Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Insights */}
                    <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
                      <span className="text-xs uppercase font-bold text-[#3B82F6] tracking-wider block mb-2 pb-2 border-b border-border/20 flex items-center gap-1.5">
                        <Activity className="h-4 w-4" /> Category Spend Insights
                      </span>
                      <ul className="space-y-3">
                        {details.insights.map((ins: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 bg-black/20 p-2.5 rounded-lg border border-border/25">
                            <span className="text-accent shrink-0 font-bold">•</span>
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Savings & Refinance Recommendations */}
                    <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
                      <span className="text-xs uppercase font-bold text-success tracking-wider block mb-2 pb-2 border-b border-border/20 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" /> Strategic Savings Advice
                      </span>
                      <ul className="space-y-3">
                        {details.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 bg-black/20 p-2.5 rounded-lg border border-border/25">
                            <span className="text-success shrink-0 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Risk Alerts & Debt Warnings */}
                  <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
                    <span className="text-xs uppercase font-bold text-error tracking-wider block mb-2 pb-2 border-b border-border/20 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 animate-pulse" /> Critical Risk Warnings
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {details.warnings.map((warn: string, idx: number) => (
                        <div key={idx} className="text-xs text-gray-300 bg-error/5 border border-error/25 p-3 rounded-lg flex items-start gap-2.5">
                          <AlertTriangle className="h-4.5 w-4.5 text-error shrink-0 mt-0.5" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Live Advisor Chat View */
              <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4 flex flex-col justify-between min-h-[480px]">
                {/* Messages Box */}
                <div className="space-y-4 overflow-y-auto max-h-[340px] pr-1 flex-1">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 text-xs max-w-[85%] ${
                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center font-bold ${
                        msg.role === "user" ? "bg-accent text-[#09090b]" : "bg-[#1E1E22] text-gray-300 border border-border"
                      }`}>
                        {msg.role === "user" ? "AS" : "FP"}
                      </div>
                      
                      <div className={`p-3 rounded-xl border leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-accent/5 border-accent/20 text-gray-200" 
                          : "bg-black/30 border-border/25 text-gray-300"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex gap-3 text-xs mr-auto">
                      <div className="h-7 w-7 rounded-full bg-[#1E1E22] text-gray-300 border border-border flex items-center justify-center font-bold">
                        FP
                      </div>
                      <div className="p-3 rounded-xl bg-black/30 border border-border/25 text-gray-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Helper chips and input */}
                <div className="space-y-3 pt-3 border-t border-border/20">
                  {/* Helper Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleSendMessage(undefined, "How can I speed up my bike saving plan?")}
                      className="text-[10px] text-gray-400 bg-black/40 hover:bg-black/60 border border-border/50 hover:border-accent/40 px-2.5 py-1 rounded-full transition"
                      disabled={chatLoading}
                    >
                      🏍 Bike savings query
                    </button>
                    <button
                      onClick={() => handleSendMessage(undefined, "Assess my high APR credit card outstanding.")}
                      className="text-[10px] text-gray-400 bg-black/40 hover:bg-black/60 border border-border/50 hover:border-accent/40 px-2.5 py-1 rounded-full transition"
                      disabled={chatLoading}
                    >
                      💳 Credit Card APR
                    </button>
                    <button
                      onClick={() => handleSendMessage(undefined, "Do I have enough emergency fund safety?")}
                      className="text-[10px] text-gray-400 bg-black/40 hover:bg-black/60 border border-border/50 hover:border-accent/40 px-2.5 py-1 rounded-full transition"
                      disabled={chatLoading}
                    >
                      🛡 Emergency safety
                    </button>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask FinPilot live portfolio advisory questions..."
                      disabled={chatLoading}
                      className="flex-1 bg-black/40 border border-border/50 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-accent text-white placeholder-gray-500 pr-10"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-accent disabled:text-gray-600 hover:text-accent/80 transition"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-2 pb-2 border-b border-border/20">Diagnostics History</span>

            {reports.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs">No past diagnostics recorded.</div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {reports.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => setActiveReport(rep)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                      activeReport?.id === rep.id
                        ? "bg-accent/10 border-accent/40 text-white font-semibold"
                        : "bg-black/20 border-border/20 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(rep.created_at).toLocaleDateString("en-IN")}</span>
                    </span>
                    <span className="font-bold text-accent">{rep.health_score || 80} Score</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
