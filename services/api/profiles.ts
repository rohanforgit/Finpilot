import { createClient } from '../supabase/client';
import { UserProfile } from '@/types/database';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data as UserProfile;
}

export async function updateUserProfile(
  userId: string, 
  profile: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return data as UserProfile;
}
