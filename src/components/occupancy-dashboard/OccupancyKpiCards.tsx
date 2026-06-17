'use client';

import { useMemo } from 'react';
import type { OccupancyKpiCardsProps } from './types';

interface KpiCardProps {
  readonly label: string;
  readonly value: number | string;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly icon: string;
  readonly valueColor?: string;
}

function KpiCard({ label, value, iconBg, iconColor, icon, valueColor }: KpiCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <span className={`material-icons text-xl ${iconColor}`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${valueColor ?? 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}

export function OccupancyKpiCards({ windows }: OccupancyKpiCardsProps) {
  const kpi = useMemo(() => {
    const totalEntries = windows.reduce((s, w) => s + w.entries, 0);
    const totalExits = windows.reduce((s, w) => s + w.exits, 0);
    const current = windows.length > 0 ? windows[windows.length - 1].inside : 0;
    const peak = windows.reduce((m, w) => Math.max(m, w.inside), 0);
    return { totalEntries, totalExits, current, peak };
  }, [windows]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Tổng lượt vào"
        value={kpi.totalEntries.toLocaleString('vi-VN')}
        icon="login"
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <KpiCard
        label="Tổng lượt ra"
        value={kpi.totalExits.toLocaleString('vi-VN')}
        icon="logout"
        iconBg="bg-gray-100"
        iconColor="text-gray-600"
      />
      <KpiCard
        label="Đang trong bãi"
        value={kpi.current.toLocaleString('vi-VN')}
        icon="directions_car"
        iconBg="bg-green-100"
        iconColor="text-green-600"
        valueColor="text-green-700"
      />
      <KpiCard
        label="Cao điểm"
        value={kpi.peak.toLocaleString('vi-VN')}
        icon="trending_up"
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        valueColor="text-amber-700"
      />
    </div>
  );
}
