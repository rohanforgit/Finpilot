import { createClient } from '../supabase/client';
import { Transaction } from '@/types/database';

export async function getRecentTransactions(userId: string, limit = 10): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data as Transaction[];
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    return null;
  }

  return data as Transaction;
}
