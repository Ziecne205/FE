import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Booking, BookingStatus } from '@/types'
import { toast } from 'sonner'

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await fetch('/api/bookings')
      if (!response.ok) {
        const error = new Error('Không thể tải danh sách đặt chỗ')
        toast.error('Không thể tải danh sách đặt chỗ')
        throw error
      }
      return response.json() as Promise<Booking[]>
    },
  })
}

export interface CreateBookingInput {
  customer_name: string
  customer_phone: string
  customer_email: string
  license_plate: string
  slot_id: string
  booking_start: string
  booking_end: string
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBookingInput) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = new Error('Không thể tạo đặt chỗ')
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
    onError: () => {
      // Error toast will be shown by the modal
    },
  })
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: BookingStatus }) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const error = new Error('Không thể cập nhật trạng thái đặt chỗ')
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Cập nhật trạng thái đặt chỗ thành công')
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái đặt chỗ')
    },
  })
}
