import type { OccupancyWindow } from '@/types/model';
import { MOCK_OCCUPANCY } from '@/components/occupancy-dashboard/mockData';

export interface DateRange { from: string; to: string }

export function useOccupancy(
  _lotId: string | undefined,
  _range: DateRange,
): { data: OccupancyWindow[]; isLoading: boolean } {
  // TODO(opus): replace with GET /api/admin/lots/{id}/occupancy?from=&to= via api.get + React Query
  return { data: MOCK_OCCUPANCY, isLoading: false };
}
