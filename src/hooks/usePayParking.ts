import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PaymentMethod } from '@/types/model'
import { api } from '@/lib/api'

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
    mutationFn: (input: PayParkingInput) =>
      api.post<PayParkingResult>('/payments', {
        paymentType: 'Parking',
        sessionId: input.sessionId,
        paymentMethod: input.paymentMethod,
        amount: input.amount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}
