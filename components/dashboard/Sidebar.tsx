"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, PieChart, UploadCloud, PiggyBank, BrainCircuit, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Monthly Plan", href: "/dashboard/plan", icon: PieChart },
  { name: "OCR Upload", href: "/dashboard/upload", icon: UploadCloud },
  { name: "Savings Buckets", href: "/dashboard/buckets", icon: PiggyBank },
  { name: "AI Insights", href: "/dashboard/recommendations", icon: BrainCircuit },
];

const bottomItems = [
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const renderLink = (item: any) => {
    const isActive = pathname === item.href;
    return (
      <Link href={item.href} key={item.name} className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-foreground text-muted-foreground z-10 group">
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute inset-0 bg-white/10 rounded-lg -z-10 border border-white/5"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} />
        <span className={isActive ? 'text-foreground' : ''}>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 h-screen border-r border-white/10 bg-[#09090B]/80 backdrop-blur-xl flex flex-col justify-between hidden md:flex fixed left-0 top-0">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-lg">F</span>
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">FinPilot</span>
        </Link>
        <nav className="space-y-1">
          {navItems.map(renderLink)}
        </nav>
      </div>

      <div className="p-6">
        <nav className="space-y-1 mb-6">
          {bottomItems.map(renderLink)}
        </nav>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
