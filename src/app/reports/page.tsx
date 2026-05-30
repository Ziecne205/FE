'use client'

import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Reports } from '@/components/reports/Reports'
import { useAuthStore } from '@/store'
import type { ReportData } from '@/types'

export default function ReportsPage() {
  const { user } = useAuthStore()

  if (!user) {
    return null
  }

  // Only managers can access reports
  if (user.role !== 'Manager') {
    return (
      <ProtectedLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Không có quyền truy cập</h1>
            <p className="mt-2 text-gray-600">Chỉ quản lý mới có thể xem báo cáo</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  // Mock report data - would come from API
  const mockReportData: ReportData[] = [
    {
      date: '2026-05-24',
      revenue: 450000,
      sessions: 45,
      occupancy_rate: 75,
      peak_hour: '14:00',
    },
    {
      date: '2026-05-25',
      revenue: 520000,
      sessions: 52,
      occupancy_rate: 82,
      peak_hour: '15:00',
    },
    {
      date: '2026-05-26',
      revenue: 380000,
      sessions: 38,
      occupancy_rate: 63,
      peak_hour: '13:00',
    },
    {
      date: '2026-05-27',
      revenue: 490000,
      sessions: 49,
      occupancy_rate: 78,
      peak_hour: '16:00',
    },
    {
      date: '2026-05-28',
      revenue: 510000,
      sessions: 51,
      occupancy_rate: 80,
      peak_hour: '14:00',
    },
    {
      date: '2026-05-29',
      revenue: 470000,
      sessions: 47,
      occupancy_rate: 74,
      peak_hour: '15:00',
    },
    {
      date: '2026-05-30',
      revenue: 540000,
      sessions: 54,
      occupancy_rate: 85,
      peak_hour: '14:00',
    },
  ]

  return (
    <ProtectedLayout>
      <Reports reportData={mockReportData} />
    </ProtectedLayout>
  )
}
