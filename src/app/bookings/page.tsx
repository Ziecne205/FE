'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { BookingManagement } from '@/components/bookings/BookingManagement'
import { CreateBookingModal } from '@/components/bookings/CreateBookingModal'
import { useAuthStore } from '@/store'
import { useBookings, useSlots, useCreateBooking, type CreateBookingInput } from '@/hooks'
import type { BookingWithDetails } from '@/types'

export default function BookingsPage() {
  const { user } = useAuthStore()
  const { data: bookings, refetch, isLoading: bookingsLoading } = useBookings()
  const { data: slots, isLoading: slotsLoading } = useSlots()
  const createBooking = useCreateBooking()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (bookingsLoading || slotsLoading || !bookings || !slots || !user) {
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

  // Enrich bookings with slot details
  const bookingsWithDetails: BookingWithDetails[] = bookings.map((booking) => {
    const slot = slots.find((s) => s.id === booking.slot_id)
    return {
      ...booking,
      slot_name: slot?.slot_name || 'N/A',
      vehicle_license_plate: '29A-12345', // Mock - would come from vehicle data
      user_name: 'Khách hàng', // Mock - would come from user data
    }
  })

  // Filter available slots for booking
  const availableSlots = slots.filter((slot) => slot.status === 'Available')

  const handleCreateBooking = async (data: CreateBookingInput) => {
    await createBooking.mutateAsync(data)
  }

  return (
    <ProtectedLayout>
      <BookingManagement
        bookings={bookingsWithDetails}
        userRole={user.role as 'Manager' | 'Staff'}
        onRefresh={() => refetch()}
        onCreateBooking={() => setIsModalOpen(true)}
      />

      <CreateBookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableSlots={availableSlots}
        onSubmit={handleCreateBooking}
      />
    </ProtectedLayout>
  )
}
