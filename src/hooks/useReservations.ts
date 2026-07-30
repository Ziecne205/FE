import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { Reservation, ReservationStatus } from '@/types/model'
import { mapReservation, type BeReservation } from '@/lib/beApi'

export interface ReservationFilter {
  status?: ReservationStatus | 'all'
}

/**
 * Danh sách đặt chỗ cho màn Quản lý — GET /manager/reservations (toàn bộ booking).
 * Lọc theo status ở client. (Driver app dùng /driver/reservations/my riêng.)
 */
export function useReservations(filter: ReservationFilter = {}) {
  return useQuery({
    queryKey: ['reservations', filter.status ?? 'all'],
    queryFn: async () => {
      const list = await api.get<BeReservation[]>('/manager/reservations')
      const mapped = list.map(mapReservation)
      if (filter.status && filter.status !== 'all') {
        return mapped.filter((r) => r.status === filter.status)
      }
      return mapped
    },
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    // BE: PATCH /driver/reservations/{id}/cancel
    mutationFn: (reservationId: string) =>
      api.patch<BeReservation>(`/driver/reservations/${reservationId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Đã hủy đặt chỗ')
    },
    onError: (error: AppError) => toast.error(error.message),
  })
}
