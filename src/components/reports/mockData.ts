import type { OccupancyWindow } from '@/types/model'
import type { RevenuePoint } from './types'

export const MOCK_REVENUE: RevenuePoint[] = [
  { date: '2026-06-11', revenue: 4_200_000, sessions: 58,  occupancyRate: 62 },
  { date: '2026-06-12', revenue: 5_800_000, sessions: 74,  occupancyRate: 78 },
  { date: '2026-06-13', revenue: 3_100_000, sessions: 41,  occupancyRate: 45 },
  { date: '2026-06-14', revenue: 6_500_000, sessions: 89,  occupancyRate: 85 },
  { date: '2026-06-15', revenue: 7_200_000, sessions: 102, occupancyRate: 91 },
  { date: '2026-06-16', revenue: 6_900_000, sessions: 95,  occupancyRate: 88 },
  { date: '2026-06-17', revenue: 5_400_000, sessions: 71,  occupancyRate: 74 },
]

export const MOCK_OCCUPANCY: OccupancyWindow[] = [
  { windowStart: '06:00', windowEnd: '08:00', entries: 12,  exits: 2,   inside: 10  },
  { windowStart: '08:00', windowEnd: '10:00', entries: 58,  exits: 8,   inside: 60  },
  { windowStart: '10:00', windowEnd: '12:00', entries: 34,  exits: 22,  inside: 72  },
  { windowStart: '12:00', windowEnd: '14:00', entries: 20,  exits: 38,  inside: 54  },
  { windowStart: '14:00', windowEnd: '16:00', entries: 42,  exits: 15,  inside: 81  },
  { windowStart: '16:00', windowEnd: '18:00', entries: 65,  exits: 20,  inside: 126 },
  { windowStart: '18:00', windowEnd: '20:00', entries: 30,  exits: 55,  inside: 101 },
  { windowStart: '20:00', windowEnd: '22:00', entries: 10,  exits: 60,  inside: 51  },
  { windowStart: '22:00', windowEnd: '00:00', entries: 5,   exits: 40,  inside: 16  },
]

export const MOCK_REPORTS = {
  revenue: MOCK_REVENUE,
  occupancy: MOCK_OCCUPANCY,
}
