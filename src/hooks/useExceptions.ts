import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Exception } from '@/types'
import { toast } from 'sonner'

export function useExceptions() {
  return useQuery({
    queryKey: ['exceptions'],
    queryFn: async () => {
      const response = await fetch('/api/exceptions')
      if (!response.ok) {
        const error = new Error('Không thể tải danh sách ngoại lệ')
        toast.error('Không thể tải danh sách ngoại lệ')
        throw error
      }
      return response.json() as Promise<Exception[]>
    },
  })
}

export function useResolveException() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ exceptionId, resolvedBy, notes }: { exceptionId: string; resolvedBy: string; notes: string }) => {
      const response = await fetch(`/api/exceptions/${exceptionId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved_by: resolvedBy, resolution_notes: notes }),
      })
      if (!response.ok) {
        const error = new Error('Không thể giải quyết ngoại lệ')
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] })
    },
    onError: () => {
      // Error toast will be shown by the modal
    },
  })
}
