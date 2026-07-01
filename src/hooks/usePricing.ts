import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { PricingPolicy, FeeConfig } from '@/types/model'
import {
  mapFeeConfig,
  mapPricingPolicy,
  type BeFeeConfig,
  type BePricingPolicy,
} from '@/lib/beApi'

/** Bảng giá theo giờ (mỗi loại xe) — GET /manager/pricing-policies. */
export function usePricingPolicies() {
  return useQuery({
    queryKey: ['pricing-policies'],
    queryFn: async () => {
      const list = await api.get<BePricingPolicy[]>('/manager/pricing-policies')
      // BE giữ cả bảng giá đã Expired (lịch sử) — màn sửa giá chỉ hiện bản Active.
      return list.map(mapPricingPolicy).filter((p) => p.status === 'Active')
    },
  })
}

export function useUpdatePricing() {
  const queryClient = useQueryClient()
  return useMutation<PricingPolicy, AppError, { policyId: string; hourlyRate: number }>({
    mutationFn: async ({ policyId, hourlyRate }) => {
      // BE PUT cần đủ PricingPolicyRequest; lấy vehicleType/effectiveDate từ cache,
      // rồi đặt basePrice = extraHourPrice = giá/giờ (v3.1 giá phẳng, baseHours = 1).
      const cached = queryClient
        .getQueryData<PricingPolicy[]>(['pricing-policies'])
        ?.find((p) => p.policyId === policyId)
      const body = {
        vehicleTypeId: cached ? Number(cached.vehicleTypeId) : undefined,
        basePrice: hourlyRate,
        baseHours: 1,
        extraHourPrice: hourlyRate,
        effectiveDate: cached?.effectiveDate ?? new Date().toISOString(),
      }
      const saved = await api.put<BePricingPolicy>(`/manager/pricing-policies/${policyId}`, body)
      return mapPricingPolicy(saved)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-policies'] })
      toast.success('Đã cập nhật giá')
    },
    onError: (error) => toast.error(error.message),
  })
}

/** Chính sách phí (cọc %, overstay, no-show, blacklist) — GET /manager/fee-config. */
export function useFeeConfig() {
  return useQuery({
    queryKey: ['fee-config'],
    queryFn: async () => {
      const cfg = await api.get<BeFeeConfig>('/manager/fee-config')
      return mapFeeConfig(cfg)
    },
  })
}

export function useUpdateFeeConfig() {
  const queryClient = useQueryClient()
  return useMutation<FeeConfig, AppError, Partial<FeeConfig>>({
    mutationFn: async (input) => {
      // BE PUT /fee-config gọi .toString() trên TẤT CẢ field → phải gửi đủ 5 field
      // (gồm hourlyRate mà FE không quản). Lấy config hiện tại rồi ghi đè phần thay đổi.
      const current = await api.get<BeFeeConfig>('/manager/fee-config')
      const body: BeFeeConfig = {
        hourlyRate: current.hourlyRate,
        depositPercent: input.depositPercent ?? current.depositPercent,
        overstayRatePerHour: input.overstayRatePerHour ?? current.overstayRatePerHour,
        noShowGraceMinutes: input.noShowGraceMinutes ?? current.noShowGraceMinutes,
        blacklistThreshold: input.blacklistThreshold ?? current.blacklistThreshold,
      }
      const saved = await api.put<BeFeeConfig>('/manager/fee-config', body)
      return mapFeeConfig(saved)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-config'] })
      toast.success('Đã lưu chính sách phí')
    },
    onError: (error) => toast.error(error.message),
  })
}
