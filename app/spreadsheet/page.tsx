'use client';

import Spreadsheet from '../components/Spreadsheet';

export default function SpreadsheetDemo() {
  // Example data matrix
  const data = [
    ['A1', 'B1', 'C1', 'D1'],
    ['A2', 'B2', 'C2', 'D2'],
    ['A3', 'B3', 'C3', 'D3'],
    ['A4', 'B4', 'C4', 'D4'],
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Simple Spreadsheet</h1>
          <Spreadsheet data={data} />
        </div>
      </div>
    </main>
  );
} 