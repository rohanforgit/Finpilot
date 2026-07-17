"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoginFormData, SignupFormData } from "../utils/schemas";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/services/supabase/client";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUserStore();
  const supabase = createClient();

  const login = async (data: LoginFormData) => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
      return;
    }
    
    // Clear dummy cookie if logging in with real credentials
    document.cookie = "dummy_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    toast.success("Welcome back!");
    router.push("/dashboard");
  };

  const signup = async (data: SignupFormData) => {
    setIsLoading(true);
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.name,
        }
      }
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created successfully. Please check your email to verify.");
    router.push("/onboarding");
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    setIsLoading(false);
    if (error) toast.error(error.message);
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset instructions sent to your email.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    document.cookie = "dummy_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setUser(null);
    router.push("/login");
  };

  return {
    login,
    signup,
    signInWithGoogle,
    resetPassword,
    logout,
    isLoading,
  };
}
