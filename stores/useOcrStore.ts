import { create } from 'zustand';

interface OcrState {
  isProcessing: boolean;
  transactions: any[];
  setProcessing: (isProcessing: boolean) => void;
  setTransactions: (transactions: any[]) => void;
}

export const useOcrStore = create<OcrState>((set) => ({
  isProcessing: false,
  transactions: [],
  setProcessing: (isProcessing) => set({ isProcessing }),
  setTransactions: (transactions) => set({ transactions }),
}));
