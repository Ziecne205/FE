import { useQuery } from '@tanstack/react-query'
import type { Reservation } from '@/types/model'
import { mockReservations } from '@/mocks/data/reservations'

// TODO(opus): GET /api/reservations/user/{userId}
export function useMyReservations(userId: string) {
  return useQuery<Reservation[]>({
    queryKey: ['my-reservations', userId],
    queryFn: () => Promise.resolve(mockReservations),
    enabled: !!userId,
  })
}
