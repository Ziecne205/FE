import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { Reservation } from '@/types/model'
import { mapReservation, type BeReservation, type BeFloor } from '@/lib/beApi'

// ── Driver: Confirm deposit ────────────────────────────────────────────────────

/**
 * Marks a reservation's deposit as Paid, transitioning it to Confirmed.
 * POST /driver/reservations/{id}/confirm-deposit
 */
export function useConfirmDeposit() {
  const queryClient = useQueryClient()
  return useMutation<BeReservation, AppError, string>({
    mutationFn: (reservationId) =>
      api.post<BeReservation>(`/driver/reservations/${reservationId}/confirm-deposit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Đã xác nhận đặt cọc')
    },
    onError: (e) => toast.error(e.message),
  })
}

// ── Driver: Payments ───────────────────────────────────────────────────────────

export interface PayOSLinkResult {
  checkoutUrl: string
  orderCode: string | number
}

/**
 * Creates a real PayOS checkout link for a reservation deposit.
 * POST /driver/payments/payos/create-link — type must be "DEPOSIT".
 */
export function useCreatePayOSLink() {
  return useMutation<PayOSLinkResult, AppError, { type: 'DEPOSIT'; id: string | number }>({
    mutationFn: (body) =>
      api.post<PayOSLinkResult>('/driver/payments/payos/create-link', body),
    onError: (e) => toast.error(e.message),
  })
}

export interface MockCheckoutResult {
  checkoutUrl: string
}

/**
 * Mock payment link (non-PayOS demo flow) for session fee.
 * POST /driver/payments/checkout
 */
export function useDriverMockCheckout() {
  return useMutation<MockCheckoutResult, AppError, { sessionId: string | number; amount: number }>({
    mutationFn: (body) =>
      api.post<MockCheckoutResult>('/driver/payments/checkout', body),
    onError: (e) => toast.error(e.message),
  })
}

// ── Driver: Feedback ───────────────────────────────────────────────────────────

export interface FeedbackInput {
  sessionId: string | number
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
}

/**
 * Submit a rating (1-5) for a completed parking session.
 * POST /driver/feedbacks
 */
export function useSubmitFeedback() {
  return useMutation<unknown, AppError, FeedbackInput>({
    mutationFn: (body) => api.post('/driver/feedbacks', body),
    onSuccess: () => toast.success('Cảm ơn phản hồi của bạn!'),
    onError: (e) => toast.error(e.message),
  })
}

// ── Manager: Floors ────────────────────────────────────────────────────────────

export interface CreateFloorInput {
  floorName: string
  dedicatedVehicleTypeId?: number | null
  totalCapacity: number
}

export function useManagerFloors() {
  return useQuery({
    queryKey: ['manager', 'floors'],
    queryFn: () => api.get<BeFloor[]>('/manager/floors'),
  })
}

export function useCreateFloor() {
  const qc = useQueryClient()
  return useMutation<BeFloor, AppError, CreateFloorInput>({
    mutationFn: (body) => api.post<BeFloor>('/manager/floors', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager', 'floors'] })
      toast.success('Đã tạo tầng mới')
    },
    onError: (e) => toast.error(e.message),
  })
}

export function useUpdateFloor() {
  const qc = useQueryClient()
  return useMutation<BeFloor, AppError, { id: number } & CreateFloorInput>({
    mutationFn: ({ id, ...body }) => api.put<BeFloor>(`/manager/floors/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager', 'floors'] })
      toast.success('Đã cập nhật tầng')
    },
    onError: (e) => toast.error(e.message),
  })
}

export function useDeleteFloor() {
  const qc = useQueryClient()
  return useMutation<unknown, AppError, number>({
    mutationFn: (id) => api.del(`/manager/floors/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager', 'floors'] })
      qc.invalidateQueries({ queryKey: ['slots'] })
      toast.success('Đã xóa tầng')
    },
    onError: (e) => toast.error(e.message),
  })
}

// ── Manager: Incident take-over ────────────────────────────────────────────────

/**
 * Manager claims an Open incident, moving it to InProgress.
 * PATCH /manager/incidents/{id}/take-over
 */
export function useTakeOverIncident() {
  const qc = useQueryClient()
  return useMutation<unknown, AppError, string>({
    mutationFn: (incidentId) =>
      api.patch(`/manager/incidents/${incidentId}/take-over`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] })
      toast.success('Đã nhận xử lý sự cố')
    },
    onError: (e) => toast.error(e.message),
  })
}
