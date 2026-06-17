'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { OccupancyDashboard } from '@/components/occupancy-dashboard'
import { useParkingLots } from '@/hooks/useAvailability'

export default function OccupancyPage() {
  const { data: lots } = useParkingLots()
  const lotId = lots?.[0]?.id
  return (
    <ProtectedLayout>
      <OccupancyDashboard lotId={lotId} />
    </ProtectedLayout>
  )
}
