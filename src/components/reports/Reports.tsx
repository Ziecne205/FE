'use client'

import { useState } from 'react'
import { ReportsHeader } from './ReportsHeader'
import { ReportsKpiCards } from './ReportsKpiCards'
import { RevenueChart } from './RevenueChart'
import { OccupancyCurve } from './OccupancyCurve'
import { PeakHoursBars } from './PeakHoursBars'
import { ReportsTable } from './ReportsTable'
import { useReports } from '@/hooks/useReports'
import type { DateRange } from '@/types/model'

const today = new Date().toISOString().slice(0, 10)
const weekAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10)

export function Reports() {
  const [range, setRange] = useState<DateRange>({ from: weekAgo, to: today })
  const { revenue, occupancy, isLoading } = useReports(range)

  function handleExport() {
    // stub — Opus will wire real export
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      <ReportsHeader range={range} onRangeChange={setRange} onExport={handleExport} />

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Đang tải dữ liệu…
        </div>
      ) : (
        <>
          <ReportsKpiCards revenue={revenue} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart revenue={revenue} />
            <OccupancyCurve windows={occupancy} />
          </div>
          <PeakHoursBars windows={occupancy} />
          <ReportsTable revenue={revenue} />
        </>
      )}
    </div>
  )
}
