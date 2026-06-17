import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PaymentMethod } from '@/types/model'

export interface PayParkingInput {
  sessionId: string
  paymentMethod: PaymentMethod
  amount: number
}

export interface PayParkingResult {
  success: boolean
  paymentId: string
  status: string
  barrierOpen: boolean
}

export function usePayParking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: PayParkingInput): Promise<PayParkingResult> => {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentType: 'Parking',
          sessionId: input.sessionId,
          paymentMethod: input.paymentMethod,
          amount: input.amount,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? 'Thanh toán thất bại')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}
