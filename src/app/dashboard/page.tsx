'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard'
import { StaffDashboard } from '@/components/dashboard/StaffDashboard'
import { ManualEntryModal } from '@/components/dashboard/ManualEntryModal'
import { useAuthStore } from '@/store'
import { useSlots, useCreateSession, type CreateSessionInput } from '@/hooks'
import type { OccupancyStats } from '@/types'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data: slots, refetch, isLoading } = useSlots()
  const createSession = useCreateSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Calculate occupancy stats from slots
  const stats: OccupancyStats = {
    total_slots: slots.length,
    available: slots.filter((s) => s.status === 'Available').length,
    occupied: slots.filter((s) => s.status === 'Occupied').length,
    reserved: slots.filter((s) => s.status === 'Reserved').length,
    maintenance: slots.filter((s) => s.status === 'Maintenance').length,
    occupancy_rate: Math.round(
      (slots.filter((s) => s.status === 'Occupied').length / slots.length) * 100
    ),
    current_revenue: slots.filter((s) => s.status === 'Occupied').length * 10000 * 2, // Mock revenue
  }

  // Filter available slots for manual entry
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
