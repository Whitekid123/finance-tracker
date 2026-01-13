'use client';

import React from 'react';
import { useStore } from '../lib/store';

export default function TransactionList() {
  const { transactions } = useStore();

  if (transactions.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
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
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500 whitespace-nowrap">{txn.date}</td>
                <td className="p-4 font-medium text-gray-900">
                  {/* FIX: Use 'receiver' instead of 'receiverName' */}
                  <div className="font-medium">{txn.receiver || 'Unknown'}</div>
                  <div className="text-gray-500 text-xs truncate">{txn.description}</div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {txn.category}
                  </span>
                </td>
                <td className={`p-4 text-right font-semibold whitespace-nowrap ${txn.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                  {txn.type === 'debit' ? '-' : '+'}₦{txn.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}