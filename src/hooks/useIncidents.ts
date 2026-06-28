import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'
import type { Incident, IncidentStatus } from '@/types/model'

export interface IncidentFilter {
  status?: IncidentStatus | 'all'
}

function buildQuery({ status }: IncidentFilter): string {
  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function useIncidents(filter: IncidentFilter = {}) {
  return useQuery({
    queryKey: ['incidents', filter.status ?? 'all'],
    queryFn: () => api.get<Incident[]>(`/incidents${buildQuery(filter)}`),
  })
}

/** Open-incident count — feeds the dashboard "Sự cố đang mở" KPI. */
export function useOpenIncidentCount() {
  return useQuery({
    queryKey: ['incidents', 'Open'],
    queryFn: () => api.get<Incident[]>(`/incidents${buildQuery({ status: 'Open' })}`),
    select: (list) => list.length,
  })
}

export interface ResolveIncidentInput {
  incidentId: string
  handledByStaffId?: string
  resolutionNotes?: string
}

export function useResolveIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ incidentId, ...body }: ResolveIncidentInput) =>
      api.put<Incident>(`/incidents/${incidentId}/resolve`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      toast.success('Đã xử lý sự cố')
    },
    onError: (error: AppError) => toast.error(error.message),
  })
}
