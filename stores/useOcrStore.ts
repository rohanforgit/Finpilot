import { create } from 'zustand';
import { Category } from '@/types/database';

export interface OcrTransaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: Category;
  is_planned: boolean;
}

interface OcrState {
  pendingTransactions: OcrTransaction[];
  setPendingTransactions: (txs: OcrTransaction[]) => void;
  updatePendingTransaction: (id: string, data: Partial<OcrTransaction>) => void;
  removePendingTransaction: (id: string) => void;
  clearPendingTransactions: () => void;
}

export const useOcrStore = create<OcrState>((set) => ({
  pendingTransactions: [],
  setPendingTransactions: (txs) => set({ pendingTransactions: txs }),
  updatePendingTransaction: (id, data) => set((state) => ({
    pendingTransactions: state.pendingTransactions.map(tx => tx.id === id ? { ...tx, ...data } : tx)
  })),
  removePendingTransaction: (id) => set((state) => ({
    pendingTransactions: state.pendingTransactions.filter(tx => tx.id !== id)
  })),
  clearPendingTransactions: () => set({ pendingTransactions: [] }),
}));
