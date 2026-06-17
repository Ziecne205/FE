'use client';

import { useState } from 'react';
import { OccupancyHeader } from './OccupancyHeader';
import { OccupancyKpiCards } from './OccupancyKpiCards';
import { OccupancyCurve } from './OccupancyCurve';
import { EntryExitBars } from './EntryExitBars';
import { OccupancyTable } from './OccupancyTable';
import { useOccupancy } from '@/hooks/useOccupancy';
import type { OccupancyDashboardProps } from './types';
import type { DateRange } from '@/hooks/useOccupancy';

const today = new Date().toISOString().slice(0, 10);

export function OccupancyDashboard({ lotId }: OccupancyDashboardProps) {
  const [range, setRange] = useState<DateRange>({ from: today, to: today });
  const { data, isLoading } = useOccupancy(lotId, range);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      <OccupancyHeader lotId={lotId} range={range} onRangeChange={setRange} />

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Đang tải dữ liệu…
        </div>
      ) : (
        <>
          <OccupancyKpiCards windows={data} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OccupancyCurve windows={data} />
            <EntryExitBars windows={data} />
          </div>
          <OccupancyTable windows={data} />
        </>
      )}
    </div>
  );
}
