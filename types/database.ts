export type Category = 
  | "Essentials"
  | "Lifestyle"
  | "Investments"
  | "Savings"
  | "Miscellaneous";

export interface UserProfile {
  id: string; // Maps to Supabase auth.users.id
  email: string;
  first_name: string | null;
  last_name: string | null;
  monthly_income: number | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyPlan {
  id: string;
  user_id: string;
  month: string; // e.g., "July"
  year: number; // e.g., 2026
  income: number;
  allocated_essentials: number;
  allocated_investments: number;
  allocated_savings: number;
  allocated_lifestyle: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  monthly_plan_id: string | null;
  date: string; // ISO String
  merchant: string;
  amount: number;
  category: Category;
  status: "Auto-categorized" | "Manual" | "Subscription" | "Recurring" | "Pending";
  is_planned: boolean;
  notes: string | null;
  created_at: string;
}

export interface SavingsBucket {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  color: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: "insight" | "warning" | "alert";
  action: string;
  is_applied: boolean;
  is_rejected: boolean;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      monthly_plans: {
        Row: MonthlyPlan;
        Insert: Omit<MonthlyPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MonthlyPlan, 'id' | 'created_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
      };
      savings_buckets: {
        Row: SavingsBucket;
        Insert: Omit<SavingsBucket, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SavingsBucket, 'id' | 'created_at' | 'updated_at'>>;
      };
      recommendations: {
        Row: Recommendation;
        Insert: Omit<Recommendation, 'id' | 'created_at'>;
        Update: Partial<Omit<Recommendation, 'id' | 'created_at'>>;
      };
    };
  };
};
