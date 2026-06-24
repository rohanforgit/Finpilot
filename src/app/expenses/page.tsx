"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Plus, Trash2, Edit3, Image as ImageIcon, Filter, Sparkles, RefreshCw, Calendar as CalendarIcon, ChevronLeft, ChevronRight, List } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getDashboardData, addExpense, deleteExpense } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";

const CATEGORIES = [
  { value: "food", label: "Food", color: "#10B981" },
  { value: "shopping", label: "Shopping", color: "#EC4899" },
  { value: "transport", label: "Transport", color: "#3B82F6" },
  { value: "bills", label: "Bills", color: "#6366F1" },
  { value: "entertainment", label: "Entertainment", color: "#8B5CF6" },
  { value: "health", label: "Health", color: "#F59E0B" },
  { value: "education", label: "Education", color: "#14B8A6" },
  { value: "others", label: "Others", color: "#EF4444" },
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [filterCategory, setFilterCategory] = useState("all");
  
  // OCR scanner state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResponse, setOcrResponse] = useState<any>(null);

  // Manual Form / Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  
  // Form fields
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Calendar navigation state (default to June 2026 as user screenshot)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 24)); // June 24, 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(
    new Date(2026, 5, 24).toISOString().split("T")[0]
  );

  async function loadExpenses() {
    try {
      const data = await getDashboardData();
      setExpenses(data.expenses);
    } catch (err) {
      console.error("Failed to load expenses log", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  // Handle OCR upload
  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrResponse(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
        const response = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64String,
            mimeType: file.type,
            fileName: file.name
          })
        });

        const resData = await response.json();
        if (resData.success) {
          setOcrResponse(resData);
          // Auto select the date parsed from the receipt/statement in calendar
          const targetExpense = resData.expenses && resData.expenses.length > 0
            ? resData.expenses[0]
            : resData.expense;

          if (targetExpense && targetExpense.date) {
            setSelectedCalendarDate(targetExpense.date);
            const parsedDateObj = new Date(targetExpense.date);
            if (!isNaN(parsedDateObj.getTime())) {
              setCurrentDate(parsedDateObj);
            }
          }
          loadExpenses();
        } else {
          alert(`OCR Scanner Error: ${resData.error}`);
        }
      } catch (err) {
        console.error("OCR API route call crashed:", err);
        alert("Receipt scanner connection failed.");
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName || !amount || !date) return;

    setSubmitting(true);
    try {
      await addExpense({
        merchant_name: merchantName,
        amount: Number(amount),
        category,
        date,
        time: time || undefined,
        is_manual_corrected: editTarget !== null
      });
      
      if (editTarget) {
        await deleteExpense(editTarget.id);
      }

      setMerchantName("");
      setAmount("");
      setCategory("food");
      setTime("");
      setFormOpen(false);
      setEditTarget(null);
      setSelectedCalendarDate(date); // Update calendar selection to this day
      loadExpenses();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this expense transaction permanently?")) {
      const success = await deleteExpense(id);
      if (success) {
        loadExpenses();
      }
    }
  };

  const startEdit = (item: any) => {
    setEditTarget(item);
    setMerchantName(item.merchant_name);
    setAmount(item.amount.toString());
    setCategory(item.category);
    setDate(item.date);
    setTime(item.time || "");
    setFormOpen(true);
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Format month name
  const monthLabel = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <UploadCloud className="h-8 w-8 text-accent animate-bounce" />
      </div>
    );
  }

  // Filter calculations
  const filteredExpenses = filterCategory === "all"
    ? expenses
    : expenses.filter(e => e.category === filterCategory);

  const totalExpenseSum = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  // Filter list by selected calendar cell
  const calendarFocusedExpenses = selectedCalendarDate
    ? expenses.filter(e => e.date === selectedCalendarDate && (filterCategory === "all" || e.category === filterCategory))
    : [];

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <ImageIcon className="h-7 w-7 text-accent" /> Expense Ledger
            </h1>
            <p className="text-gray-400 text-xs mt-1">Audit receipt scans via Gemini, view calendar categorizations, and add manual corrections.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-black/40 border border-border/40 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewMode === "calendar" ? "bg-accent text-[#09090b] font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" /> Calendar View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewMode === "list" ? "bg-accent text-[#09090b] font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="h-3.5 w-3.5" /> Ledger List
              </button>
            </div>

            <button
              onClick={() => {
                setEditTarget(null);
                setMerchantName("");
                setAmount("");
                setCategory("food");
                // Pre-populate form date with the highlighted calendar date if present
                if (selectedCalendarDate) {
                  setDate(selectedCalendarDate);
                } else {
                  setDate(new Date().toISOString().split("T")[0]);
                }
                setFormOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-lg border border-border/50 transition duration-200"
            >
              <Plus className="h-4 w-4" /> Log Item
            </button>
          </div>
        </div>

        {/* OCR Receipt Dropzone Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Uploader Card */}
          <div className="lg:col-span-2 bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" /> Mobile screenshot OCR scanning
              </span>
              <p className="text-gray-400 text-xs">
                Drop your PhonePe, Paytm, or GPay receipt screenshot here. Gemini Vision extracts the merchant, amount, category, date, and maps it directly onto your calendar.
              </p>

              {/* Upload area */}
              <div className="border-2 border-dashed border-border/50 hover:border-accent/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-black/10 group relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOcrFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={ocrLoading}
                />
                {ocrLoading ? (
                  <div className="flex flex-col items-center space-y-3">
                    <RefreshCw className="h-10 w-10 text-accent animate-spin" />
                    <span className="text-sm font-semibold text-accent/90">Gemini Vision OCR Deciphering Screenshot...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <UploadCloud className="h-10 w-10 text-gray-500 group-hover:text-accent transition" />
                    <span className="text-sm font-semibold text-white">Click or drag screenshot file</span>
                    <span className="text-[10px] text-gray-500">Supports JPG, PNG payments receipts</span>
                  </div>
                )}
              </div>
            </div>

            {/* OCR Extracted Output */}
            {ocrResponse && (
              <div className="mt-4 bg-accent/5 border border-accent/20 p-5 rounded-xl text-xs space-y-4">
                <div className="flex justify-between items-center font-bold text-accent border-b border-accent/10 pb-2">
                  <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 animate-pulse" /> Parsed Statement Successfully!</span>
                  <span className="text-gray-400 font-normal text-[10px]">Processed in {ocrResponse.processingTimeMs}ms {ocrResponse.isMockOCR ? "(Demo Mode)" : ""}</span>
                </div>
                
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {/* Render saved expenses */}
                  {ocrResponse.expenses && ocrResponse.expenses.length > 0 && ocrResponse.expenses.map((item: any, idx: number) => {
                    const catColor = CATEGORIES.find(c => c.value === item.category)?.color || "#A1A1AA";
                    return (
                      <div key={`exp-${idx}`} className="flex items-center justify-between p-2.5 bg-black/40 border border-border/40 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: catColor }} />
                          <div>
                            <span className="font-semibold text-white block">{item.merchant_name}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider block mt-0.5">
                              {item.date} {item.time ? `at ${item.time}` : ""} • {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-rose-400">-{formatINR(item.amount)}</span>
                          <button
                            onClick={() => startEdit(item)}
                            className="text-accent hover:bg-accent/10 p-1 rounded transition border border-accent/20"
                            title="Correct details"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Render saved incomes */}
                  {ocrResponse.incomes && ocrResponse.incomes.length > 0 && ocrResponse.incomes.map((item: any, idx: number) => {
                    return (
                      <div key={`inc-${idx}`} className="flex items-center justify-between p-2.5 bg-black/40 border border-[#00E5A8]/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#00E5A8]" />
                          <div>
                            <span className="font-semibold text-white block">{item.source_name}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider block mt-0.5">
                              Income Received (One-Off)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pr-8">
                          <span className="font-bold text-emerald-400">+{formatINR(item.amount)}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Fallback singular rendering */}
                  {(!ocrResponse.expenses || ocrResponse.expenses.length === 0) && ocrResponse.expense && (
                    <div className="flex items-center justify-between p-2.5 bg-black/40 border border-border/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        <div>
                          <span className="font-semibold text-white block">{ocrResponse.expense.merchant_name}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block mt-0.5">
                            {ocrResponse.expense.date} {ocrResponse.expense.time ? `at ${ocrResponse.expense.time}` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{formatINR(ocrResponse.expense.amount)}</span>
                        <button
                          onClick={() => startEdit(ocrResponse.expense)}
                          className="text-accent hover:bg-accent/10 p-1 rounded transition border border-accent/20"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filtering control */}
          <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Ledger Category Filter
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    filterCategory === "all" ? "bg-white text-[#09090b] border-white" : "border-border text-gray-400 hover:text-white"
                  }`}
                >
                  All Categories
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      filterCategory === cat.value ? "bg-accent text-[#09090b] border-accent" : "border-border text-gray-400 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-border/20 text-center mt-4">
              <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Period Spend</span>
              <span className="text-2xl font-extrabold text-white block mt-1 tracking-tight">{formatINR(totalExpenseSum)}</span>
            </div>
          </div>
        </section>

        {/* VIEW 1: INTERACTIVE MONTHLY CALENDAR GRID */}
        {viewMode === "calendar" && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
              
              {/* Calendar Month Selector Header */}
              <div className="flex items-center justify-between border-b border-border/20 pb-4 mb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <CalendarIcon className="h-4.5 w-4.5 text-accent" /> {monthLabel}
                </h3>
                <div className="flex items-center gap-1 bg-black/40 border border-border/40 rounded-lg p-0.5">
                  <button onClick={prevMonth} className="p-1.5 text-gray-400 hover:text-white transition">
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <button onClick={nextMonth} className="p-1.5 text-gray-400 hover:text-white transition">
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Day Headers (Sun-Sat) */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 uppercase tracking-widest pb-2">
                {WEEK_DAYS.map(day => <div key={day}>{day}</div>)}
              </div>

              {/* Monthly Cells */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells padding for starting week offset */}
                {Array.from({ length: startDayIndex }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square bg-transparent border border-transparent" />
                ))}

                {/* Days cells */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const monthStr = (month + 1).toString().padStart(2, "0");
                  const dayStr = dayNum.toString().padStart(2, "0");
                  const dateKey = `${year}-${monthStr}-${dayStr}`;
                  
                  const isSelected = selectedCalendarDate === dateKey;

                  // Find daily transactions
                  const dayExpenses = expenses.filter(
                    e => e.date === dateKey && !e.deleted_at && (filterCategory === "all" || e.category === filterCategory)
                  );
                  const daySpendTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

                  return (
                    <div
                      key={dateKey}
                      onClick={() => setSelectedCalendarDate(dateKey)}
                      className={`aspect-square bg-black/25 border rounded-lg p-1.5 flex flex-col justify-between cursor-pointer transition select-none hover:border-accent/40 ${
                        isSelected 
                          ? "border-accent bg-accent/5 ring-1 ring-accent/30" 
                          : "border-border/30"
                      }`}
                    >
                      {/* Date Number */}
                      <span className={`text-xs font-semibold ${isSelected ? "text-accent font-bold" : "text-gray-400"}`}>
                        {dayNum}
                      </span>

                      {/* Daily Expenditure */}
                      {daySpendTotal > 0 ? (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-accent block truncate text-right">
                            ₹{daySpendTotal}
                          </span>
                          {/* Dot indicators */}
                          <div className="flex gap-0.5 justify-end flex-wrap max-h-3 overflow-hidden">
                            {dayExpenses.map((exp, expIdx) => {
                              const catColor = CATEGORIES.find(c => c.value === exp.category)?.color || "#A1A1AA";
                              return (
                                <span 
                                  key={expIdx} 
                                  className="h-1.5 w-1.5 rounded-full" 
                                  style={{ backgroundColor: catColor }} 
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="h-3" /> // padding
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Drawer Detail Panel */}
            <div className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20">
                  Transactions on {selectedCalendarDate || "Selected Date"}
                </span>

                {calendarFocusedExpenses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    No transactions recorded on this date. Click Log Item above or drag a receipt to register one!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {calendarFocusedExpenses.map(item => (
                      <div key={item.id} className="p-3 bg-black/30 border border-border/20 rounded-xl flex items-center justify-between gap-3 text-xs group">
                        <div>
                          <span className="font-semibold text-white block truncate max-w-[120px]">{item.merchant_name}</span>
                          <span className="text-[9px] text-gray-500 block uppercase tracking-wider mt-0.5">
                            {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">{formatINR(item.amount)}</span>
                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                            <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-accent p-0.5">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-error p-0.5">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-black/40 border border-border/40 p-4 rounded-xl text-[11px] text-gray-400 leading-relaxed">
                <span className="font-semibold text-accent block mb-1">Interactive CalibrationTip</span>
                Clicking any date cell updates the focus list. Use the **Log Item** button to pre-fill the form with the selected date.
              </div>
            </div>
          </section>
        )}

        {/* VIEW 2: STANDARD LIST LEDGER TABLE */}
        {viewMode === "list" && (
          <section className="bg-[#111113] border border-border/40 rounded-xl p-6 shadow-xl">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-4 pb-2 border-b border-border/20">Transaction History</span>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No recorded transactions. Scan a receipt or add one manually!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-border/20">
                      <th className="pb-3 font-semibold">Merchant</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Date & Time</th>
                      <th className="pb-3 font-semibold text-right">Adjustment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {filteredExpenses.map(item => (
                      <tr key={item.id} className="hover:bg-muted/10 transition">
                        <td className="py-4 font-semibold text-white flex items-center gap-1.5">
                          {item.merchant_name}
                          {item.is_manual_corrected && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-normal">
                              Corrected
                            </span>
                          )}
                          {item.ocr_upload_id && (
                            <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded font-normal">
                              Vision Scanned
                            </span>
                          )}
                        </td>
                        <td className="py-4 font-bold text-white">{formatINR(item.amount)}</td>
                        <td className="py-4 uppercase tracking-wider text-xs text-accent">
                          {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                        </td>
                        <td className="py-4 text-xs text-gray-400">
                          {item.date} {item.time ? `at ${item.time}` : ""}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="text-gray-400 hover:text-accent transition p-1"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-gray-400 hover:text-error transition p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Manual Input Form Modal Overlay */}
        {formOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <form onSubmit={handleAddExpense} className="bg-[#111113] border border-border/40 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {editTarget ? <Edit3 className="h-5 w-5 text-accent" /> : <Plus className="h-5 w-5 text-accent" />}
                {editTarget ? "Modify / Adjust Transaction" : "Record Manual Transaction"}
              </h3>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks Coffee"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Amount (Rupees)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 350"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Time (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 19:30"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setEditTarget(null);
                  }}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-accent text-[#09090b] rounded-lg text-xs font-bold hover:bg-accent/80 transition"
                >
                  {submitting ? "Processing..." : editTarget ? "Confirm Corrections" : "Commit Transaction"}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
