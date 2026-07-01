import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { SystemKpiStrip } from './SystemKpiStrip';
import { LotHeatmapGrid } from './LotHeatmapGrid';
import { SystemUsageCurve } from './SystemUsageCurve';
import { IncidentList } from './IncidentList';
import { mockUsageCurve } from './mockData';



export function SystemOverview() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant font-body-md text-body-md">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      <SystemKpiStrip totals={data.totals} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <div className="lg:col-span-4">
          <IncidentList />
        </div>
        <div className="lg:col-span-8">
          <LotHeatmapGrid floors={data.floors} />
        </div>
      </div>

      <SystemUsageCurve data={data.usageCurve?.length ? data.usageCurve : mockUsageCurve} />
    </div>
  );
}
