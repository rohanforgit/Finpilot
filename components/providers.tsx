"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { createClient } from "@/services/supabase/client";
import { useUserStore } from "@/stores/useUserStore";

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

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUser({
              ...session.user,
              name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || session.user.email : session.user.email,
              monthly_income: profile?.monthly_income || null,
            });
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
        
        setUser({
          ...session.user,
          name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || session.user.email : session.user.email,
          monthly_income: profile?.monthly_income || null,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}

