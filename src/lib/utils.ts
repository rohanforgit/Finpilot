import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Asset, Liability, IncomeSource, Expense, Goal, Obligation } from "@/types";

// Tailwind Class Merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Indian Rupees (INR)
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate True Net Worth: Sum of Assets - Sum of Liabilities
export function calculateNetWorth(assets: Asset[], liabilities: Liability[]): {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
} {
  const activeAssets = assets.filter(a => !a.deleted_at);
  const activeLiabilities = liabilities.filter(l => !l.deleted_at);

  const totalAssets = activeAssets.reduce((sum, item) => sum + Number(item.current_value), 0);
  const totalLiabilities = activeLiabilities.reduce((sum, item) => sum + Number(item.outstanding_amount), 0);
  const netWorth = totalAssets - totalLiabilities;

  return { totalAssets, totalLiabilities, netWorth };
}

// Standard EMI calculation formula: P * r * (1+r)^n / ((1+r)^n - 1)
export function calculateEMI(principal: number, annualInterestRate: number, tenureMonths: number): number {
  if (principal <= 0 || annualInterestRate <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualInterestRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return isNaN(emi) ? 0 : Number(emi.toFixed(2));
}

// Calculate Financial Health Score (0 - 100)
export function calculateFinancialHealthScore(
  incomes: IncomeSource[],
  expenses: Expense[],
  assets: Asset[],
  liabilities: Liability[],
  obligations: Obligation[]
): number {
  let score = 100;

  // 1. Calculate monthly income
  const monthlyIncome = incomes
    .filter(i => !i.deleted_at)
    .reduce((sum, inc) => {
      const amt = Number(inc.amount);
      if (inc.frequency === "monthly") return sum + amt;
      if (inc.frequency === "annually") return sum + amt / 12;
      return sum; // one-off not added to recurring monthly
    }, 0);

  if (monthlyIncome <= 0) return 30; // base floor for no recorded income

  // 2. Calculate monthly liabilities / obligations (debt to income ratio)
  const monthlyLiabilitiesPayment = liabilities
    .filter(l => !l.deleted_at)
    .reduce((sum, liab) => sum + Number(liab.emi), 0);

  const monthlyBillsPayment = obligations
    .filter(o => !o.deleted_at && o.status === "pending")
    .reduce((sum, ob) => sum + Number(ob.amount), 0);

  const debtServiceRatio = ((monthlyLiabilitiesPayment + monthlyBillsPayment) / monthlyIncome) * 100;

  // Deduct based on Debt-to-Income (ideal < 35%)
  if (debtServiceRatio > 50) {
    score -= 35;
  } else if (debtServiceRatio > 35) {
    score -= 20;
  } else if (debtServiceRatio > 20) {
    score -= 10;
  }

  // 3. Emergency Fund Ratio (ideal >= 3 months of expenses covered by cash/bank assets)
  const liquidAssets = assets
    .filter(a => !a.deleted_at && (a.asset_type === "cash" || a.asset_type === "bank_account"))
    .reduce((sum, item) => sum + Number(item.current_value), 0);

  const monthlyExpenses = expenses
    .filter(e => !e.deleted_at)
    .reduce((sum, item) => sum + Number(item.amount), 0); // basic filter or raw average

  const averageMonthlyExpenses = monthlyExpenses > 0 ? monthlyExpenses : (monthlyIncome * 0.7); // fallback
  const emergencyFundMonths = liquidAssets / (averageMonthlyExpenses || 1);

  if (emergencyFundMonths < 1) {
    score -= 25;
  } else if (emergencyFundMonths < 3) {
    score -= 15;
  } else if (emergencyFundMonths >= 6) {
    score += 5; // bonus health
  }

  // 4. Savings Rate (Monthly income - monthly expenses - emi) / income (ideal >= 20%)
  const monthlySurplus = monthlyIncome - averageMonthlyExpenses - monthlyLiabilitiesPayment;
  const savingsRate = (monthlySurplus / monthlyIncome) * 100;

  if (savingsRate < 0) {
    score -= 20; // deficit
  } else if (savingsRate < 10) {
    score -= 10;
  } else if (savingsRate >= 20) {
    score += 5; // bonus
  }

  // Keep score between 0 and 100
  return Math.min(Math.max(Math.round(score), 0), 100);
}

// Generate Budget Plan recommendations using 50/30/20 guidelines
export function calculateBudgetRecommendations(
  incomes: IncomeSource[],
  liabilities: Liability[],
  obligations: Obligation[],
  expenses: Expense[],
  goals: Goal[]
): {
  needs: number;
  wants: number;
  savings: number;
  investments: number;
  emergencyFundAllocation: number;
  goalContributions: number;
} {
  const monthlyIncome = incomes
    .filter(i => !i.deleted_at)
    .reduce((sum, inc) => {
      const amt = Number(inc.amount);
      return inc.frequency === "monthly" ? sum + amt : inc.frequency === "annually" ? sum + amt / 12 : sum;
    }, 0);

  // Default distribution rules based on 50/30/20
  const recommendedNeeds = monthlyIncome * 0.5;
  const recommendedWants = monthlyIncome * 0.3;
  const recommendedSavings = monthlyIncome * 0.2;

  // Let's divide Savings into Investments (60%), Goals (30%), Emergency Fund (10%)
  const emergencyFundAllocation = recommendedSavings * 0.15;
  const goalContributions = recommendedSavings * 0.45;
  const investments = recommendedSavings * 0.4;

  return {
    needs: recommendedNeeds,
    wants: recommendedWants,
    savings: recommendedSavings,
    investments: investments,
    emergencyFundAllocation: emergencyFundAllocation,
    goalContributions: goalContributions,
  };
}

// Calculate Goal Feasibility and Affordability
export function calculateGoalFeasibility(
  goal: Goal,
  monthlyIncome: number,
  monthlySurplus: number
): {
  feasibilityScore: number; // 0 - 100
  affordabilityScore: number; // 0 - 100
  projectedCompletionDate: string;
  requiredMonthlySavings: number;
} {
  const target = Number(goal.target_amount);
  const current = Number(goal.current_progress);
  const remaining = Math.max(target - current, 0);

  // If already reached
  if (remaining === 0) {
    return {
      feasibilityScore: 100,
      affordabilityScore: 100,
      projectedCompletionDate: "Achieved",
      requiredMonthlySavings: 0,
    };
  }

  // Calculate target months
  let targetMonths = 12; // default if not specified
  if (goal.target_date) {
    const today = new Date();
    const targetDateObj = new Date(goal.target_date);
    const diffTime = targetDateObj.getTime() - today.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    targetMonths = Math.max(diffMonths, 1);
  }

  const requiredMonthlySavings = remaining / targetMonths;

  // Affordability: how much of the monthly income is this required savings? (Ideal < 15% of income)
  const incomePct = (requiredMonthlySavings / (monthlyIncome || 1)) * 100;
  let affordabilityScore = 100;
  if (incomePct > 50) affordabilityScore = 10;
  else if (incomePct > 30) affordabilityScore = 30;
  else if (incomePct > 15) affordabilityScore = 60;
  else affordabilityScore = 90;

  // Feasibility: comparing required monthly savings to actual current monthly surplus
  let feasibilityScore = 100;
  if (monthlySurplus <= 0) {
    feasibilityScore = 10;
  } else {
    const ratio = requiredMonthlySavings / monthlySurplus;
    if (ratio > 2.0) feasibilityScore = 15;
    else if (ratio > 1.0) feasibilityScore = 40;
    else if (ratio > 0.5) feasibilityScore = 70;
    else feasibilityScore = 95;
  }

  // Completion calculation based on actual monthly surplus savings rate
  const realisticSavings = Math.max(requiredMonthlySavings, monthlySurplus * 0.5, 100);
  const monthsToComplete = Math.ceil(remaining / realisticSavings);
  
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
  const projectedCompletionDate = completionDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });

  return {
    feasibilityScore,
    affordabilityScore,
    projectedCompletionDate,
    requiredMonthlySavings: Math.round(requiredMonthlySavings),
  };
}
