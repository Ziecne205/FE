import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { REFRESH_INTERVAL } from '@/lib/constants'
import type { ParkingSession } from '@/types/model'

// TODO(opus): body implemented — GET /api/sessions?lotId=&open=true
export function useOpenSessions(lotId: string | undefined): {
  data: ParkingSession[]
  isLoading: boolean
} {
  const query = useQuery<ParkingSession[]>({
    queryKey: ['sessions-v2', 'open', lotId],
    queryFn: () =>
      api.get<ParkingSession[]>(`/api/sessions?lotId=${lotId ?? ''}&open=true`),
    enabled: !!lotId,
    refetchInterval: REFRESH_INTERVAL,
  })
  return { data: query.data ?? [], isLoading: query.isLoading }
}

// TODO(opus): body implemented — GET /api/sessions/find?plate=
export function useFindCar(plate: string): {
  data: ParkingSession | null
} {
  const query = useQuery<ParkingSession | null>({
    queryKey: ['sessions-v2', 'find', plate],
    queryFn: async () => {
      try {
        return await api.get<ParkingSession>(`/api/sessions/find?plate=${encodeURIComponent(plate)}`)
      } catch {
        return null
      }
    },
    enabled: plate.length >= 4,
    retry: false,
  })
  return { data: query.data ?? null }
}
