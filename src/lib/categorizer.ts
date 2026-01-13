import { RawTransaction, Transaction, Category } from './types';

const KEYWORDS: Record<string, Category> = {
  // Food
  'food': 'Food', 'eatery': 'Food', 'restaurant': 'Food', 'chicken': 'Food', 'pizza': 'Food',
  
  // Transport
  'uber': 'Transport', 'bolt': 'Transport', 'fuel': 'Transport', 'ride': 'Transport',
  
  // Utilities
  'airtime': 'Utilities', 'mtn': 'Utilities', 'glo': 'Utilities', 'electric': 'Utilities', 'data': 'Utilities',
  
  // Betting / Entertainment
  'bet': 'Entertainment', 'sporty': 'Entertainment', 'msport': 'Entertainment', '1xbet': 'Entertainment', 'football': 'Entertainment', 'gamble': 'Entertainment',
  
  // Fees
  'levy': 'Fees', 'charge': 'Fees', 'vat': 'Fees',
  
  // Shopping
  'market': 'Shopping', 'supermarket': 'Shopping', 'store': 'Shopping', 'groceries': 'Shopping',
  
  // Internal (This fixes the double counting!)
  'owealth': 'Internal', 'auto-save': 'Internal', 'saving': 'Internal',
  
  // General Transfers
  'transfer': 'Transfer', 'sent': 'Transfer',
};

export const autoCategorize = (raw: RawTransaction[]): Transaction[] => {
  return raw.map((item, index) => {
    const finalReceiver = item.receiver || item.description || 'Unknown';
    const textToScan = (finalReceiver + ' ' + (item.description || '')).toLowerCase();
    
    let assignedCategory: Category = 'Uncategorized';

    for (const [key, category] of Object.entries(KEYWORDS)) {
      if (textToScan.includes(key)) {
        assignedCategory = category;
        break;
      }
    }

    // FIX: We removed the string check because the FileUploader ensures this is already a number
    const cleanAmount = Number(item.amount) || 0;

    return {
      ...item,
      id: `txn-${index}-${Date.now()}`,
      receiver: finalReceiver,
      amount: cleanAmount,
      category: assignedCategory,
      type: item.type || 'debit', 
    };
  });
};