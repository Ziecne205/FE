import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { REFRESH_INTERVAL } from '@/lib/constants'
import type { ParkingSession, VehicleType } from '@/types/model'
import { mapActiveSession, type BeActiveSession } from '@/lib/beApi'
import { resolveFloorGateId } from '@/hooks/useGates'

export interface CreateSessionInput {
  license_plate: string
  slot_id: string
  vehicle_type: 'car'
}

/** Staff manual entry — tạo phiên thủ công khi camera đọc lỗi → POST /staff/sessions/check-in. */
export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSessionInput) => {
      // Tra loại "ô tô" từ cache vehicle-types (form nhập tay chỉ hỗ trợ car); mặc định id=1.
      const vts = queryClient.getQueryData<VehicleType[]>(['vehicle-types']) ?? []
      const car = vts.find((v) => /car|ô\s*tô|oto/i.test(v.name)) ?? vts[0]
      const vehicleTypeId = car ? Number(car.id) : 1
      const entryGateId = await resolveFloorGateId(queryClient, 'Entry')
      // BE check-in dùng vehicleTypeId + entryGateId; slot_id của form được bỏ qua
      // (camera/Manager mới gán ô thực tế).
      return api.post('/staff/sessions/check-in', {
        licensePlate: data.license_plate,
        vehicleTypeId,
        entryGateId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
    onError: () => {
      // Error toast will be shown by the modal
    },
  })
}

/** Phiên đang mở toàn tòa (giám sát) — GET /staff/sessions/active. */
export function useOpenSessions(): { data: ParkingSession[]; isLoading: boolean } {
  const query = useQuery<ParkingSession[]>({
    queryKey: ['sessions', 'open'],
    queryFn: async () => {
      const list = await api.get<BeActiveSession[]>('/staff/sessions/active')
      return list.map(mapActiveSession)
    },
    refetchInterval: REFRESH_INTERVAL,
  })
  return { data: query.data ?? [], isLoading: query.isLoading }
}

/** Tìm phiên đang mở theo biển số (hỗ trợ checkout) — GET /staff/sessions/search?licensePlate=. */
export function useFindCar(plate: string): { data: ParkingSession | null } {
  const query = useQuery<ParkingSession | null>({
    queryKey: ['sessions', 'find', plate],
    queryFn: async () => {
      try {
        const dto = await api.get<BeActiveSession>(
          `/staff/sessions/search?licensePlate=${encodeURIComponent(plate)}`,
        )
        return mapActiveSession(dto)
      } catch {
        return null
      }
    },
    enabled: plate.length >= 4,
    retry: false,
  })
  return { data: query.data ?? null }
}
