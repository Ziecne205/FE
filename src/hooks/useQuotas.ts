import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { BookingQuota } from '@/types/model'

export interface UpsertQuotaInput {
  quotaId?: string
  parkingLotId: string
  vehicleTypeId: string
  windowStart: string
  windowEnd: string
  quotaPercent: number
}

export function useQuotas(lotId?: string) {
  const qs = lotId ? `?lotId=${lotId}` : ''
  return useQuery({
    queryKey: ['quotas', lotId ?? null],
    queryFn: () => api.get<BookingQuota[]>(`/admin/quotas${qs}`),
  })
}

export function useUpsertQuota() {
  const queryClient = useQueryClient()
  return useMutation<BookingQuota, AppError, UpsertQuotaInput>({
    mutationFn: (input) => {
      if (input.quotaId) {
        return api.put<BookingQuota>(`/admin/quotas/${input.quotaId}`, input)
      }
      return api.post<BookingQuota>('/admin/quotas', input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
    onError: (error: AppError) => toast.error(error.message),
  })
}

export function useToggleQuota() {
  const queryClient = useQueryClient()
  return useMutation<BookingQuota, AppError, string>({
    mutationFn: async (quotaId: string) => {
      // Find the quota in any cached quota list, then PUT with toggled isActive
      const allCached = queryClient
        .getQueriesData<BookingQuota[]>({ queryKey: ['quotas'] })
        .flatMap(([, data]) => data ?? [])
      const current = allCached.find((q) => q.quotaId === quotaId)
      if (!current) throw new Error('Quota not found in cache')
      return api.put<BookingQuota>(`/admin/quotas/${quotaId}`, {
        ...current,
        isActive: !current.isActive,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
    onError: (error: AppError) => toast.error(error.message),
  })
}
