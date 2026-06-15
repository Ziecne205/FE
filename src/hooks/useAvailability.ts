import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { LotAvailability, ParkingLot, Slot, VehicleType } from '@/types/model'

export interface MaintenanceResult {
  success: boolean
  availability: LotAvailability
  warning: {
    errorCode: string
    message: string
    affectedTypes: string[]
  } | null
}

export function useParkingLots() {
  return useQuery({
    queryKey: ['parking-lots'],
    queryFn: () => api.get<ParkingLot[]>('/parking-lots'),
  })
}

export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicle-types'],
    queryFn: () => api.get<VehicleType[]>('/vehicle-types'),
  })
}

/** Realtime headroom view for a lot — the source of truth for occupancy. */
export function useAvailability(lotId: string | undefined) {
  return useQuery({
    queryKey: ['availability', lotId],
    queryFn: () => api.get<LotAvailability>(`/parking-lots/${lotId}/availability`),
    enabled: !!lotId,
  })
}

/** Per-slot list for the visual map. (Named to avoid clashing with the legacy useSlots.) */
export function useLotSlots(lotId: string | undefined) {
  return useQuery({
    queryKey: ['slots', lotId],
    queryFn: () => api.get<Slot[]>(`/parking-lots/${lotId}/slots`),
    enabled: !!lotId,
  })
}

/** Mark slots Maintenance/Available, surfacing the capacity-crash warning. */
export function useSetMaintenance(lotId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { slotCodes: string[]; maintenance: boolean }) =>
      api.post<MaintenanceResult>('/admin/slots/maintenance', vars),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['slots', lotId] })
      queryClient.invalidateQueries({ queryKey: ['availability', lotId] })
      if (result.warning) {
        toast.warning(result.warning.message)
      } else {
        toast.success('Cập nhật bảo trì thành công')
      }
    },
    onError: (error: AppError) => toast.error(error.message),
  })
}
