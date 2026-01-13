export type TransactionType = 'debit' | 'credit';

export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Utilities' 
  | 'Shopping' 
  | 'Transfer' 
  | 'Salary' 
  | 'Entertainment' // For Betting
  | 'Fees'          // For Bank Charges
  | 'Internal'      // For OWealth & Savings (Ignore these!)
  | 'Uncategorized';

export interface RawTransaction {
  date: string;
  amount: number;
  receiver: string;
  description: string;
  type?: TransactionType;
}

export interface Transaction extends RawTransaction {
  id: string;
  category: Category;
}

export const CATEGORIES: { name: Category; color: string }[] = [
  { name: 'Food', color: '#F97316' },        // Orange
  { name: 'Transport', color: '#3B82F6' },   // Blue
  { name: 'Utilities', color: '#A855F7' },   // Purple
  { name: 'Shopping', color: '#EC4899' },    // Pink
  { name: 'Transfer', color: '#10B981' },    // Emerald
  { name: 'Salary', color: '#14B8A6' },      // Teal
  { name: 'Entertainment', color: '#F43F5E' }, // Rose (Betting)
  { name: 'Fees', color: '#64748B' },        // Slate
  { name: 'Internal', color: '#94A3B8' },    // Gray (Hidden)
  { name: 'Uncategorized', color: '#CBD5E1' } // Light Gray
];