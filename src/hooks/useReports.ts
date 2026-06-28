import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OccupancyWindow, DateRange } from '@/types/model'
import type { RevenuePoint } from '@/components/reports/types'

interface ReportsResponse {
  revenue: RevenuePoint[]
  occupancy: OccupancyWindow[]
}

export function useReports(
  range: DateRange,
): { revenue: RevenuePoint[]; occupancy: OccupancyWindow[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', range.from, range.to],
    queryFn: () =>
      api.get<ReportsResponse>(
        `/admin/reports?from=${range.from}&to=${range.to}`,
      ),
  })
  return {
    revenue: data?.revenue ?? [],
    occupancy: data?.occupancy ?? [],
    isLoading,
  }
}
