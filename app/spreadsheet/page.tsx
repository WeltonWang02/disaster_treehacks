'use client';

import { useEffect, useState } from 'react';
import Spreadsheet from '../components/Spreadsheet';

export default function SpreadsheetDemo() {
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    const storedDataStr = sessionStorage.getItem('classificationData');
    console.log("Retrieved Data from sessionStorage:", storedDataStr);

    if (storedDataStr) {
      try {
        // Parse the stored JSON array of strings
        const storedArray: string[] = JSON.parse(storedDataStr);
        console.log("Parsed Stored Array:", storedArray);

        // Clean and parse each item into a JSON object
        const parsedData = storedArray.map(item => {
          // Remove all backticks and both escaped and raw newlines
          let cleaned = item
            .replace(/`/g, '')
            .replace(/\\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();

          // Remove wrapping tags/prefixes: remove <json>...</json>, ```json ... ```, and leading "json "
          cleaned = cleaned
            .replace(/^<json>/i, '')
            .replace(/<\/json>$/i, '')
            .replace(/^```json\s*/i, '')
            .replace(/```$/i, '')
            .replace(/^json\s+/i, '')
            .trim();

          console.log("Cleaned item:", cleaned);

          return JSON.parse(cleaned);
        });

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
          console.error("❌ Parsed data is not an array or is empty:", parsedData);
          return;
        }

        // Convert the array of objects to a 2D array for the Spreadsheet.
        const headers = Object.keys(parsedData[0]);
        const values = parsedData.map((row: any) =>
          headers.map(header => String(row[header] ?? ""))
        );
        const formattedData = [headers, ...values];

        console.log("Formatted Data for Spreadsheet:", formattedData);
        setData(formattedData);
      } catch (error) {
        console.error("❌ Error parsing stored classification data:", error);
      }
    }
  }, []);

  const exportCSV = () => {
    if (data.length === 0) return;
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'classification_results.csv';
    link.click();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Classification Results</h1>
          {data.length > 1 ? (
            <>
              <Spreadsheet data={data} />
              <button
                onClick={exportCSV}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export as CSV
              </button>
            </>
          ) : (
            <p className="text-gray-500">No classification data available.</p>
          )}
        </div>
      </div>
    </main>
  );
}
