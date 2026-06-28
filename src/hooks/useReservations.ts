import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { Reservation, ReservationStatus } from '@/types/model'

export interface ReservationFilter {
  status?: ReservationStatus | 'all'
}

export interface CreateReservationInput {
  vehicleTypeId: string
  licensePlate: string
  expectedEntryTime: string
  expectedExitTime: string
  userId?: string
  override?: boolean
}

export interface CreateReservationResult {
  success: boolean
  reservationId: string
  status: ReservationStatus
  depositAmount: number
  message: string
}

function buildQuery({ status }: ReservationFilter): string {
  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function useReservations(filter: ReservationFilter = {}) {
  return useQuery({
    queryKey: ['reservations', filter.status ?? 'all'],
    queryFn: () => api.get<Reservation[]>(`/reservations${buildQuery(filter)}`),
  })
}

/**
 * Create a reservation (no slot). On a locked window the API returns 409 QUOTA_FULL —
 * surfaced as an AppError with `code === 'QUOTA_FULL'` so the UI can offer Manager override.
 * Toasts are left to the caller so the quota path can be handled inline.
 */
export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation<CreateReservationResult, AppError, CreateReservationInput>({
    mutationFn: (input) => api.post<CreateReservationResult>('/reservations', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) =>
      api.post<{ success: boolean; status: ReservationStatus }>(`/reservations/${reservationId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Đã hủy đặt chỗ')
    },
    onError: (error: AppError) => toast.error(error.message),
  })
}
