import type { VehicleTypeGroup } from './types'
import type { BookingQuota } from '@/types/model'

// Mock capacity per vehicle type (Opus wires to real availability API)
// vehicleTypeId must match VEHICLE_TYPES in src/mocks/data/lots.ts
export const MOCK_CAPACITY: Record<string, number> = {
  'vt-car': 26,
  'vt-moto': 30,
}

export const MOCK_VEHICLE_TYPE_NAMES: Record<string, string> = {
  'vt-car': 'Ô tô',
  'vt-moto': 'Xe máy',
}

export function buildGroups(quotas: BookingQuota[]): VehicleTypeGroup[] {
  const byType: Record<string, BookingQuota[]> = {}
  for (const q of quotas) {
    if (!byType[q.vehicleTypeId]) byType[q.vehicleTypeId] = []
    byType[q.vehicleTypeId].push(q)
  }

  return Object.entries(byType).map(([vehicleTypeId, rows]) => {
    const capacity = MOCK_CAPACITY[vehicleTypeId] ?? 50
    const name = MOCK_VEHICLE_TYPE_NAMES[vehicleTypeId] ?? vehicleTypeId
    return {
      vehicleTypeId,
      vehicleTypeName: name,
      capacity,
      rows: rows
        .slice()
        .sort((a, b) => a.windowStart.localeCompare(b.windowStart))
        .map((q) => ({
          ...q,
          quotaAbs: Math.ceil((q.quotaPercent / 100) * capacity),
          vehicleTypeName: name,
        })),
    }
  })
}
