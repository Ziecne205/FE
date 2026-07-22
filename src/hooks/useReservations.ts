import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { Reservation, ReservationStatus } from '@/types/model'
import { mapReservation, type BeReservation } from '@/lib/beApi'

export interface ReservationQuote {
  estimatedFee: number
  depositAmount: number
}

interface BeReservationQuote {
  estimatedFee: number
  depositAmount: number
}

/**
 * Ước tính phí đỗ + tiền cọc cho một khung giờ (không tạo booking) — GET /driver/reservations/quote.
 * Deposit giờ tính trên phí ước tính cả khung giờ (không phải basePrice) × depositPercent, nên FE
 * không tự tính mà luôn gọi BE để khớp công thức mới nhất.
 */
export function useReservationQuote(
  vehicleTypeId: string,
  expectedEntryTime: string,
  expectedExitTime: string,
) {
  const enabled =
    !!vehicleTypeId &&
    !!expectedEntryTime &&
    !!expectedExitTime &&
    new Date(expectedExitTime) > new Date(expectedEntryTime)
  return useQuery({
    queryKey: ['reservation-quote', vehicleTypeId, expectedEntryTime, expectedExitTime],
    queryFn: async () => {
      const params = new URLSearchParams({
        vehicleTypeId,
        entryTime: expectedEntryTime,
        exitTime: expectedExitTime,
      })
      const q = await api.get<BeReservationQuote>(`/driver/reservations/quote?${params.toString()}`)
      return { estimatedFee: Number(q.estimatedFee ?? 0), depositAmount: Number(q.depositAmount ?? 0) }
    },
    enabled,
    retry: false,
  })
}

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

/**
 * Create a reservation (no slot) — POST /driver/reservations.
 * BE ReservationRequest: { vehicleTypeId, licensePlate, expectedEntryTime, expectedExitTime }.
 * Khi khung giờ hết quota, BE trả BusinessRuleException (message tiếng Việt) → hiện ở caller.
 */
export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation<CreateReservationResult, AppError, CreateReservationInput>({
    mutationFn: async (input) => {
      const r = await api.post<BeReservation>('/driver/reservations', {
        vehicleTypeId: Number(input.vehicleTypeId),
        licensePlate: input.licensePlate,
        expectedEntryTime: input.expectedEntryTime,
        expectedExitTime: input.expectedExitTime,
      })
      return {
        success: true,
        reservationId: String(r.reservationId),
        status: r.status as ReservationStatus,
        depositAmount: Number(r.depositAmount ?? 0),
        message: 'OK',
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
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
