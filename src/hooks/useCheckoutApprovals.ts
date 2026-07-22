import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { CheckoutApproval } from '@/types/model'
import { mapCheckoutApproval, type BeCheckoutApproval } from '@/lib/beApi'

export interface CheckoutApprovalFilter {
  status?: CheckoutApproval['status']
}

/**
 * Checkout tạm giữ chờ duyệt vì tiền mặt thu tại cổng lệch quá cashToleranceVnd —
 * GET /manager/checkout-approvals?status= (mặc định Open).
 */
export function useCheckoutApprovals(filter: CheckoutApprovalFilter = {}) {
  const status = filter.status ?? 'Open'
  return useQuery({
    queryKey: ['checkout-approvals', status],
    queryFn: async () => {
      const list = await api.get<BeCheckoutApproval[]>(`/manager/checkout-approvals?status=${status}`)
      return list.map(mapCheckoutApproval)
    },
  })
}

/** Duyệt — hoàn tất checkout đúng như Staff đã yêu cầu ban đầu (thu đúng requestedAmount). */
export function useApproveCheckout() {
  const queryClient = useQueryClient()
  return useMutation<unknown, AppError, string>({
    mutationFn: (approvalId) => api.patch(`/manager/checkout-approvals/${approvalId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkout-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      toast.success('Đã duyệt, checkout hoàn tất')
    },
    onError: (error) => toast.error(error.message),
  })
}

/** Từ chối — phiên đỗ xe vẫn mở để Staff check-out lại. */
export function useRejectCheckout() {
  const queryClient = useQueryClient()
  return useMutation<unknown, AppError, string>({
    mutationFn: (approvalId) => api.patch(`/manager/checkout-approvals/${approvalId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkout-approvals'] })
      toast.success('Đã từ chối yêu cầu checkout')
    },
    onError: (error) => toast.error(error.message),
  })
}
