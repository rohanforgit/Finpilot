import { createClient } from '../supabase/client';
import { Recommendation } from '@/types/database';

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

