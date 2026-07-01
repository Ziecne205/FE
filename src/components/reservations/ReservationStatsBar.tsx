'use client'

import { cn } from '@/lib/utils'
import type { Reservation } from '@/types/model'

interface ReservationStatsBarProps {
  readonly reservations: Reservation[]
}

export function ReservationStatsBar({ reservations }: ReservationStatsBarProps) {
  const count = (s: Reservation['status']) => reservations.filter((r) => r.status === s).length
  const cards = [
    { label: 'Tổng số', value: reservations.length, accent: '' },
    { label: 'Chờ cọc', value: count('Pending'), accent: 'border-l-4 border-l-amber-500' },
    { label: 'Đã xác nhận', value: count('Confirmed'), accent: 'border-l-4 border-l-blue-500' },
    {
      label: 'Đã hủy / Hết hạn',
      value: count('Cancelled') + count('Expired'),
      accent: 'border-l-4 border-l-gray-400',
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={cn('rounded-lg border border-gray-200 bg-white p-4 shadow-sm', c.accent)}
        >
          <div className="mb-1 text-sm text-gray-600">{c.label}</div>
          <div className="text-2xl font-bold text-gray-900">{c.value}</div>
        </div>
      ))}
    </div>
  )
}
