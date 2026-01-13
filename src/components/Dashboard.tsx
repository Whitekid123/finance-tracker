'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../lib/store';
import FileUploader from './FileUploader';
import ExpenseChart from './ExpenseChart';

export default function Dashboard() {
  const { transactions, clearTransactions } = useStore();
  const [openingBalance, setOpeningBalance] = useState(0);

  // 1. Calculate Financial Totals
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let totalCredit = 0; // For Balance (Includes Internal)
    let totalDebit = 0;  // For Balance (Includes Internal)

    transactions.forEach((txn) => {
      // Logic A: For Income/Expense Cards (Ignore Internal)
      if (txn.category !== 'Internal') {
        if (txn.type === 'debit') {
          expenses += txn.amount;
        } else {
          income += txn.amount;
        }
      }

      // Logic B: For Wallet Balance (Include EVERYTHING)
      if (txn.type === 'debit') {
        totalDebit += txn.amount;
      } else {
        totalCredit += txn.amount;
      }
    });

    const netChange = totalCredit - totalDebit;
    
    return { income, expenses, netChange };
  }, [transactions]);

  // The Final Balance = Opening Balance + All Money In - All Money Out
  const finalBalance = openingBalance + stats.netChange;

  // 2. Top Recipients Logic
  const topRecipients = useMemo(() => {
    const people: Record<string, number> = {};
    transactions.forEach((txn) => {
      if (txn.type === 'debit' && txn.category === 'Transfer') {
        let name = txn.receiver
          .replace(/Transfer to /i, '')
          .replace(/POS Transfer-/i, '')
          .split('|')[0]
          .trim();
        if (name) people[name] = (people[name] || 0) + txn.amount;
      }
    });
    return Object.entries(people)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      
      {/* 0. Opening Balance Input (The Sync Tool) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">Opening Balance:</span> 
          <span className="ml-2 hidden sm:inline">Set this to match your statement's start balance.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold">₦</span>
          <input 
            type="number" 
            value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 w-32 text-right font-mono text-gray-700 focus:outline-none focus:border-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expenses (Clean) */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm text-red-600 font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">₦{stats.expenses.toLocaleString()}</p>
          <p className="text-xs text-red-400 mt-1">Excludes Savings/Internal</p>
        </div>
        
        {/* Income (Clean) */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm text-green-600 font-medium">Total Income</p>
          <p className="text-2xl font-bold text-green-700">₦{stats.income.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">Excludes Withdrawals</p>
        </div>

        {/* Balance (Real Wallet State) */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Wallet Balance</p>
          <p className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
            ₦{finalBalance.toLocaleString()}
          </p>
          <p className="text-xs text-blue-400 mt-1">Matches OPay App</p>
        </div>
      </div>

      {/* 2. Charts & Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-4">Expenses by Category</h3>
          <div className="h-64 flex-1">
             {transactions.length > 0 ? <ExpenseChart /> : (
               <div className="h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">No data</div>
             )}
          </div>
        </div>

        <div className="space-y-4">
          <FileUploader />

          {topRecipients.length > 0 && (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Top People You Paid</h3>
              <div className="space-y-3">
                {topRecipients.map((person, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{idx + 1}</span>
                      <span className="text-gray-700 font-medium truncate w-32">{person.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">₦{person.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {transactions.length > 0 && (
            <button
              onClick={() => { if(confirm('Clear all data?')) clearTransactions(); }}
              className="w-full py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors font-medium"
            >
              Reset / Clear All Data
            </button>
          )}
        </div>
      </div>

      {/* 3. Transaction List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4 font-medium whitespace-nowrap">Date</th>
                <th className="p-4 font-medium">Receiver / Merchant</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400">No transactions yet.</td></tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-gray-500 whitespace-nowrap">{txn.date}</td>
                    <td className="p-4 font-medium text-gray-900">
                      {txn.receiver} 
                      {txn.description && <div className="text-xs text-gray-400 font-normal group-hover:text-gray-500 transition-colors">{txn.description}</div>}
                    </td>
                    <td className="p-4">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium border 
                        ${txn.category === 'Food' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                          txn.category === 'Utilities' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          txn.category === 'Transport' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          txn.category === 'Shopping' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                          txn.category === 'Transfer' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          txn.category === 'Entertainment' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          txn.category === 'Internal' ? 'bg-gray-50 text-gray-500 border-gray-100' :
                          'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {txn.category}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-semibold whitespace-nowrap ${txn.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                      {txn.type === 'debit' ? '-' : '+'}₦{txn.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}