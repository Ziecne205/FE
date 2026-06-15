'use client';

import { useMemo, useState } from 'react';
import type { VehicleTypeAvailability } from '@/types/model';
import type { CapacityKpiData } from '@/components/capacity-dashboard/types';
import { useAvailability, useParkingLots } from '@/hooks/useAvailability'
import { useOpenIncidentCount } from '@/hooks/useIncidents';

interface UseCapacityDashboardReturn {
  lotName: string;
  lotOptions: string[];
  selectedLot: string;
  onLotChange: (lotName: string) => void;
  lastUpdated: string;
  onRefresh: () => void;
  kpi: CapacityKpiData;
  vehicleTypes: VehicleTypeAvailability[];
  warningMessage: string | null;
  isLoading: boolean;
}

function computeKpi(types: VehicleTypeAvailability[], openIncidents: number): CapacityKpiData {
  const totalCapacity = types.reduce((sum, t) => sum + t.capacity, 0);
  const inside = types.reduce((sum, t) => sum + t.inside, 0);
  const occupancyRate = totalCapacity ? Math.round((inside / totalCapacity) * 1000) / 10 : 0;
  return { totalCapacity, inside, occupancyRate, openIncidents };
}

function computeWarning(types: VehicleTypeAvailability[]): string | null {
  const crashed = types.filter((t) => t.walkInHeadroom < 0).map((t) => t.vehicleTypeName);
  return crashed.length
    ? `Cảnh báo: Sức chứa ${crashed.join(', ')} tụt dưới số xe đang giữ — vãng lai bị chặn`
    : null;
}

/**
 * Capacity dashboard data, wired to the real availability endpoint via React Query
 * (auto-refetches on the global interval). Pass an initial lot id, or it defaults to
 * the first lot returned by GET /api/parking-lots.
 */
export function useCapacityDashboard(initialLotId?: string): UseCapacityDashboardReturn {
  const { data: lots } = useParkingLots();
  const [selectedLotId, setSelectedLotId] = useState<string | undefined>(initialLotId);

  const effectiveLotId = selectedLotId ?? lots?.[0]?.id;
  const { data: availability, refetch, isFetching, dataUpdatedAt } = useAvailability(effectiveLotId);
  const { data: openIncidents = 0 } = useOpenIncidentCount(effectiveLotId);

  const vehicleTypes = availability?.byVehicleType ?? [];
  const kpi = useMemo(() => computeKpi(vehicleTypes, openIncidents), [vehicleTypes, openIncidents]);
  const warningMessage = useMemo(() => computeWarning(vehicleTypes), [vehicleTypes]);

  const lotOptions = lots?.map((l) => l.name) ?? [];
  const selectedLotName = lots?.find((l) => l.id === effectiveLotId)?.name ?? '';

  const lastUpdated = dataUpdatedAt
    ? `Cập nhật lúc ${new Date(dataUpdatedAt).toLocaleTimeString('vi-VN')}`
    : 'Đang tải...';

  return {
    lotName: selectedLotName,
    lotOptions,
    selectedLot: selectedLotName,
    onLotChange: (name) => {
      const match = lots?.find((l) => l.name === name);
      if (match) setSelectedLotId(match.id);
    },
    lastUpdated,
    onRefresh: () => void refetch(),
    kpi,
    vehicleTypes,
    warningMessage,
    isLoading: isFetching && !availability,
  };
}
