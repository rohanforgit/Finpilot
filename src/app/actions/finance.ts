"use server";

import { db } from "@/lib/db";
import { ai } from "@/lib/ai";
import {
  calculateNetWorth,
  calculateFinancialHealthScore,
  calculateBudgetRecommendations,
  calculateEMI
} from "@/lib/utils";
import { Asset, Liability, IncomeSource, Expense, Goal, Obligation } from "@/types";

const DEMO_USER_ID = "demo-user-id"; // Constant fallback ID for local/demo workflows

// Get Profile & Check Onboarding Status
export async function getProfile() {
  return await db.getProfile(DEMO_USER_ID);
}

// Onboarding Submission Action
export async function saveOnboardingData(data: {
  fullName: string;
  incomes: { source_name: string; amount: number; frequency: 'monthly' | 'annually' }[];
  assets: { asset_name: string; asset_type: string; current_value: number }[];
  liabilities: { liability_name: string; liability_type: string; outstanding_amount: number; interest_rate: number; remaining_tenure_months: number; emi?: number }[];
  obligations: { name: string; obligation_type: string; amount: number; due_date: string }[];
  goals: { goal_name: string; goal_type: string; target_amount: number; target_date?: string }[];
}) {
  const userId = DEMO_USER_ID;

  // 1. Save Incomes
  for (const inc of data.incomes) {
    await db.saveIncome(userId, {
      source_name: inc.source_name,
      amount: inc.amount,
      frequency: inc.frequency
    });
  }

  // 2. Save Assets
  for (const ast of data.assets) {
    await db.saveAsset(userId, {
      asset_name: ast.asset_name,
      asset_type: ast.asset_type as any,
      current_value: ast.current_value
    });
  }

  // 3. Save Liabilities (Auto-calculate EMI if not specified)
  for (const liab of data.liabilities) {
    const emi = liab.emi || calculateEMI(liab.outstanding_amount, liab.interest_rate, liab.remaining_tenure_months);
    await db.saveLiability(userId, {
      liability_name: liab.liability_name,
      liability_type: liab.liability_type as any,
      outstanding_amount: liab.outstanding_amount,
      interest_rate: liab.interest_rate,
      emi,
      remaining_tenure_months: liab.remaining_tenure_months
    });
  }

  // 4. Save Obligations
  for (const ob of data.obligations) {
    await db.saveObligation(userId, {
      name: ob.name,
      obligation_type: ob.obligation_type as any,
      amount: ob.amount,
      due_date: ob.due_date,
      status: "pending"
    });
  }

  // 5. Save Goals
  for (const g of data.goals) {
    await db.saveGoal(userId, {
      goal_name: g.goal_name,
      goal_type: g.goal_type as any,
      target_amount: g.target_amount,
      current_progress: 0,
      required_monthly_savings: 0,
      target_date: g.target_date || null
    });
  }

  // 6. Update User Profile Status
  const profile = await db.getProfile(userId);
  await db.updateProfile(userId, {
    full_name: data.fullName,
    onboarded: true
  });

  // 7. Calculate initial health score
  await recomputeHealthScore(userId);

  return { success: true };
}

// Recompute and update profile health score in background
async function recomputeHealthScore(userId: string) {
  const incomes = await db.getIncomes(userId);
  const expenses = await db.getExpenses(userId);
  const assets = await db.getAssets(userId);
  const liabilities = await db.getLiabilities(userId);
  const obligations = await db.getObligations(userId);

  const score = calculateFinancialHealthScore(incomes, expenses, assets, liabilities, obligations);
  await db.updateProfile(userId, { health_score: score });
  return score;
}

