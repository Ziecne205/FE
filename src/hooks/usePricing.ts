import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { PricingPolicy, FeeConfig } from '@/types/model'

/** Bảng giá theo giờ (mỗi loại xe). */
export function usePricingPolicies() {
  return useQuery({
    queryKey: ['pricing-policies'],
    queryFn: () => api.get<PricingPolicy[]>('/manager/pricing-policies'),
  })
}

export function useUpdatePricing() {
  const queryClient = useQueryClient()
  return useMutation<PricingPolicy, AppError, { policyId: string; hourlyRate: number }>({
    mutationFn: ({ policyId, hourlyRate }) =>
      api.put<PricingPolicy>(`/manager/pricing-policies/${policyId}`, { hourlyRate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-policies'] })
      toast.success('Đã cập nhật giá')
    },
    onError: (error) => toast.error(error.message),
  })
}

/** Chính sách phí (cọc %, overstay, no-show, blacklist). */
export function useFeeConfig() {
  return useQuery({
    queryKey: ['fee-config'],
    queryFn: () => api.get<FeeConfig>('/manager/fee-config'),
  })
}

export function useUpdateFeeConfig() {
  const queryClient = useQueryClient()
  return useMutation<FeeConfig, AppError, Partial<FeeConfig>>({
    mutationFn: (input) => api.put<FeeConfig>('/manager/fee-config', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-config'] })
      toast.success('Đã lưu chính sách phí')
    },
    onError: (error) => toast.error(error.message),
  })
}
