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

export async function getCurrentMonthSpent(userId: string): Promise<number> {
  const supabase = createClient();
  const date = new Date();
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', startOfMonth)
    .lte('date', endOfMonth);

  if (error) {
    console.error("Error fetching monthly spending:", error);
    return 0;
  }

  return data ? data.reduce((sum, tx) => sum + Number(tx.amount), 0) : 0;
}

