'use client'

import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { ActiveSessionsTable } from '@/components/sessions/ActiveSessionsTable'
import { useActiveSessions, useSlots } from '@/hooks'
import type { ActiveSessionWithDetails } from '@/types'

export default function SessionsPage() {
  const { data: sessions, refetch, isLoading: sessionsLoading } = useActiveSessions()
  const { data: slots, isLoading: slotsLoading } = useSlots()

  if (sessionsLoading || slotsLoading || !sessions || !slots) {
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

  // Enrich sessions with slot details
  const sessionsWithDetails: ActiveSessionWithDetails[] = sessions.map((session) => {
    const slot = slots.find((s) => s.id === session.slot_id)
    return {
      ...session,
      slot_name: slot?.slot_name || 'N/A',
      estimated_price: 20000, // Mock calculation
      current_duration_minutes: 120, // Mock calculation
    }
  })

  return (
    <ProtectedLayout>
      <ActiveSessionsTable
        sessions={sessionsWithDetails}
        onRefresh={() => refetch()}
      />
    </ProtectedLayout>
  )
}