// Fetch Full Dashboard Data
export async function getDashboardData() {
  const userId = DEMO_USER_ID;

  const profile = await db.getProfile(userId);
  const incomes = await db.getIncomes(userId);
  const assets = await db.getAssets(userId);
  const liabilities = await db.getLiabilities(userId);
  const expenses = await db.getExpenses(userId);
  const obligations = await db.getObligations(userId);
  const goals = await db.getGoals(userId);

  // Net worth numbers
  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(assets, liabilities);

  // Monthly surplus
  const monthlyIncome = incomes.reduce((sum, inc) => {
    return inc.frequency === "monthly" ? sum + Number(inc.amount) : inc.frequency === "annually" ? sum + Number(inc.amount) / 12 : sum;
  }, 0);
  const monthlyExpensesTotal = expenses
    .filter(e => {
      // average expenses for last 30 days
      const days = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 30;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const emiTotal = liabilities.reduce((sum, l) => sum + Number(l.emi), 0);
  const monthlySurplus = monthlyIncome - monthlyExpensesTotal - emiTotal;

  // Budget recommends
  const budgetRecommend = calculateBudgetRecommendations(incomes, liabilities, obligations, expenses, goals);

  return {
    profile,
    incomes,
    assets,
    liabilities,
    expenses,
    obligations,
    goals,
    netWorth: {
      totalAssets,
      totalLiabilities,
      value: netWorth
    },
    monthlySurplus,
    monthlyIncome,
    monthlyExpensesTotal,
    emiTotal,
    budgetRecommend,
    isMockDB: db.isMock
  };
}

// CRUD - Assets Actions
export async function addAsset(asset: { asset_name: string; asset_type: string; current_value: number }) {
  const res = await db.saveAsset(DEMO_USER_ID, {
    asset_name: asset.asset_name,
    asset_type: asset.asset_type as any,
    current_value: asset.current_value
  });
  await recomputeHealthScore(DEMO_USER_ID);
  return res;
}

export async function deleteAsset(id: string) {
  const success = await db.deleteAsset(id);
  await recomputeHealthScore(DEMO_USER_ID);
  return success;
}

// CRUD - Liabilities Actions
export async function addLiability(liability: { liability_name: string; liability_type: string; outstanding_amount: number; interest_rate: number; remaining_tenure_months: number }) {
  const emi = calculateEMI(liability.outstanding_amount, liability.interest_rate, liability.remaining_tenure_months);
  const res = await db.saveLiability(DEMO_USER_ID, {
    liability_name: liability.liability_name,
    liability_type: liability.liability_type as any,
    outstanding_amount: liability.outstanding_amount,
    interest_rate: liability.interest_rate,
    emi,
    remaining_tenure_months: liability.remaining_tenure_months
  });
  await recomputeHealthScore(DEMO_USER_ID);
  return res;
}

export async function deleteLiability(id: string) {
  const success = await db.deleteLiability(id);
  await recomputeHealthScore(DEMO_USER_ID);
  return success;
}

// CRUD - Expense Actions
export async function addExpense(expense: { merchant_name: string; amount: number; date: string; time?: string; category: string; ocr_upload_id?: string; is_manual_corrected?: boolean }) {
  const res = await db.saveExpense(DEMO_USER_ID, {
    merchant_name: expense.merchant_name,
    amount: expense.amount,
    date: expense.date,
    time: expense.time || null,
    category: expense.category as any,
    ocr_upload_id: expense.ocr_upload_id || null,
    is_manual_corrected: expense.is_manual_corrected || false
  });
  await recomputeHealthScore(DEMO_USER_ID);
  return res;
}

export async function deleteExpense(id: string) {
  const success = await db.deleteExpense(id);
  await recomputeHealthScore(DEMO_USER_ID);
  return success;
}

// CRUD - Goal Actions
export async function addGoal(goal: { goal_name: string; goal_type: string; target_amount: number; target_date?: string }) {
  const res = await db.saveGoal(DEMO_USER_ID, {
    goal_name: goal.goal_name,
    goal_type: goal.goal_type as any,
    target_amount: goal.target_amount,
    current_progress: 0,
    required_monthly_savings: 0,
    target_date: goal.target_date || null
  });
  return res;
}

export async function addGoalContribution(goalId: string, amount: number) {
  const today = new Date().toISOString().split("T")[0];
  const res = await db.addGoalContribution(DEMO_USER_ID, goalId, amount, today);
  return res;
}

// CRUD - Obligations Actions
export async function addObligation(ob: { name: string; obligation_type: string; amount: number; due_date: string }) {
  const res = await db.saveObligation(DEMO_USER_ID, {
    name: ob.name,
    obligation_type: ob.obligation_type as any,
    amount: ob.amount,
    due_date: ob.due_date,
    status: "pending"
  });
  await recomputeHealthScore(DEMO_USER_ID);
  return res;
}

export async function markObligationPaid(id: string) {
  const success = await db.markObligationPaid(id);
  await recomputeHealthScore(DEMO_USER_ID);
  return success;
}

export async function deleteObligation(id: string) {
  const success = await db.deleteObligation(id);
  await recomputeHealthScore(DEMO_USER_ID);
  return success;
}

// Submitting User Feedback
export async function submitFeedback(rating: number, comments: string, category: 'general' | 'bug' | 'feature_request' | 'design') {
  return await db.saveFeedback(DEMO_USER_ID, rating, comments, category);
}

// CRUD - Income Actions
export async function addIncome(income: { source_name: string; amount: number; frequency: 'monthly' | 'annually' | 'one-off' }) {
  const res = await db.saveIncome(DEMO_USER_ID, {
    source_name: income.source_name,
    amount: income.amount,
    frequency: income.frequency
  });
  await recomputeHealthScore(DEMO_USER_ID);
  return res;
}

export async function updateIncome(id: string, income: { source_name: string; amount: number; frequency: 'monthly' | 'annually' | 'one-off' }) {
  const res = await db.saveIncome(DEMO_USER_ID, {
    id,
    source_name: income.source_name,
    amount: income.amount,
    frequency: income.frequency
  });
  await recomputeHealthScore(DEMO_USER_ID);
  return res;
}

export async function deleteIncome(id: string) {
  const success = await db.deleteIncome(id);
  await recomputeHealthScore(DEMO_USER_ID);
  return success;
}

export async function updateProfileInfo(fullName: string, email: string) {
  const res = await db.updateProfile(DEMO_USER_ID, {
    full_name: fullName,
    email: email
  });
  await recomputeHealthScore(DEMO_USER_ID);
  return res;
}
