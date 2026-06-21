import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Reservation } from '@/types/model'

export function useMyReservations(userId: string) {
  return useQuery<Reservation[]>({
    queryKey: ['my-reservations', userId],
    queryFn: () => api.get<Reservation[]>(`/reservations/user/${userId}`),
    enabled: !!userId,
  })
}
