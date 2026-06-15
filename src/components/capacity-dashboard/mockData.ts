import type { CapacityKpiData } from './types';
import type { VehicleTypeAvailability } from '@/types/model';

export const MOCK_KPI: CapacityKpiData = {
  totalCapacity: 2500,
  inside: 1842,
  occupancyRate: 73.6,
  openIncidents: 3,
};

export const MOCK_LOT_OPTIONS = [
  'Bãi chính (Hầm B1-B3)',
  'Bãi phụ (Ngoài trời)',
  'Bãi VIP (Tầng trệt)',
];

export const MOCK_VEHICLE_TYPES: VehicleTypeAvailability[] = [
  {
    vehicleTypeName: 'Ô tô',
    capacity: 500,
    inside: 320,
    outstanding: 56,
    walkInHeadroom: 124,
    byZone: [
      { zone: 'Hầm B1', available: 45 },
      { zone: 'Hầm B2', available: 68 },
      { zone: 'Hầm B3', available: 11 },
    ],
  },
  {
    vehicleTypeName: 'Xe máy',
    capacity: 2000,
    inside: 1522,
    outstanding: 496,
    walkInHeadroom: -18,
    byZone: [
      { zone: 'Khu A', available: 0 },
      { zone: 'Khu B', available: 0 },
      { zone: 'Khu C (VIP)', available: 0 },
    ],
  },
];

export const MOCK_WARNING =
  'Cảnh báo: Sức chứa xe máy tụt dưới số xe đang giữ';
export const MOCK_WARNING_DETAIL =
  'Khách vãng lai (xe máy) hiện đang bị chặn vào bãi để đảm bảo chỗ cho khách đã đặt trước và vé tháng.';
