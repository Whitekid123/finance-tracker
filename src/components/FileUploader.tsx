'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useStore } from '../lib/store';
import { autoCategorize } from '../lib/categorizer';
import { RawTransaction } from '../lib/types';

export default function FileUploader() {
  const { setTransactions } = useStore();
  const [fileName, setFileName] = useState('');
  const [debugLog, setDebugLog] = useState<string>(''); 

  const processData = (rows: any[][]) => {
    let headerRowIndex = -1;
    let dateIdx = -1;
    let debitIdx = -1;
    let creditIdx = -1;
    let receiverIdx = -1;

    setDebugLog('Analyzing file structure...\n');

    // 1. FIRST STRATEGY: Look for Headers (Standard Mode)
    for (let r = 0; r < Math.min(rows.length, 20); r++) {
      const row = rows[r];
      if (!row) continue;
      const rowString = row.map(cell => String(cell).toLowerCase()).join(' ');

      if (rowString.includes('date') && (rowString.includes('debit') || rowString.includes('credit') || rowString.includes('withdrawal'))) {
        setDebugLog(prev => prev + `Found Headers at Row ${r}\n`);
        
        row.forEach((cell, c) => {
            const txt = String(cell).toLowerCase();
            if (txt.includes('date') && !txt.includes('value')) dateIdx = c; // Avoid "Value Date"
            if (txt.includes('debit') || txt.includes('dr')) debitIdx = c;
            if (txt.includes('credit') || txt.includes('cr')) creditIdx = c;
            if (txt.includes('description') || txt.includes('narration') || txt.includes('remark')) receiverIdx = c;
        });

        if (dateIdx !== -1 && (debitIdx !== -1 || creditIdx !== -1)) {
            headerRowIndex = r;
            break;
        }
      }
    }

    // 2. SECOND STRATEGY: "Headless Mode" (OPay Direct Dump)
    // If no headers found, check if Row 0 looks like data (Date in Col 0, Money in Col 3/4)
    if (headerRowIndex === -1) {
        const firstRow = rows[0];
        // Check if Col 0 has a year like "2024" or "2025" or "2026"
        const col0 = String(firstRow[0]);
        if (col0.includes('2024') || col0.includes('2025') || col0.includes('2026')) {
            setDebugLog(prev => prev + `No headers found, but Row 0 looks like OPay data. Switching to MANUAL MODE.\n`);
            
            // HARDCODED INDICES based on your Debug Log
            headerRowIndex = -1; // Read from index 0
            dateIdx = 0;         // "20 Dec 2025 22:41:56"
            receiverIdx = 2;     // "Airtime | 8169105114..."
            debitIdx = 3;        // "400.00"
            creditIdx = 4;       // "--"
        } else {
            setDebugLog((prev) => prev + '\nFAILED: Could not find headers and Row 0 does not look like a standard OPay date.');
            return;
        }
    }

    setDebugLog((prev) => prev + `Using Columns: Date[${dateIdx}], Debit[${debitIdx}], Credit[${creditIdx}]\n`);

    // 3. Extract Data
    const rawData: RawTransaction[] = rows
      .slice(headerRowIndex + 1)
      .map((row) => {
        if (!row) return null;

        // Clean Amounts
        const parseAmt = (val: any) => {
          if (!val || val === '--' || val === '-') return 0;
          if (typeof val === 'number') return val;
          // Clean commas
          const cleanVal = String(val).replace(/,/g, '');
          return parseFloat(cleanVal) || 0;
        };

        const debit = parseAmt(row[debitIdx]);
        const credit = parseAmt(row[creditIdx]);

        // Filter out empty rows or balance rows
        if (!debit && !credit) return null;

        // Clean Date
        let dateStr = row[dateIdx];
        if (typeof dateStr === 'number') {
           dateStr = new Date(Math.round((dateStr - 25569)*86400*1000)).toLocaleDateString();
        }

        const isExpense = debit > 0;

        return {
          date: String(dateStr),
          amount: isExpense ? debit : credit,
          receiver: row[receiverIdx] || 'Unknown',
          description: 'Imported OPay',
          type: isExpense ? 'debit' : 'credit'
        };
      })
      .filter(item => item !== null) as RawTransaction[];

    setDebugLog((prev) => prev + `SUCCESS: Imported ${rawData.length} transactions.`);
    
    const processedData = autoCategorize(rawData);
    setTransactions(processedData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setDebugLog('Reading file...');

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0]; 
            const sheet = workbook.Sheets[sheetName];
            // header:1 ensures we get an array of arrays
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            processData(jsonData);
        } catch (err) {
            setDebugLog('Error reading Excel structure: ' + err);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => processData(results.data as any[][]),
        error: () => setDebugLog('Failed to read CSV file.')
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors bg-white">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload OPay Statement</h3>
        <p className="text-sm text-gray-500 mb-4">Supports .xlsx directly.</p>
        
        <input 
          type="file" 
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        
        {fileName && <p className="mt-2 text-sm text-green-600 font-medium">{fileName}</p>}
      </div>

      {debugLog && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
            {debugLog}
        </div>
      )}
    </div>
  );
}