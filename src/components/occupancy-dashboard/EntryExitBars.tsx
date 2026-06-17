'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { EntryExitBarsProps } from './types';

export function EntryExitBars({ windows }: EntryExitBarsProps) {
  const data = windows.map((w) => ({
    label: w.windowStart,
    'Lượt vào': w.entries,
    'Lượt ra': w.exits,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Lượt vào / Lượt ra theo khung giờ</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} width={36} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E5E7EB' }}
            formatter={(v, name) => [Number(v).toLocaleString('vi-VN'), String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Lượt vào" fill="#3B82F6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Lượt ra" fill="#6B7280" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
