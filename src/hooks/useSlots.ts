import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Slot, SlotStatus } from '@/types'
import { toast } from 'sonner'

export function useSlots() {
  return useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const response = await fetch('/api/slots')
      if (!response.ok) {
        const error = new Error('Không thể tải danh sách chỗ đỗ')
        toast.error('Không thể tải danh sách chỗ đỗ')
        throw error
      }
      return response.json() as Promise<Slot[]>
    },
  })
}

export function useUpdateSlotStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ slotId, status }: { slotId: string; status: SlotStatus }) => {
      const response = await fetch(`/api/slots/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const error = new Error('Không thể cập nhật trạng thái chỗ đỗ')
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      toast.success('Cập nhật trạng thái chỗ đỗ thành công')
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái chỗ đỗ')
    },
  })
}
