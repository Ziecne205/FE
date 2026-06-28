import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { REFRESH_INTERVAL } from '@/lib/constants'
import type { ParkingSession } from '@/types/model'

export interface CreateSessionInput {
  license_plate: string
  slot_id: string
  vehicle_type: 'car'
}

/** Staff manual entry — tạo phiên thủ công khi camera đọc lỗi. */
export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSessionInput) => api.post('/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
    onError: () => {
      // Error toast will be shown by the modal
    },
  })
}

/** Phiên đang mở toàn tòa (giám sát) — GET /sessions?open=true. */
export function useOpenSessions(): { data: ParkingSession[]; isLoading: boolean } {
  const query = useQuery<ParkingSession[]>({
    queryKey: ['sessions', 'open'],
    queryFn: () => api.get<ParkingSession[]>('/sessions?open=true'),
    refetchInterval: REFRESH_INTERVAL,
  })
  return { data: query.data ?? [], isLoading: query.isLoading }
}

/** Tìm phiên đang mở theo biển số (hỗ trợ checkout) — GET /sessions/find?plate=. */
export function useFindCar(plate: string): { data: ParkingSession | null } {
  const query = useQuery<ParkingSession | null>({
    queryKey: ['sessions', 'find', plate],
    queryFn: async () => {
      try {
        return await api.get<ParkingSession>(`/sessions/find?plate=${encodeURIComponent(plate)}`)
      } catch {
        return null
      }
    },
    enabled: plate.length >= 4,
    retry: false,
  })
  return { data: query.data ?? null }
}
