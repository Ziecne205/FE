import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ParkingSession } from '@/types'
import { toast } from 'sonner'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await fetch('/api/sessions')
      if (!response.ok) {
        throw new Error('Không thể tải danh sách phiên đỗ xe')
      }
      return response.json() as Promise<ParkingSession[]>
    },
    throwOnError: (error) => {
      toast.error('Không thể tải danh sách phiên đỗ xe')
      return false
    },
  })
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/sessions/active')
      if (!response.ok) {
        throw new Error('Không thể tải phiên đỗ xe đang hoạt động')
      }
      return response.json() as Promise<ParkingSession[]>
    },
    throwOnError: (error) => {
      toast.error('Không thể tải phiên đỗ xe đang hoạt động')
      return false
    },
  })
}

export interface CreateSessionInput {
  license_plate: string
  slot_id: string
  vehicle_type: 'car'
}

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSessionInput) => {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = new Error('Không thể tạo phiên đỗ xe')
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
    onError: () => {
      // Error toast will be shown by the modal
    },
  })
}
