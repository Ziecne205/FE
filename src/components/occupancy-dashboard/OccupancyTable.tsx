'use client';

import type { OccupancyTableProps } from './types';

export function OccupancyTable({ windows }: OccupancyTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Chi tiết theo khung giờ</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-2 text-left">Khung giờ</th>
              <th className="px-4 py-2 text-right">Vào</th>
              <th className="px-4 py-2 text-right">Ra</th>
              <th className="px-4 py-2 text-right">Trong bãi</th>
            </tr>
          </thead>
          <tbody>
            {windows.map((w, i) => (
              <tr
                key={w.windowStart}
                className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-2 text-gray-700 font-medium whitespace-nowrap">
                  {w.windowStart}–{w.windowEnd}
                </td>
                <td className="px-4 py-2 text-right text-blue-600 font-semibold">
                  {w.entries.toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-2 text-right text-gray-500">
                  {w.exits.toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-2 text-right text-gray-900 font-semibold">
                  {w.inside.toLocaleString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
