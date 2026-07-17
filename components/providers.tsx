"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { createClient } from "@/services/supabase/client";
import { useUserStore } from "@/stores/useUserStore";

import { createMonthlyPlan } from "@/services/api/monthly-plan";
import { updateUserProfile } from "@/services/api/profiles";
import { createTransactionsBulk } from "@/services/api/transactions";
import { User } from "@supabase/supabase-js";
import { UserProfile, Transaction, Category, MonthlyPlan } from "@/types/database";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  const { setUser } = useUserStore();

  useEffect(() => {
    const supabase = createClient();

    const saveTempOnboarding = async (userId: string) => {
      if (typeof window === "undefined") return;
      const dataStr = window.localStorage.getItem("temp_onboarding");
      if (!dataStr) return;

      try {
        const { income, expenses } = JSON.parse(dataStr) as {
          income: number;
          expenses: { name: string; amount: number; category?: Category }[] 
        };

        const autoCategorizeExpense = (name: string): Category => {
          const clean = name.toLowerCase();
          if (clean.includes("sip") || clean.includes("invest") || clean.includes("fund") || clean.includes("stock") || clean.includes("equity") || clean.includes("gold")) {
            return "Investments";
          }
          if (clean.includes("saving") || clean.includes("deposit") || clean.includes("emergency")) {
            return "Savings";
          }
          if (clean.includes("gym") || clean.includes("netflix") || clean.includes("spotify") || clean.includes("dine") || clean.includes("restaurant") || clean.includes("movie") || clean.includes("shopping") || clean.includes("entertainment") || clean.includes("lifestyle") || clean.includes("travel")) {
            return "Lifestyle";
          }
          if (clean.includes("tithe") || clean.includes("donation") || clean.includes("charity") || clean.includes("gift") || clean.includes("dad") || clean.includes("support") || clean.includes("transfer") || clean.includes("misc")) {
            return "Miscellaneous";
          }
          return "Essentials";
        };

        const essentialsAlloc = expenses.filter(e => (e.category || autoCategorizeExpense(e.name)) === "Essentials").reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const investmentsAlloc = expenses.filter(e => (e.category || autoCategorizeExpense(e.name)) === "Investments").reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const savingsAlloc = expenses.filter(e => (e.category || autoCategorizeExpense(e.name)) === "Savings").reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const lifestyleAlloc = expenses.filter(e => (e.category || autoCategorizeExpense(e.name)) === "Lifestyle").reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // 1. Update Profile
        await updateUserProfile(userId, { monthly_income: income });

        // 2. Create Monthly Plan
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const date = new Date();
        const currentMonth = monthNames[date.getMonth()];
        const currentYear = date.getFullYear();

        const plan = await createMonthlyPlan({
          user_id: userId,
          month: currentMonth,
          year: currentYear,
          income,
          allocated_essentials: essentialsAlloc,
          allocated_investments: investmentsAlloc,
          allocated_savings: savingsAlloc,
          allocated_lifestyle: lifestyleAlloc,
        });

        if (plan && expenses.length > 0) {
          let hasExisting = false;
          if (userId !== "dummy-user-id") {
            const { data: existingTxs } = await supabase
              .from("transactions")
              .select("id")
              .eq("user_id", userId)
              .eq("monthly_plan_id", plan.id)
              .eq("status", "Recurring")
              .limit(1);
            hasExisting = !!(existingTxs && existingTxs.length > 0);
          }

          if (!hasExisting) {
            const txsToInsert = expenses.map((e) => {
              const cat = e.category || autoCategorizeExpense(e.name);
              return {
                user_id: userId,
                monthly_plan_id: plan.id,
                date: new Date().toISOString(),
                merchant: e.name,
                amount: e.amount,
                category: cat,
                status: "Recurring" as const,
                is_planned: true,
                notes: null,
              };
            });
            await createTransactionsBulk(txsToInsert);
          }
        }

        window.localStorage.removeItem("temp_onboarding");
        queryClient.invalidateQueries();
      } catch (err) {
        console.error("Failed to save temporary onboarding data:", err);
      }
    };

    const syncDummyDataToSupabase = async (userId: string) => {
      if (typeof window === "undefined") return;
      const dummyPlanStr = window.localStorage.getItem("dummy_plan");
      const dummyTxsStr = window.localStorage.getItem("dummy_transactions");

      if (!dummyPlanStr && !dummyTxsStr) return;

      try {
        let planId: string | null = null;

        // 1. Migrate Plan
        if (dummyPlanStr) {
          const dummyPlan = JSON.parse(dummyPlanStr) as MonthlyPlan;

          // Create/update real plan in database
          const plan = await createMonthlyPlan({
            user_id: userId,
            month: dummyPlan.month,
            year: dummyPlan.year,
            income: dummyPlan.income,
            allocated_essentials: dummyPlan.allocated_essentials,
            allocated_investments: dummyPlan.allocated_investments,
            allocated_savings: dummyPlan.allocated_savings,
            allocated_lifestyle: dummyPlan.allocated_lifestyle,
          });

          if (plan) {
            planId = plan.id;
          }

          // Update profile income
          await updateUserProfile(userId, { monthly_income: dummyPlan.income });
        }

        // 2. Migrate Transactions
        if (dummyTxsStr && planId) {
          const dummyTxs = JSON.parse(dummyTxsStr) as Transaction[];

          // To prevent duplicates, let's fetch any existing transactions for this plan first
          let existingCount = 0;
          if (userId !== "dummy-user-id") {
            const { count } = await supabase
              .from("transactions")
              .select("id", { count: "exact", head: true })
              .eq("user_id", userId)
              .eq("monthly_plan_id", planId);
            existingCount = count || 0;
          }

          if (existingCount === 0) {
            const txsToInsert = dummyTxs.map((tx) => ({
              user_id: userId,
              monthly_plan_id: planId!,
              date: tx.date || new Date().toISOString(),
              merchant: tx.merchant,
              amount: tx.amount,
              category: tx.category,
              status: tx.status,
              is_planned: tx.is_planned,
              notes: tx.notes,
            }));
            await createTransactionsBulk(txsToInsert);
          }
        }

        // 3. Clear dummy data from localStorage
        window.localStorage.removeItem("dummy_plan");
        window.localStorage.removeItem("dummy_transactions");
        document.cookie = "dummy_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        queryClient.invalidateQueries();
        toast.success("Successfully synchronized your offline plan and transactions!");
      } catch (e) {
        console.error("Failed to sync offline dummy data to Supabase:", e);
      }
    };

    const syncProfile = async (sessionUser: User, profile: UserProfile | null) => {
      const rawName = sessionUser.user_metadata?.first_name || sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || "";
      const parts = rawName.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      
      if (!profile) {
        try {
          await supabase
            .from("profiles")
            .insert({
              id: sessionUser.id,
              email: sessionUser.email || "",
              first_name: firstName,
              last_name: lastName,
            });
          return {
            name: rawName || sessionUser.email || "",
            monthly_income: null,
          };
        } catch (e) {
          console.error("Failed to auto-create profile:", e);
          return {
            name: rawName || sessionUser.email || "",
            monthly_income: null,
          };
        }
      }

      return {
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || sessionUser.email || "",
        monthly_income: profile.monthly_income,
      };
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(async ({ data: profile }) => {
            const synced = await syncProfile(session.user, profile);
            setUser({
              ...session.user,
              name: synced.name,
              monthly_income: synced.monthly_income,
              avatarUrl: session.user.user_metadata?.avatar_url || undefined,
            });
            await syncDummyDataToSupabase(session.user.id);
            await saveTempOnboarding(session.user.id);
          });
      } else {
        setUser(null);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        const synced = await syncProfile(session.user, profile);
        setUser({
          ...session.user,
          name: synced.name,
          monthly_income: synced.monthly_income,
          avatarUrl: session.user.user_metadata?.avatar_url || undefined,
        });
        await syncDummyDataToSupabase(session.user.id);
        await saveTempOnboarding(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, queryClient]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster theme="light" position="bottom-right" />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
