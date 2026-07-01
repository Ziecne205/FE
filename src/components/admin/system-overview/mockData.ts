import type { AdminDashboard, UsagePoint } from './types';

// 1 tòa nhà, tổng quan theo từng tầng (B1 / F1 / F2).
export const mockDashboard: AdminDashboard = {
  floors: [
    {
      floorId: 'B1',
      floorName: 'Hầm B1 (Ô tô)',
      capacity: 300,
      inside: 270,
      outstanding: 10,
      walkInHeadroom: 20,
      occupancyRate: 90,
      openIncidents: 1,
      revenueToday: 12_000_000,
    },
    {
      floorId: 'F1',
      floorName: 'Tầng 1 (Ô tô)',
      capacity: 400,
      inside: 300,
      outstanding: 30,
      walkInHeadroom: 70,
      occupancyRate: 75,
      openIncidents: 0,
      revenueToday: 18_000_000,
    },
    {
      floorId: 'F2',
      floorName: 'Tầng 2 (Xe máy)',
      capacity: 600,
      inside: 270,
      outstanding: 20,
      walkInHeadroom: 310,
      occupancyRate: 45,
      openIncidents: 0,
      revenueToday: 8_000_000,
    },
  ],
  totals: {
    capacity: 1300,
    inside: 840,
    outstanding: 60,
    walkInHeadroom: 400,
    occupancyRate: 64.6,
    openIncidents: 1,
    revenueToday: 38_000_000,
  },
};

export const mockUsageCurve: UsagePoint[] = [
  { hour: '00:00', occupancyRate: 15 },
  { hour: '02:00', occupancyRate: 10 },
  { hour: '04:00', occupancyRate: 8 },
  { hour: '06:00', occupancyRate: 22 },
  { hour: '08:00', occupancyRate: 55 },
  { hour: '10:00', occupancyRate: 72 },
  { hour: '12:00', occupancyRate: 68 },
  { hour: '14:00', occupancyRate: 74 },
  { hour: '16:00', occupancyRate: 82 },
  { hour: '18:00', occupancyRate: 90 },
  { hour: '20:00', occupancyRate: 76 },
  { hour: '22:00', occupancyRate: 45 },
  { hour: '24:00', occupancyRate: 28 },
];
