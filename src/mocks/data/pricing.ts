import type { PricingPolicy, FeeConfig } from '@/types/model'

// Bảng giá theo giờ — mỗi loại xe một mức (v3.1: giá phẳng).
export const mockPricingPolicies: PricingPolicy[] = [
  {
    policyId: 'pp-car',
    vehicleTypeId: 'vt-car',
    vehicleTypeName: 'Ô tô',
    hourlyRate: 10_000,
    status: 'Active',
    effectiveDate: '2026-01-01T00:00:00',
  },
  {
    policyId: 'pp-moto',
    vehicleTypeId: 'vt-moto',
    vehicleTypeName: 'Xe máy',
    hourlyRate: 5_000,
    status: 'Active',
    effectiveDate: '2026-01-01T00:00:00',
  },
]

export const mockFeeConfig: FeeConfig = {
  depositPercent: 20,
  overstayRatePerHour: 10_000,
  noShowGraceMinutes: 30,
  blacklistThreshold: 3,
}
