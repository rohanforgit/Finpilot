export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  onboarded: boolean;
  health_score: number;
  created_at: string;
  updated_at: string;
}

export type AssetType =
  | 'cash'
  | 'bank_account'
  | 'fixed_deposit'
  | 'mutual_fund'
  | 'stock'
  | 'gold'
  | 'epf'
  | 'real_estate';

export interface Asset {
  id: string;
  user_id: string;
  asset_name: string;
  asset_type: AssetType;
  current_value: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type LiabilityType =
  | 'credit_card'
  | 'personal_loan'
  | 'vehicle_loan'
  | 'home_loan'
  | 'education_loan';

export interface Liability {
  id: string;
  user_id: string;
  liability_name: string;
  liability_type: LiabilityType;
  outstanding_amount: number;
  interest_rate: number;
  emi: number;
  remaining_tenure_months: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type IncomeFrequency = 'monthly' | 'annually' | 'one-off';

export interface IncomeSource {
  id: string;
  user_id: string;
  source_name: string;
  amount: number;
  frequency: IncomeFrequency;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type ExpenseCategory =
  | 'food'
  | 'shopping'
  | 'transport'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'others';

export interface Expense {
  id: string;
  user_id: string;
  merchant_name: string;
  amount: number;
  date: string;
  time: string | null;
  category: ExpenseCategory;
  ocr_upload_id: string | null;
  is_manual_corrected: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type GoalType = 'bike' | 'car' | 'house' | 'vacation' | 'education' | 'custom';

export interface Goal {
  id: string;
  user_id: string;
  goal_name: string;
  goal_type: GoalType;
  target_amount: number;
  current_progress: number;
  required_monthly_savings: number;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GoalContribution {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface BudgetPlan {
  id: string;
  user_id: string;
  month: number;
  year: number;
  needs_budget: number;
  wants_budget: number;
  savings_budget: number;
  investments_budget: number;
  emergency_fund_allocation: number;
  goal_contributions_budget: number;
  created_at: string;
  updated_at: string;
}

export type ObligationType = 'emi' | 'insurance' | 'credit_card_bill' | 'subscription' | 'custom';
export type ObligationStatus = 'pending' | 'paid';

export interface Obligation {
  id: string;
  user_id: string;
  name: string;
  obligation_type: ObligationType;
  amount: number;
  due_date: string;
  status: ObligationStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OcrUpload {
  id: string;
  user_id: string;
  file_path: string;
  status: 'processing' | 'success' | 'failed';
  extracted_data: {
    merchant_name?: string;
    amount?: number;
    category?: ExpenseCategory;
    date?: string;
    time?: string;
  } | null;
  processing_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export interface AiReport {
  id: string;
  user_id: string;
  analysis_period: 'monthly' | 'weekly' | 'adhoc';
  health_score: number | null;
  report_data: {
    healthAnalysis: string;
    insights: string[];
    recommendations: string[];
    warnings: string[];
  };
  prompt_text: string | null;
  response_text: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  comments: string | null;
  category: 'general' | 'bug' | 'feature_request' | 'design' | null;
  created_at: string;
}
