'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useStore } from '../lib/store';
import { CATEGORIES } from '../lib/types';

export default function ExpenseChart() {
  const { transactions } = useStore();

  const data = useMemo(() => {
    // 1. Group expenses by category
    const categoryTotals: Record<string, number> = {};

    transactions.forEach((txn) => {
      // Ignore Income, OWealth transfers, and unclassified items if you want
      if (txn.type === 'debit' && txn.category !== 'Internal') {
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
      }
    });

    // 2. Convert to array for Recharts
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0); // Hide empty categories
  }, [transactions]);

  // Get colors from our global constant
  const getColor = (catName: string) => {
    return CATEGORIES.find(c => c.name === catName)?.color || '#CBD5E1';
  };

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        No expense data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
          ))}
        </Pie>
        {/* FIX: Changed (value: number) to (value: any) to satisfy Vercel build */}
        <Tooltip formatter={(value: any) => `₦${Number(value).toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}