import { createClient } from '../supabase/client';
import { Recommendation } from '@/types/database';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_applied', false)
    .eq('is_rejected', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }

  // If database is empty, auto-generate starter recommendations based on user profile
  if (!data || data.length === 0) {
    const generated = await generateAndStoreRecommendations(userId);
    if (generated && generated.length > 0) {
      return generated;
    }
  }

  return data as Recommendation[];
}

export async function updateRecommendation(
  recId: string,
  update: Partial<Omit<Recommendation, 'id' | 'user_id' | 'created_at'>>
): Promise<Recommendation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('recommendations')
    .update(update)
    .eq('id', recId)
    .select()
    .single();

  if (error) {
    console.error("Error updating recommendation:", error);
    return null;
  }

  return data as Recommendation;
}

// AI Intelligence Generator for recommendations
async function generateAndStoreRecommendations(userId: string): Promise<Recommendation[]> {
  const supabase = createClient();

  try {
    // 1. Fetch user context
    const { data: plan } = await supabase
      .from('monthly_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan) return []; // No monthly plan set up yet

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .limit(50);

    const { data: buckets } = await supabase
      .from('savings_buckets')
      .select('*')
      .eq('user_id', userId);

    const txList = transactions || [];
    const bucketList = buckets || [];

    let generatedRecs: Omit<Recommendation, 'id' | 'user_id' | 'created_at'>[] = [];

    // 2. Call Gemini API if key is present
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
          }
        });

        const prompt = `
          You are an expert personal financial advisor.
          Analyze the user's monthly budget plan and transaction log:
          - Monthly Income: ₹${plan.income}
          - Allocated Essentials: ₹${plan.allocated_essentials}
          - Allocated Lifestyle: ₹${plan.allocated_lifestyle}
          - Allocated Investments: ₹${plan.allocated_investments}
          - Allocated Savings: ₹${plan.allocated_savings}

          Recent transactions:
          ${txList.map(t => `- ${t.merchant}: ₹${t.amount} (${t.category})`).join('\n')}

          Active savings buckets:
          ${bucketList.map(b => `- ${b.name}: Target ₹${b.target_amount}, Current ₹${b.current_amount}`).join('\n')}

          Generate exactly 2 unique, highly contextual recommendations in JSON format:
          [
            {
              "title": "Short title (e.g. Increase Mutual Fund SIP)",
              "description": "Clear explanation of why they should do this based on their actual numbers (1-2 sentences).",
              "type": "insight" or "warning" or "alert",
              "action": "Action label (e.g. Increase SIP, Create Bucket, Review Budget)"
            }
          ]
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        if (responseText) {
          const parsed = JSON.parse(responseText.trim());
          if (Array.isArray(parsed)) {
            generatedRecs = parsed.map(r => ({
              title: r.title,
              description: r.description,
              type: r.type || 'insight',
              action: r.action || 'Apply',
              is_applied: false,
              is_rejected: false,
            }));
          }
        }
      } catch (geminiError) {
        console.error("Gemini failed, falling back to local rule-based recommendations:", geminiError);
      }
    }

    // 3. Fallback to local heuristic recommendation generator if Gemini is missing or fails
    if (generatedRecs.length === 0) {
      generatedRecs = generateMockRecommendations(plan, bucketList);
    }

    // 4. Save to database
    const dbPayload = generatedRecs.map(rec => ({
      ...rec,
      user_id: userId,
    }));

    const { data: savedRecs, error: insertError } = await supabase
      .from('recommendations')
      .insert(dbPayload)
      .select();

    if (insertError) throw insertError;
    return savedRecs as Recommendation[];

  } catch (err) {
    console.error("Error generating/storing recommendations:", err);
    return [];
  }
}

// Local rules-based recommendation logic for offline/fallback mode
function generateMockRecommendations(plan: any, buckets: any[]): Omit<Recommendation, 'id' | 'user_id' | 'created_at'>[] {
  const recommendations: Omit<Recommendation, 'id' | 'user_id' | 'created_at'>[] = [];

  const totalAllocated = plan.allocated_essentials + plan.allocated_lifestyle + plan.allocated_investments + plan.allocated_savings;
  const surplus = Math.max(0, plan.income - totalAllocated);

  if (surplus > 5000) {
    recommendations.push({
      title: "Increase Mutual Fund SIP",
      description: `You have an unallocated surplus of ₹${surplus.toLocaleString()} this month. We recommend investing at least ₹${Math.round(surplus * 0.5).toLocaleString()} of this into a diversified index fund.`,
      type: "insight",
      action: "Increase SIP",
      is_applied: false,
      is_rejected: false,
    });
  }

  if (plan.allocated_savings < plan.income * 0.1) {
    recommendations.push({
      title: "Boost Emergency Fund",
      description: "Your monthly savings allocation is under 10% of your income. We recommend setting up an emergency fund bucket to cover at least 3 months of essentials.",
      type: "warning",
      action: "Create Bucket",
      is_applied: false,
      is_rejected: false,
    });
  }

  if (buckets.length > 0 && plan.allocated_savings === 0) {
    recommendations.push({
      title: "Fund your Savings Goals",
      description: `You have ${buckets.length} active savings goals, but no monthly savings allocation in your current plan. Allocate a fixed amount to fill these buckets.`,
      type: "alert",
      action: "Allocate Savings",
      is_applied: false,
      is_rejected: false,
    });
  }

  if (recommendations.length < 2) {
    recommendations.push({
      title: "Review Annual Expenses",
      description: "Track your upcoming yearly payments (insurance, taxes, school fees) and convert them to monthly savings buckets to avoid year-end cash crunch.",
      type: "insight",
      action: "Review Plan",
      is_applied: false,
      is_rejected: false,
    });
  }

  return recommendations.slice(0, 2);
}
