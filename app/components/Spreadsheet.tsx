'use client';

import React from 'react';

interface SpreadsheetProps {
  data: string[][];
}

export default function Spreadsheet({ data }: SpreadsheetProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="group">
              {row.map((cell, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className="w-32 h-10 border border-gray-200 px-2 hover:bg-gray-50"
                >
                  <input
                    type="text"
                    value={cell}
                    readOnly
                    className="w-full h-full focus:outline-none focus:ring-1 focus:ring-blue-400/30
                      text-gray-700 bg-transparent"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 