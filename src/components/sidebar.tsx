"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Percent,
  FileText,
  Calculator,
  LineChart,
  Target,
  Calendar,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  CreditCard,
  Layers,
  ChevronRight,
  User
} from "lucide-react";
import { getDashboardData } from "@/app/actions/finance";
import { formatINR } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Wallet },
  { name: "Liabilities", href: "/liabilities", icon: CreditCard },
  { name: "Expense Log", href: "/expenses", icon: FileText },
  { name: "Budget Planner", href: "/budget", icon: Calculator },
  { name: "Cash Flow", href: "/forecast", icon: LineChart },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Obligations", href: "/obligations", icon: Calendar },
  { name: "AI Coach", href: "/coach", icon: Sparkles },
  { name: "Profile & Income", href: "/profile", icon: User },
  { name: "Admin Console", href: "/admin", icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [netWorth, setNetWorth] = useState<number | null>(null);
  const [isMock, setIsMock] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardData();
        setNetWorth(data.netWorth.value);
        setIsMock(data.isMockDB);
        setProfile(data.profile);
      } catch (err) {
        console.error("Failed to load net worth for sidebar", err);
      }
    }
    loadStats();
    // Refresh stats when the page pathname changes to capture fresh entries
    const interval = setInterval(loadStats, 4000);
    return () => clearInterval(interval);
  }, [pathname]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#111113]/90 border-b border-border/40 backdrop-blur-md sticky top-0 z-30 w-full">
        <Link href="/" className="flex items-center space-x-2">
          <Layers className="h-6 w-6 text-accent animate-pulse" />
          <span className="font-display font-bold text-lg text-white tracking-wider">FINPILOT</span>
        </Link>
        <button onClick={toggleSidebar} className="text-white focus:outline-none p-2 hover:bg-muted rounded-lg transition">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Layout */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-20 w-64 bg-[#111113] border-r border-border/40 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:h-screen`}
      >
        <div className="overflow-y-auto flex-1 min-h-0 no-scrollbar">
          {/* Header Branding */}
          <div className="px-6 py-8 border-b border-border/20 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5">
              <Layers className="h-7 w-7 text-accent" />
              <div>
                <span className="font-display font-extrabold text-xl text-white tracking-widest block">FINPILOT</span>
                <span className="text-[9px] text-accent font-semibold uppercase tracking-widest block mt-0.5">Operating System</span>
              </div>
            </Link>
          </div>

          {/* Quick Mode Indicator Badge */}
          <div className="px-6 mt-4">
            <div className={`flex items-center justify-between text-[10px] px-3 py-1.5 rounded-full font-medium ${
              isMock ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-success/10 text-success border border-success/20"
            }`}>
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isMock ? "bg-amber-400 animate-pulse" : "bg-success"}`} />
                {isMock ? "Demo Local JSON" : "Supabase Live Connected"}
              </span>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-4 py-6 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-accent/10 text-accent border-l-2 border-accent font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-muted/40"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 mr-3 transition-colors ${isActive ? "text-accent" : "text-gray-400 group-hover:text-white"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Card / Net Worth Summary Footer */}
        <div className="p-4 border-t border-border/20 bg-black/25">
          {netWorth !== null && (
            <div className="mb-4 px-2.5 py-2.5 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider block">Est. Net Worth</span>
              <span className="text-lg font-bold text-white block mt-0.5 tracking-tight font-display">
                {formatINR(netWorth)}
              </span>
            </div>
          )}

          <Link href="/profile" className="flex items-center space-x-3 px-2 hover:bg-muted/30 p-1.5 rounded-lg transition duration-200 w-full group">
            <div className="h-9 w-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold shadow-lg shadow-accent/5 shrink-0 group-hover:border-accent transition-colors">
              {profile?.full_name ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "AS"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-white block truncate group-hover:text-accent transition-colors">
                {profile?.full_name || "Aarav Sharma"}
              </span>
              <span className="text-[10px] text-gray-500 block truncate">
                {profile?.email || "finance@finpilot.ai"}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
