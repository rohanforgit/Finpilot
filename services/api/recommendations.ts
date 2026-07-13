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
