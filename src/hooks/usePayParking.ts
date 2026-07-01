import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PaymentMethod } from '@/types/model'
import { api } from '@/lib/api'
import { resolveGateId } from '@/hooks/useGates'

export interface PayParkingInput {
  licensePlate: string
  paymentMethod: PaymentMethod
  lostTicket?: boolean
}

export interface PayParkingResult {
  success: boolean
  paymentId: string
  status: string
  barrierOpen: boolean
  amount: number
}

/** BE CheckOutResponse — các field dùng ở màn thanh toán cổng ra. */
interface BeCheckOutResponse {
  sessionId: number
  amount: number
  paymentStatus: string
  paymentMethod: string
  plateMismatch: boolean
  slotFreed?: string | null
}

/**
 * Thanh toán cổng ra = check-out thật: POST /staff/sessions/check-out.
 * BE tự tìm phiên đang mở theo biển số, tính tiền theo bảng giá, ghi Payment,
 * giải phóng ô và đóng phiên. Tiền mặt/QR tại barie -> paymentStatus = "Success".
 */
export function usePayParking() {
  const queryClient = useQueryClient()

  return useMutation<PayParkingResult, Error, PayParkingInput>({
    mutationFn: async ({ licensePlate, paymentMethod, lostTicket }) => {
      const exitGateId = await resolveGateId(queryClient, 'Exit')
      const res = await api.post<BeCheckOutResponse>('/staff/sessions/check-out', {
        licensePlate,
        exitGateId,
        paymentMethod,
        lostTicket: !!lostTicket,
      })
      return {
        success: res.paymentStatus === 'Success',
        paymentId: String(res.sessionId),
        status: res.paymentStatus,
        barrierOpen: res.paymentStatus === 'Success',
        amount: Number(res.amount ?? 0),
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}
