import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { LotAvailability, Slot, VehicleType } from '@/types/model'

export interface MaintenanceResult {
  success: boolean
  availability: LotAvailability
  warning: {
    errorCode: string
    message: string
    affectedTypes: string[]
  } | null
}

export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicle-types'],
    queryFn: () => api.get<VehicleType[]>('/vehicle-types'),
  })
}

/** Realtime headroom view for the building — the source of truth for occupancy. */
export function useAvailability() {
  return useQuery({
    queryKey: ['availability'],
    queryFn: () => api.get<LotAvailability>('/availability'),
  })
}

/** Per-slot list for the visual map. (Named to avoid clashing with the legacy useSlots.) */
export function useLotSlots() {
  return useQuery({
    queryKey: ['slots'],
    queryFn: () => api.get<Slot[]>('/slots-map'),
  })
}

/** Mark slots Maintenance/Available, surfacing the capacity-crash warning. */
export function useSetMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { slotCodes: string[]; maintenance: boolean }) =>
      api.post<MaintenanceResult>('/admin/slots/maintenance', vars),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      if (result.warning) {
        toast.warning(result.warning.message)
      } else {
        toast.success('Cập nhật bảo trì thành công')
      }
    },
    onError: (error: AppError) => toast.error(error.message),
  })
}
