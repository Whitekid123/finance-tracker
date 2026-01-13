'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useStore } from '../lib/store';

// We define the colors right here
const COLORS = {
  Food: '#F97316',        // Orange
  Transport: '#3B82F6',   // Blue
  Utilities: '#A855F7',   // Purple
  Shopping: '#EC4899',    // Pink
  Transfer: '#10B981',    // Emerald
  Salary: '#14B8A6',      // Teal
  Uncategorized: '#94A3B8' // Gray
};

export default function ExpenseChart() {
    const transactions = useStore((state) => state.transactions);

    const data = useMemo(() => {
        const categoryTotals: Record<string, number> = {};

        transactions.forEach(t => {
            // Only count DEBITS (Money leaving)
            if (t.type === 'debit') {
                const catName = t.category;
                categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
            }
        });

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({
                name,
                value
            }))
            .filter(item => item.value > 0);
    }, [transactions]);

    // If no data, hide the component (Dashboard handles the "No data" text)
    if (data.length === 0) return null;

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
                        <Cell 
                            key={`cell-${index}`} 
                            // Safely find the color, or use Gray if missing
                            fill={COLORS[entry.name as keyof typeof COLORS] || '#94A3B8'} 
                        />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}