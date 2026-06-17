import type { OccupancyWindow } from '@/types/model';

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
];
