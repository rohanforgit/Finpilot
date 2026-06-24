"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Layers } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (!supabase) {
      router.push("/dashboard");
      return;
    }

    // Set cookie on auth state change to capture session token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        document.cookie = `finpilot-user-id=${session.user.id}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`;
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        document.cookie = "finpilot-user-id=; path=/; max-age=0";
        router.push("/login");
      }
    });

    // Also check current session directly in case auth change event fired already
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        document.cookie = `finpilot-user-id=${session.user.id}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`;
        router.push("/dashboard");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-white space-y-4">
      <Layers className="h-10 w-10 text-accent animate-pulse" />
      <p className="text-xs uppercase tracking-widest text-accent/80 font-semibold animate-pulse">Completing Handshake...</p>
    </div>
  );
}
