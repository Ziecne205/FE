import type { OccupancyWindow } from '@/types/model';
import type { DateRange } from '@/hooks/useOccupancy';

export interface OccupancyHeaderProps {
  readonly lotId: string | undefined;
  readonly range: DateRange;
  readonly onRangeChange: (r: DateRange) => void;
}

export interface OccupancyKpiCardsProps {
  readonly windows: OccupancyWindow[];
}

export interface OccupancyCurveProps {
  readonly windows: OccupancyWindow[];
}

export interface EntryExitBarsProps {
  readonly windows: OccupancyWindow[];
}

export interface OccupancyTableProps {
  readonly windows: OccupancyWindow[];
}

export interface OccupancyDashboardProps {
  readonly lotId: string | undefined;
}
