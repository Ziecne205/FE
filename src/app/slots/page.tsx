'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { SlotMap } from '@/components/slots/SlotMap'
import { useSlots } from '@/hooks'

export default function SlotsPage() {
  const { data: slots, isLoading } = useSlots()
  const [selectedFloor, setSelectedFloor] = useState(1)

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

  return (
    <ProtectedLayout>
      <SlotMap
        slots={slots}
        selectedFloor={selectedFloor}
        onFloorChange={setSelectedFloor}
      />
    </ProtectedLayout>
  )
}
