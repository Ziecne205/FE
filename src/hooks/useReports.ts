import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OccupancyWindow } from '@/types/model'
import type { DateRange } from '@/hooks/useOccupancy'
import type { RevenuePoint } from '@/components/reports/types'

interface ReportsResponse {
  revenue: RevenuePoint[]
  occupancy: OccupancyWindow[]
}

export function useReports(
  lotId: string | undefined,
  range: DateRange,
): { revenue: RevenuePoint[]; occupancy: OccupancyWindow[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', lotId, range.from, range.to],
    queryFn: () =>
      api.get<ReportsResponse>(
        `/admin/lots/${lotId}/reports?from=${range.from}&to=${range.to}`,
      ),
    enabled: !!lotId,
  })
  return {
    revenue: data?.revenue ?? [],
    occupancy: data?.occupancy ?? [],
    isLoading,
  }
}
