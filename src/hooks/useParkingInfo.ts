import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface VehicleTypeAvailabilityInfo {
  vehicleTypeId: number
  vehicleTypeName: string
  totalSlots: number
  availableSlots: number
}

export interface ParkingPricingPolicyInfo {
  vehicleTypeName: string
  basePrice: number
  baseHours: number
  extraHourPrice: number
  nightSurcharge: number
}

/** BE ParkingInfoDTO (DriverController, public) — GET /driver/parking-info. */
export interface ParkingInfo {
  parkingName: string
  operatingHours: string
  totalAvailableSlots: number
  availabilityByVehicleType: VehicleTypeAvailabilityInfo[]
  pricingPolicies: ParkingPricingPolicyInfo[]
}

/** Thông tin bãi đỗ công khai (không cần đăng nhập) — GET /driver/parking-info. */
export function useParkingInfo() {
  return useQuery({
    queryKey: ['driver', 'parking-info'],
    queryFn: () => api.get<ParkingInfo>('/driver/parking-info'),
  })
}
