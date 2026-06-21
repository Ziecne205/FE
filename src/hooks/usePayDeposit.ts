import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type AppError } from '@/lib/api'
import type { PaymentMethod } from '@/types/model'

export interface PayDepositInput {
  reservationId: string
  paymentMethod: PaymentMethod
}

export interface PayDepositResult {
  success: boolean
  paymentId: string
  status: string
}

export function usePayDeposit() {
  const queryClient = useQueryClient()
  // TODO(opus): POST /api/payments { paymentType: 'Deposit', reservationId, paymentMethod }
  return useMutation<PayDepositResult, AppError, PayDepositInput>({
    mutationFn: (input) =>
      api.post<PayDepositResult>('/payments', {
        paymentType: 'Deposit',
        reservationId: input.reservationId,
        paymentMethod: input.paymentMethod,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
