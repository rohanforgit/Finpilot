"use server";

import { db } from "@/lib/db";
import { ai } from "@/lib/ai";
import { calculateFinancialHealthScore } from "@/lib/utils";

const DEMO_USER_ID = "demo-user-id";

// Trigger new AI financial coaching report generation
export async function generateNewCoachReport() {
  const userId = DEMO_USER_ID;

  // 1. Gather all database states
  const profile = await db.getProfile(userId);
  const incomes = await db.getIncomes(userId);
  const expenses = await db.getExpenses(userId);
  const assets = await db.getAssets(userId);
  const liabilities = await db.getLiabilities(userId);
  const obligations = await db.getObligations(userId);
  const goals = await db.getGoals(userId);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  // Calculate health score dynamically
  const healthScore = calculateFinancialHealthScore(incomes, expenses, assets, liabilities, obligations);

  // Approximate prompts contents for admin tracking
  const promptSummary = `Generate coaching report for user Aaron. Incomes: ${incomes.length}, Liabilities: ${liabilities.length}, Expenses Count: ${expenses.length}`;

  // 2. Query Gemini/Mock AI
  const reportData = await ai.generateFinancialCoachReport(
    profile,
    incomes,
    expenses,
    assets,
    liabilities,
    obligations,
    goals
  );

  // 3. Save report output in database
  const savedReport = await db.saveAiReport(
    userId,
    "adhoc",
    healthScore,
    reportData,
    promptSummary,
    JSON.stringify(reportData)
  );

  // 4. Update user's profile with calculated health score
  await db.updateProfile(userId, { health_score: healthScore });

  return {
    report: savedReport,
    isMockAI: ai.isMock
  };
}

// Fetch past coach reports
export async function getPastCoachReports() {
  const userId = DEMO_USER_ID;
  const reports = await db.getAiReports(userId);
  return {
    reports,
    isMockAI: ai.isMock
  };
}

// Ask live question to Coach
export async function askCoachLiveQuestion(question: string, chatHistory: { role: 'user' | 'assistant', content: string }[]) {
  const userId = DEMO_USER_ID;

  // 1. Gather all database states for full context
  const profile = await db.getProfile(userId);
  const incomes = await db.getIncomes(userId);
  const expenses = await db.getExpenses(userId);
  const assets = await db.getAssets(userId);
  const liabilities = await db.getLiabilities(userId);
  const obligations = await db.getObligations(userId);
  const goals = await db.getGoals(userId);

  const qLower = question.toLowerCase();

  // COMMAND INTERCEPTION: Mark obligation paid
  if ((qLower.includes("paid") || qLower.includes("clear") || qLower.includes("mark")) && obligations.length > 0) {
    let targetOb = null;
    if (qLower.includes("seltos") || qLower.includes("car") || qLower.includes("loan") || qLower.includes("emi")) {
      targetOb = obligations.find(o => o.name.toLowerCase().includes("seltos") || o.name.toLowerCase().includes("car"));
    } else if (qLower.includes("youtube") || qLower.includes("subscription")) {
      targetOb = obligations.find(o => o.name.toLowerCase().includes("youtube"));
    } else if (qLower.includes("insurance") || qLower.includes("health")) {
      targetOb = obligations.find(o => o.name.toLowerCase().includes("insurance"));
    }

    if (targetOb) {
      await db.markObligationPaid(targetOb.id);
      
      // Recompute health score
      const updatedObs = obligations.map(o => o.id === targetOb.id ? { ...o, status: "paid" as const } : o);
      const score = calculateFinancialHealthScore(incomes, expenses, assets, liabilities, updatedObs);
      await db.updateProfile(userId, { health_score: score });

      const answer = `I have marked your "${targetOb.name}" (amount: ₹${targetOb.amount}) as PAID in your ledger. This reduces your pending obligations and has been updated on your dashboard HUD!`;

      // Save interception record to prompts audit trail
      await db.saveAiReport(
        userId,
        "adhoc",
        score,
        { question, answer, isCommand: true, targetOb: targetOb.name },
        `Command Intercept: "${question}"`,
        JSON.stringify({ answer })
      );

      return {
        success: true,
        answer,
        isMockAI: ai.isMock
      };
    }
  }

  const formattedContext = {
    user: {
      name: profile?.full_name || "Aarav Sharma",
      health_score: profile?.health_score || 80
    },
    incomes: incomes.map(i => ({ name: i.source_name, amount: i.amount, frequency: i.frequency })),
    expenses: expenses.map(e => ({ merchant: e.merchant_name, amount: e.amount, date: e.date, category: e.category })),
    assets: assets.map(a => ({ name: a.asset_name, type: a.asset_type, value: a.current_value })),
    liabilities: liabilities.map(l => ({ name: l.liability_name, type: l.liability_type, outstanding: l.outstanding_amount, emi: l.emi, rate: l.interest_rate })),
    obligations: obligations.map(o => ({ name: o.name, type: o.obligation_type, amount: o.amount, due_date: o.due_date, status: o.status })),
    goals: goals.map(g => ({ name: g.goal_name, type: g.goal_type, target: g.target_amount, current: g.current_progress }))
  };

  const historyText = chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n');

  const prompt = `You are a premium luxury Financial Coach in FinPilot AI.
  Here is the user's current complete financial profile context:
  ${JSON.stringify(formattedContext, null, 2)}

  Chat History:
  ${historyText}

  User's live question: "${question}"

  Instructions:
  1. Provide a direct, short, highly professional, and encouraging response tailored exactly to their numbers.
  2. Keep it under 2-3 sentences. Focus on clarity and high financial acumen.
  3. Use Indian Rupee (₹) currency notations.
  4. Respond in standard text. Output a JSON object matching this schema:
  {
    "answer": "your natural language text response"
  }
  `;

  try {
    const res = await ai.chatWithCoach(prompt, question);

    // Save live advisory chat to prompts audit trail
    await db.saveAiReport(
      userId,
      "adhoc",
      profile?.health_score || 80,
      { question, answer: res.answer, isLiveChat: true },
      `Live Chat: "${question}"`,
      JSON.stringify({ answer: res.answer })
    );

    return {
      success: true,
      answer: res.answer,
      isMockAI: ai.isMock
    };
  } catch (err: any) {
    console.error("Coaching chat action failed:", err);
    return {
      success: false,
      answer: "I ran into an issue while analyzing your live portfolio details. Please try asking again.",
      isMockAI: ai.isMock
    };
  }
}
