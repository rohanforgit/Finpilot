import fs from "fs";
import path from "path";
import { Asset, Liability, IncomeSource, Expense, Goal, GoalContribution, BudgetPlan, Obligation, OcrUpload, AiReport, Feedback, Profile } from "@/types";
import { supabase } from "./supabase";

const isSupabaseConfigured = supabase !== null;


// File-based Mock Database Path (Stored inside workspace)
const MOCK_DB_PATH = path.join(process.cwd(), "src", "lib", "mockDb.json");

// Default initial state for a luxury user onboarding demonstration
const DEFAULT_MOCK_DATA = {
  profiles: [
    {
      id: "demo-user-id",
      email: "finance@finpilot.ai",
      full_name: "Aarav Sharma",
      role: "user",
      onboarded: true,
      health_score: 84,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "admin-user-id",
      email: "admin@finpilot.ai",
      full_name: "CTO Admin",
      role: "admin",
      onboarded: true,
      health_score: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  income_sources: [
    {
      id: "inc-1",
      user_id: "demo-user-id",
      source_name: "Senior Software Engineer Salary",
      amount: 145000,
      frequency: "monthly",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "inc-2",
      user_id: "demo-user-id",
      source_name: "Freelance UI Development",
      amount: 35000,
      frequency: "monthly",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }
  ],
  assets: [
    {
      id: "ast-1",
      user_id: "demo-user-id",
      asset_name: "HDFC Savings Account Balance",
      asset_type: "bank_account",
      current_value: 320000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "ast-2",
      user_id: "demo-user-id",
      asset_name: "Nippon India Large Cap Mutual Fund",
      asset_type: "mutual_fund",
      current_value: 450000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "ast-3",
      user_id: "demo-user-id",
      asset_name: "Physical Sovereign Gold Bonds",
      asset_type: "gold",
      current_value: 180000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "ast-4",
      user_id: "demo-user-id",
      asset_name: "Emergency Cash Vault",
      asset_type: "cash",
      current_value: 25000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }
  ],
  liabilities: [
    {
      id: "liab-1",
      user_id: "demo-user-id",
      liability_name: "HDFC Car Loan (Kia Seltos)",
      liability_type: "vehicle_loan",
      outstanding_amount: 540000,
      interest_rate: 8.75,
      emi: 14200,
      remaining_tenure_months: 42,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "liab-2",
      user_id: "demo-user-id",
      liability_name: "OneCard Credit Card Outstanding",
      liability_type: "credit_card",
      outstanding_amount: 32000,
      interest_rate: 42.0,
      emi: 0,
      remaining_tenure_months: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }
  ],
  expenses: [
    {
      id: "exp-1",
      user_id: "demo-user-id",
      merchant_name: "Swiggy Food Delivery",
      amount: 1450,
      date: new Date().toISOString().split("T")[0],
      time: "20:45",
      category: "food",
      ocr_upload_id: null,
      is_manual_corrected: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "exp-2",
      user_id: "demo-user-id",
      merchant_name: "Shell Fuel Station",
      amount: 2200,
      date: new Date().toISOString().split("T")[0],
      time: "11:15",
      category: "transport",
      ocr_upload_id: null,
      is_manual_corrected: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "exp-3",
      user_id: "demo-user-id",
      merchant_name: "Zudio Clothing Store",
      amount: 4320,
      date: new Date().toISOString().split("T")[0],
      time: "16:30",
      category: "shopping",
      ocr_upload_id: null,
      is_manual_corrected: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "exp-4",
      user_id: "demo-user-id",
      merchant_name: "Tata Power Electricity Bill",
      amount: 3450,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "10:00",
      category: "bills",
      ocr_upload_id: null,
      is_manual_corrected: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }
  ],
  goals: [
    {
      id: "goal-1",
      user_id: "demo-user-id",
      goal_name: "Royal Enfield Himalayan 450",
      goal_type: "bike",
      target_amount: 320000,
      current_progress: 120000,
      required_monthly_savings: 10000,
      target_date: new Date(Date.now() + 20 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "goal-2",
      user_id: "demo-user-id",
      goal_name: "Iceland Northern Lights Trip",
      goal_type: "vacation",
      target_amount: 450000,
      current_progress: 150000,
      required_monthly_savings: 15000,
      target_date: new Date(Date.now() + 20 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }
  ],
  goal_contributions: [] as GoalContribution[],
  budget_plans: [] as BudgetPlan[],
  obligations: [
    {
      id: "ob-1",
      user_id: "demo-user-id",
      name: "Kia Seltos Car EMI Payment",
      obligation_type: "emi",
      amount: 14200,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "ob-2",
      user_id: "demo-user-id",
      name: "Tata AIG Health Insurance",
      obligation_type: "insurance",
      amount: 2400,
      due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "ob-3",
      user_id: "demo-user-id",
      name: "YouTube Premium Subscription",
      obligation_type: "subscription",
      amount: 189,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }
  ],
  ocr_uploads: [] as OcrUpload[],
  ai_reports: [] as AiReport[],
  feedback: [] as Feedback[],
  admin_logs: [] as any[],
  audit_logs: [] as any[]
};

// Ensure JSON mock file exists and read it
function getMockDb() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const parentDir = path.dirname(MOCK_DB_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(DEFAULT_MOCK_DATA, null, 2), "utf8");
  }
  try {
    const content = fs.readFileSync(MOCK_DB_PATH, "utf8");
    return JSON.parse(content);
  } catch (err) {
    return DEFAULT_MOCK_DATA;
  }
}

function writeMockDb(data: any) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

// Global data-accessor interface
export const db = {
  isMock: !isSupabaseConfigured,

  // profiles CRUD
  async getProfile(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (!error && data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.profiles.find((p: any) => p.id === userId) || null;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("profiles").upsert({ id: userId, ...updates, updated_at: new Date().toISOString() }).select().single();
      if (!error && data) return data;
    }
    const mockDb = getMockDb();
    const index = mockDb.profiles.findIndex((p: any) => p.id === userId);
    if (index !== -1) {
      mockDb.profiles[index] = { ...mockDb.profiles[index], ...updates, updated_at: new Date().toISOString() };
      writeMockDb(mockDb);
      return mockDb.profiles[index];
    }
    const newProfile = {
      id: userId,
      email: "finance@finpilot.ai",
      full_name: "",
      role: "user",
      onboarded: true,
      health_score: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates
    } as Profile;
    mockDb.profiles.push(newProfile);
    writeMockDb(mockDb);
    return newProfile;
  },

  // Income sources CRUD
  async getIncomes(userId: string): Promise<IncomeSource[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("income_sources").select("*").eq("user_id", userId).is("deleted_at", null);
      if (data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.income_sources.filter((i: any) => i.user_id === userId && !i.deleted_at);
  },

  async saveIncome(userId: string, income: Omit<IncomeSource, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at"> & { id?: string }): Promise<IncomeSource> {
    if (isSupabaseConfigured && supabase) {
      if (income.id) {
        const { data } = await supabase.from("income_sources").update({ ...income, updated_at: new Date().toISOString() }).eq("id", income.id).select().single();
        if (data) return data;
      } else {
        const { data } = await supabase.from("income_sources").insert({ ...income, user_id: userId }).select().single();
        if (data) return data;
      }
    }
    const mockDb = getMockDb();
    if (income.id) {
      const idx = mockDb.income_sources.findIndex((i: any) => i.id === income.id);
      if (idx !== -1) {
        mockDb.income_sources[idx] = { ...mockDb.income_sources[idx], ...income, updated_at: new Date().toISOString() };
        writeMockDb(mockDb);
        return mockDb.income_sources[idx];
      }
    }
    const newItem = {
      id: "inc-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      source_name: income.source_name,
      amount: Number(income.amount),
      frequency: income.frequency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    mockDb.income_sources.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async deleteIncome(incomeId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("income_sources").update({ deleted_at: new Date().toISOString() }).eq("id", incomeId);
      return !error;
    }
    const mockDb = getMockDb();
    const idx = mockDb.income_sources.findIndex((i: any) => i.id === incomeId);
    if (idx !== -1) {
      mockDb.income_sources[idx].deleted_at = new Date().toISOString();
      writeMockDb(mockDb);
      return true;
    }
    return false;
  },

  // Assets CRUD
  async getAssets(userId: string): Promise<Asset[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("assets").select("*").eq("user_id", userId).is("deleted_at", null);
      if (data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.assets.filter((a: any) => a.user_id === userId && !a.deleted_at);
  },

  async saveAsset(userId: string, asset: Omit<Asset, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at"> & { id?: string }): Promise<Asset> {
    if (isSupabaseConfigured && supabase) {
      if (asset.id) {
        const { data } = await supabase.from("assets").update({ ...asset, updated_at: new Date().toISOString() }).eq("id", asset.id).select().single();
        if (data) return data;
      } else {
        const { data } = await supabase.from("assets").insert({ ...asset, user_id: userId }).select().single();
        if (data) return data;
      }
    }
    const mockDb = getMockDb();
    if (asset.id) {
      const idx = mockDb.assets.findIndex((a: any) => a.id === asset.id);
      if (idx !== -1) {
        mockDb.assets[idx] = { ...mockDb.assets[idx], ...asset, current_value: Number(asset.current_value), updated_at: new Date().toISOString() };
        writeMockDb(mockDb);
        return mockDb.assets[idx];
      }
    }
    const newItem = {
      id: "ast-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      current_value: Number(asset.current_value),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    mockDb.assets.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async deleteAsset(assetId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("assets").update({ deleted_at: new Date().toISOString() }).eq("id", assetId);
      return !error;
    }
    const mockDb = getMockDb();
    const idx = mockDb.assets.findIndex((a: any) => a.id === assetId);
    if (idx !== -1) {
      mockDb.assets[idx].deleted_at = new Date().toISOString();
      writeMockDb(mockDb);
      return true;
    }
    return false;
  },

  // Liabilities CRUD
  async getLiabilities(userId: string): Promise<Liability[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("liabilities").select("*").eq("user_id", userId).is("deleted_at", null);
      if (data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.liabilities.filter((l: any) => l.user_id === userId && !l.deleted_at);
  },

  async saveLiability(userId: string, liability: Omit<Liability, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at"> & { id?: string }): Promise<Liability> {
    if (isSupabaseConfigured && supabase) {
      if (liability.id) {
        const { data } = await supabase.from("liabilities").update({ ...liability, updated_at: new Date().toISOString() }).eq("id", liability.id).select().single();
        if (data) return data;
      } else {
        const { data } = await supabase.from("liabilities").insert({ ...liability, user_id: userId }).select().single();
        if (data) return data;
      }
    }
    const mockDb = getMockDb();
    if (liability.id) {
      const idx = mockDb.liabilities.findIndex((l: any) => l.id === liability.id);
      if (idx !== -1) {
        mockDb.liabilities[idx] = {
          ...mockDb.liabilities[idx],
          ...liability,
          outstanding_amount: Number(liability.outstanding_amount),
          interest_rate: Number(liability.interest_rate),
          emi: Number(liability.emi),
          remaining_tenure_months: Number(liability.remaining_tenure_months),
          updated_at: new Date().toISOString()
        };
        writeMockDb(mockDb);
        return mockDb.liabilities[idx];
      }
    }
    const newItem = {
      id: "liab-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      liability_name: liability.liability_name,
      liability_type: liability.liability_type,
      outstanding_amount: Number(liability.outstanding_amount),
      interest_rate: Number(liability.interest_rate),
      emi: Number(liability.emi),
      remaining_tenure_months: Number(liability.remaining_tenure_months),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    mockDb.liabilities.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async deleteLiability(liabilityId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("liabilities").update({ deleted_at: new Date().toISOString() }).eq("id", liabilityId);
      return !error;
    }
    const mockDb = getMockDb();
    const idx = mockDb.liabilities.findIndex((l: any) => l.id === liabilityId);
    if (idx !== -1) {
      mockDb.liabilities[idx].deleted_at = new Date().toISOString();
      writeMockDb(mockDb);
      return true;
    }
    return false;
  },

  // Expenses CRUD
  async getExpenses(userId: string): Promise<Expense[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("expenses").select("*").eq("user_id", userId).is("deleted_at", null).order("date", { ascending: false });
      if (data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.expenses
      .filter((e: any) => e.user_id === userId && !e.deleted_at)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async saveExpense(userId: string, expense: Omit<Expense, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at"> & { id?: string }): Promise<Expense> {
    if (isSupabaseConfigured && supabase) {
      if (expense.id) {
        const { data } = await supabase.from("expenses").update({ ...expense, updated_at: new Date().toISOString() }).eq("id", expense.id).select().single();
        if (data) return data;
      } else {
        const { data } = await supabase.from("expenses").insert({ ...expense, user_id: userId }).select().single();
        if (data) return data;
      }
    }
    const mockDb = getMockDb();
    if (expense.id) {
      const idx = mockDb.expenses.findIndex((e: any) => e.id === expense.id);
      if (idx !== -1) {
        mockDb.expenses[idx] = {
          ...mockDb.expenses[idx],
          ...expense,
          amount: Number(expense.amount),
          updated_at: new Date().toISOString()
        };
        writeMockDb(mockDb);
        return mockDb.expenses[idx];
      }
    }
    const newItem = {
      id: "exp-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      merchant_name: expense.merchant_name,
      amount: Number(expense.amount),
      date: expense.date,
      time: expense.time,
      category: expense.category,
      ocr_upload_id: expense.ocr_upload_id,
      is_manual_corrected: expense.is_manual_corrected,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    mockDb.expenses.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async deleteExpense(expenseId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("expenses").update({ deleted_at: new Date().toISOString() }).eq("id", expenseId);
      return !error;
    }
    const mockDb = getMockDb();
    const idx = mockDb.expenses.findIndex((e: any) => e.id === expenseId);
    if (idx !== -1) {
      mockDb.expenses[idx].deleted_at = new Date().toISOString();
      writeMockDb(mockDb);
      return true;
    }
    return false;
  },

  // Goals CRUD
  async getGoals(userId: string): Promise<Goal[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("goals").select("*").eq("user_id", userId).is("deleted_at", null);
      if (data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.goals.filter((g: any) => g.user_id === userId && !g.deleted_at);
  },

  async saveGoal(userId: string, goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at"> & { id?: string }): Promise<Goal> {
    if (isSupabaseConfigured && supabase) {
      if (goal.id) {
        const { data } = await supabase.from("goals").update({ ...goal, updated_at: new Date().toISOString() }).eq("id", goal.id).select().single();
        if (data) return data;
      } else {
        const { data } = await supabase.from("goals").insert({ ...goal, user_id: userId }).select().single();
        if (data) return data;
      }
    }
    const mockDb = getMockDb();
    if (goal.id) {
      const idx = mockDb.goals.findIndex((g: any) => g.id === goal.id);
      if (idx !== -1) {
        mockDb.goals[idx] = {
          ...mockDb.goals[idx],
          ...goal,
          target_amount: Number(goal.target_amount),
          current_progress: Number(goal.current_progress),
          required_monthly_savings: Number(goal.required_monthly_savings),
          updated_at: new Date().toISOString()
        };
        writeMockDb(mockDb);
        return mockDb.goals[idx];
      }
    }
    const newItem = {
      id: "goal-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      goal_name: goal.goal_name,
      goal_type: goal.goal_type,
      target_amount: Number(goal.target_amount),
      current_progress: Number(goal.current_progress),
      required_monthly_savings: Number(goal.required_monthly_savings),
      target_date: goal.target_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    mockDb.goals.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async addGoalContribution(userId: string, goalId: string, amount: number, date: string): Promise<GoalContribution> {
    if (isSupabaseConfigured && supabase) {
      // 1. Insert contribution
      const { data: contrib } = await supabase.from("goal_contributions").insert({ user_id: userId, goal_id: goalId, amount, date }).select().single();
      // 2. Fetch goal and update progress
      const { data: goal } = await supabase.from("goals").select("current_progress").eq("id", goalId).single();
      if (goal) {
        const newProgress = Number(goal.current_progress) + amount;
        await supabase.from("goals").update({ current_progress: newProgress }).eq("id", goalId);
      }
      if (contrib) return contrib;
    }
    const mockDb = getMockDb();
    const contribItem = {
      id: "contrib-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      goal_id: goalId,
      amount: Number(amount),
      date,
      created_at: new Date().toISOString(),
    };
    mockDb.goal_contributions.push(contribItem);

    // Update goal
    const goalIdx = mockDb.goals.findIndex((g: any) => g.id === goalId);
    if (goalIdx !== -1) {
      mockDb.goals[goalIdx].current_progress = Number(mockDb.goals[goalIdx].current_progress) + Number(amount);
      mockDb.goals[goalIdx].updated_at = new Date().toISOString();
    }
    writeMockDb(mockDb);
    return contribItem;
  },

  // Obligations CRUD
  async getObligations(userId: string): Promise<Obligation[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("obligations").select("*").eq("user_id", userId).is("deleted_at", null).order("due_date", { ascending: true });
      if (data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.obligations
      .filter((o: any) => o.user_id === userId && !o.deleted_at)
      .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  },

  async saveObligation(userId: string, obligation: Omit<Obligation, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at"> & { id?: string }): Promise<Obligation> {
    if (isSupabaseConfigured && supabase) {
      if (obligation.id) {
        const { data } = await supabase.from("obligations").update({ ...obligation, updated_at: new Date().toISOString() }).eq("id", obligation.id).select().single();
        if (data) return data;
      } else {
        const { data } = await supabase.from("obligations").insert({ ...obligation, user_id: userId }).select().single();
        if (data) return data;
      }
    }
    const mockDb = getMockDb();
    if (obligation.id) {
      const idx = mockDb.obligations.findIndex((o: any) => o.id === obligation.id);
      if (idx !== -1) {
        mockDb.obligations[idx] = {
          ...mockDb.obligations[idx],
          ...obligation,
          amount: Number(obligation.amount),
          updated_at: new Date().toISOString()
        };
        writeMockDb(mockDb);
        return mockDb.obligations[idx];
      }
    }
    const newItem = {
      id: "ob-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      name: obligation.name,
      obligation_type: obligation.obligation_type,
      amount: Number(obligation.amount),
      due_date: obligation.due_date,
      status: obligation.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    mockDb.obligations.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async markObligationPaid(obligationId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("obligations").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", obligationId);
      return !error;
    }
    const mockDb = getMockDb();
    const idx = mockDb.obligations.findIndex((o: any) => o.id === obligationId);
    if (idx !== -1) {
      mockDb.obligations[idx].status = "paid";
      mockDb.obligations[idx].updated_at = new Date().toISOString();
      writeMockDb(mockDb);
      return true;
    }
    return false;
  },

  async deleteObligation(obligationId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("obligations").update({ deleted_at: new Date().toISOString() }).eq("id", obligationId);
      return !error;
    }
    const mockDb = getMockDb();
    const idx = mockDb.obligations.findIndex((o: any) => o.id === obligationId);
    if (idx !== -1) {
      mockDb.obligations[idx].deleted_at = new Date().toISOString();
      writeMockDb(mockDb);
      return true;
    }
    return false;
  },

  // Budget Plans CRUD
  async getBudgetPlan(userId: string, month: number, year: number): Promise<BudgetPlan | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("budget_plans").select("*").eq("user_id", userId).eq("month", month).eq("year", year).single();
      if (data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.budget_plans.find((b: any) => b.user_id === userId && b.month === month && b.year === year) || null;
  },

  async saveBudgetPlan(userId: string, plan: Omit<BudgetPlan, "id" | "user_id" | "created_at" | "updated_at">): Promise<BudgetPlan> {
    if (isSupabaseConfigured && supabase) {
      // Check first
      const { data: existing } = await supabase.from("budget_plans").select("id").eq("user_id", userId).eq("month", plan.month).eq("year", plan.year).single();
      if (existing) {
        const { data } = await supabase.from("budget_plans").update({ ...plan, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single();
        if (data) return data;
      } else {
        const { data } = await supabase.from("budget_plans").insert({ ...plan, user_id: userId }).select().single();
        if (data) return data;
      }
    }
    const mockDb = getMockDb();
    const idx = mockDb.budget_plans.findIndex((b: any) => b.user_id === userId && b.month === plan.month && b.year === plan.year);
    if (idx !== -1) {
      mockDb.budget_plans[idx] = {
        ...mockDb.budget_plans[idx],
        ...plan,
        needs_budget: Number(plan.needs_budget),
        wants_budget: Number(plan.wants_budget),
        savings_budget: Number(plan.savings_budget),
        investments_budget: Number(plan.investments_budget),
        emergency_fund_allocation: Number(plan.emergency_fund_allocation),
        goal_contributions_budget: Number(plan.goal_contributions_budget),
        updated_at: new Date().toISOString()
      };
      writeMockDb(mockDb);
      return mockDb.budget_plans[idx];
    }
    const newItem = {
      id: "budget-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      ...plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.budget_plans.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  // OCR Uploads
  async logOcrUpload(userId: string, filePath: string, status: 'processing' | 'success' | 'failed', extractedData?: any, processingTime?: number, errorMsg?: string): Promise<OcrUpload> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("ocr_uploads").insert({
        user_id: userId,
        file_path: filePath,
        status,
        extracted_data: extractedData || null,
        processing_time_ms: processingTime || null,
        error_message: errorMsg || null
      }).select().single();
      if (data) return data;
    }
    const mockDb = getMockDb();
    const newItem = {
      id: "ocr-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      file_path: filePath,
      status,
      extracted_data: extractedData || null,
      processing_time_ms: processingTime || null,
      error_message: errorMsg || null,
      created_at: new Date().toISOString()
    };
    mockDb.ocr_uploads.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async getOcrLogs(): Promise<OcrUpload[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("ocr_uploads").select("*").order("created_at", { ascending: false });
      if (data) return data;
    }
    const mockDb = getMockDb();
    return [...mockDb.ocr_uploads].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // AI Reports CRUD
  async saveAiReport(userId: string, period: 'monthly' | 'weekly' | 'adhoc', healthScore: number, reportData: any, prompt: string, response: string): Promise<AiReport> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("ai_reports").insert({
        user_id: userId,
        analysis_period: period,
        health_score: healthScore,
        report_data: reportData,
        prompt_text: prompt,
        response_text: response
      }).select().single();
      if (data) return data;
    }
    const mockDb = getMockDb();
    const newItem = {
      id: "rep-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      analysis_period: period,
      health_score: healthScore,
      report_data: reportData,
      prompt_text: prompt,
      response_text: response,
      created_at: new Date().toISOString()
    };
    mockDb.ai_reports.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async getAiReports(userId: string): Promise<AiReport[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("ai_reports").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (data) return data;
    }
    const mockDb = getMockDb();
    return mockDb.ai_reports
      .filter((r: any) => r.user_id === userId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getAllAiReports(): Promise<AiReport[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("ai_reports").select("*").order("created_at", { ascending: false });
      if (data) return data;
    }
    const mockDb = getMockDb();
    return [...mockDb.ai_reports].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Feedback CRUD
  async saveFeedback(userId: string, rating: number, comments: string, category: 'general' | 'bug' | 'feature_request' | 'design'): Promise<Feedback> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("feedback").insert({
        user_id: userId,
        rating,
        comments,
        category
      }).select().single();
      if (data) return data;
    }
    const mockDb = getMockDb();
    const newItem = {
      id: "fb-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      rating,
      comments,
      category,
      created_at: new Date().toISOString()
    };
    mockDb.feedback.push(newItem);
    writeMockDb(mockDb);
    return newItem;
  },

  async getAllFeedback(): Promise<Feedback[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      if (data) return data;
    }
    const mockDb = getMockDb();
    return [...mockDb.feedback].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Admin and audit telemetry
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    ocrCount: number;
    ocrSuccess: number;
    ocrFailed: number;
    avgOcrTimeMs: number;
    aiReportsCount: number;
    feedbackCount: number;
    avgFeedbackRating: number;
  }> {
    const mockDb = getMockDb();
    const ocrLogs = mockDb.ocr_uploads;
    const aiReports = mockDb.ai_reports;
    const feedbackList = mockDb.feedback;
    const profiles = mockDb.profiles;

    const totalUsers = profiles.length;
    const activeUsers = profiles.length; // all demo users are active
    const ocrCount = ocrLogs.length;
    const ocrSuccess = ocrLogs.filter((o: any) => o.status === "success").length;
    const ocrFailed = ocrLogs.filter((o: any) => o.status === "failed").length;
    const avgOcrTimeMs = ocrCount > 0
      ? Math.round(ocrLogs.reduce((sum: number, o: any) => sum + (o.processing_time_ms || 0), 0) / ocrCount)
      : 0;
    const aiReportsCount = aiReports.length;
    const feedbackCount = feedbackList.length;
    const avgFeedbackRating = feedbackCount > 0
      ? Number((feedbackList.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbackCount).toFixed(1))
      : 0;

    return {
      totalUsers,
      activeUsers,
      ocrCount,
      ocrSuccess,
      ocrFailed,
      avgOcrTimeMs,
      aiReportsCount,
      feedbackCount,
      avgFeedbackRating
    };
  }
};
