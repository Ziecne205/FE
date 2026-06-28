'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard'
import { StaffDashboard } from '@/components/dashboard/StaffDashboard'
import { ManualEntryModal } from '@/components/dashboard/ManualEntryModal'
import { SystemOverview } from '@/components/admin/system-overview'
import { useAuthStore } from '@/store'
import { useCreateSession, type CreateSessionInput } from '@/hooks'
import { useLotSlots } from '@/hooks/useAvailability'
import type { OccupancyStats } from '@/components/dashboard'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data: slots, refetch, isLoading } = useLotSlots()
  const createSession = useCreateSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (user?.role === 'Admin') {
    return (
      <ProtectedLayout>
        <div className="p-xl max-w-container-max mx-auto">
          <SystemOverview />
        </div>
      </ProtectedLayout>
    )
  }

  if (isLoading || !slots) {
    return (
      <ProtectedLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  const occupied = slots.filter((s) => s.status === 'Occupied').length
  const stats: OccupancyStats = {
    total_slots: slots.length,
    available: slots.filter((s) => s.status === 'Available').length,
    occupied,
    maintenance: slots.filter((s) => s.status === 'Maintenance').length,
    occupancy_rate: slots.length ? Math.round((occupied / slots.length) * 100) : 0,
    current_revenue: occupied * 10000 * 2,
  }

  const availableSlots = slots.filter((slot) => slot.status === 'Available')

  const handleManualEntry = async (data: CreateSessionInput) => {
    await createSession.mutateAsync(data)
  }

  return (
    <ProtectedLayout>
      {user?.role === 'Manager' ? (
        <ManagerDashboard stats={stats} onRefresh={() => refetch()} />
      ) : (
        <>
          <StaffDashboard
            stats={stats}
            onRefresh={() => refetch()}
            onManualEntry={() => setIsModalOpen(true)}
          />
          <ManualEntryModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            availableSlots={availableSlots}
            onSubmit={handleManualEntry}
          />
        </>
      )}
    </ProtectedLayout>
  )
}
