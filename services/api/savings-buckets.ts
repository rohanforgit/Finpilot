import { createClient } from '../supabase/client';
import { SavingsBucket } from '@/types/database';

export async function getSavingsBuckets(userId: string): Promise<SavingsBucket[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_buckets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching savings buckets:", error);
    return [];
  }

  return data as SavingsBucket[];
}

export async function createSavingsBucket(bucket: Omit<SavingsBucket, 'id' | 'created_at' | 'updated_at'>): Promise<SavingsBucket | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_buckets')
    .insert([bucket])
    .select()
    .single();

  if (error) {
    console.error("Error creating savings bucket:", error);
    return null;
  }

  return data as SavingsBucket;
}

export async function updateSavingsBucket(
  bucketId: string, 
  bucket: Partial<Omit<SavingsBucket, 'id' | 'created_at' | 'updated_at'>>
): Promise<SavingsBucket | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_buckets')
    .update(bucket)
    .eq('id', bucketId)
    .select()
    .single();

  if (error) {
    console.error("Error updating savings bucket:", error);
    return null;
  }

  return data as SavingsBucket;
}

export async function deleteSavingsBucket(bucketId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('savings_buckets')
    .delete()
    .eq('id', bucketId);

  if (error) {
    console.error("Error deleting savings bucket:", error);
    return false;
  }

  return true;
}
