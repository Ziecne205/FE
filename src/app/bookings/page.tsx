'use client'

import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Reservations } from '@/components/reservations'

export default function BookingsPage() {
  return (
    <ProtectedLayout>
      <Reservations />
    </ProtectedLayout>
  )
}
