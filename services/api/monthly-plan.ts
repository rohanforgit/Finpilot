import { createClient } from '../supabase/client';
import { MonthlyPlan } from '@/types/database';

export async function getCurrentMonthlyPlan(userId: string): Promise<MonthlyPlan | null> {
  const supabase = createClient();
  const date = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[date.getMonth()];
  const currentYear = date.getFullYear();

  const { data, error } = await supabase
    .from('monthly_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error("Error fetching monthly plan:", error);
    return null;
  }

  return data as MonthlyPlan;
}

export async function createMonthlyPlan(plan: Omit<MonthlyPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MonthlyPlan | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('monthly_plans')
    .insert([plan])
    .select()
    .single();

  if (error) {
    console.error("Error creating monthly plan:", error);
    return null;
  }

  return data as MonthlyPlan;
}

export async function updateMonthlyPlan(
  planId: string, 
  plan: Partial<Omit<MonthlyPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<MonthlyPlan | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('monthly_plans')
    .update(plan)
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error("Error updating monthly plan:", error);
    return null;
  }

  return data as MonthlyPlan;
}

