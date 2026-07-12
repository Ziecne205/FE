import type { PricingPolicy, FeeConfig } from '@/types/model'

// Bảng giá đầy đủ — mỗi loại xe một chính sách (khớp shape PricingPolicy hiện tại).
export const mockPricingPolicies: PricingPolicy[] = [
  {
    policyId: 'pp-car',
    vehicleTypeId: 'vt-car',
    vehicleTypeName: 'Ô tô',
    basePrice: 10_000,
    baseHours: 1,
    extraHourPrice: 10_000,
    nightSurcharge: 0,
    lostTicketFee: 0,
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
