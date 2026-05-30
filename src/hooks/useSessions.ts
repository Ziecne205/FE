import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ParkingSession } from '@/types'
import { toast } from 'sonner'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await fetch('/api/sessions')
      if (!response.ok) {
        const error = new Error('Không thể tải danh sách phiên đỗ xe')
        toast.error('Không thể tải danh sách phiên đỗ xe')
        throw error
      }
      return response.json() as Promise<ParkingSession[]>
    },
  })
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/sessions/active')
      if (!response.ok) {
        const error = new Error('Không thể tải phiên đỗ xe đang hoạt động')
        toast.error('Không thể tải phiên đỗ xe đang hoạt động')
        throw error
      }
      return response.json() as Promise<ParkingSession[]>
    },
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (session: Partial<ParkingSession>) => {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      })
      if (!response.ok) {
        const error = new Error('Không thể tạo phiên đỗ xe')
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Tạo phiên đỗ xe thành công')
    },
    onError: () => {
      toast.error('Không thể tạo phiên đỗ xe')
    },
  })
}
