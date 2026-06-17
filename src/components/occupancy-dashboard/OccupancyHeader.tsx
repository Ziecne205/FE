'use client';

import type { OccupancyHeaderProps } from './types';

export function OccupancyHeader({ range, onRangeChange }: OccupancyHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lưu lượng bãi xe</h1>
        <p className="text-sm text-gray-500 mt-0.5">Theo dõi lưu lượng vào/ra theo khung giờ</p>
      </div>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Từ</label>
        <input
          type="date"
          value={range.from}
          onChange={(e) => onRangeChange({ ...range, from: e.target.value })}
          className="text-sm text-gray-800 border-none outline-none bg-transparent"
        />
        <span className="text-gray-300">—</span>
        <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Đến</label>
        <input
          type="date"
          value={range.to}
          onChange={(e) => onRangeChange({ ...range, to: e.target.value })}
          className="text-sm text-gray-800 border-none outline-none bg-transparent"
        />
      </div>
    </div>
  );
}
