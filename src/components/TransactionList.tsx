'use client';

import React from 'react';
import { useStore } from '../lib/store';
import { CATEGORIES } from '../lib/types';

export default function TransactionList() {
    const transactions = useStore((state) => state.transactions);

    if (transactions.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.slice(0, 50).map((t) => {
                            const categoryColor = CATEGORIES.find(c => c.name === t.category)?.color;
                            return (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate" title={t.description}>
                                        <div className="font-medium">{t.receiverName || 'Unknown'}</div>
                                        <div className="text-gray-500 text-xs truncate">{t.description}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                                            style={{ backgroundColor: categoryColor || '#ccc' }}
                                        >
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${t.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                        {t.type === 'debit' ? '-' : '+'}₦{t.amount.toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
