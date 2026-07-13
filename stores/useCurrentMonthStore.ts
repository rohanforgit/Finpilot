import { create } from 'zustand';

interface CurrentMonthState {
  month: number;
  year: number;
  setMonth: (month: number, year: number) => void;
}

export const useCurrentMonthStore = create<CurrentMonthState>((set) => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  setMonth: (month, year) => set({ month, year }),
}));
