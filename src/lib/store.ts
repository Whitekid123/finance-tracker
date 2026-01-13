// src/lib/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Import persistence tools
import { Transaction } from './types';

interface AppState {
  transactions: Transaction[];
  setTransactions: (txns: Transaction[]) => void;
  addTransaction: (txn: Transaction) => void;
  clearTransactions: () => void; // New feature: Clear data
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: [],
      setTransactions: (txns) => set({ transactions: txns }),
      addTransaction: (txn) => set((state) => ({ 
        transactions: [txn, ...state.transactions] // Add new ones to the top
      })),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'finance-tracker-storage', // The key name in LocalStorage
      storage: createJSONStorage(() => localStorage), // Use browser's Local Storage
    }
  )
);