import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OccupancyWindow } from '@/types/model'

export interface DateRange { from: string; to: string }

export function useOccupancy(
  lotId: string | undefined,
  range: DateRange,
): { data: OccupancyWindow[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['occupancy', lotId, range.from, range.to],
    queryFn: () =>
      api.get<OccupancyWindow[]>(
        `/admin/lots/${lotId}/occupancy?from=${range.from}&to=${range.to}`,
      ),
    enabled: !!lotId,
  })
  return { data: data ?? [], isLoading }
}
