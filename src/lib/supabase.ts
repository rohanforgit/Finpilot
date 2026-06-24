import { createClient } from "@supabase/supabase-js";

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured =
  supabaseUrl !== "" &&
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  supabaseAnonKey !== "" &&
  !supabaseAnonKey.startsWith("sb_publishable_");

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
