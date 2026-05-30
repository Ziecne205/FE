import { ParkingSession } from '@/types'
import { mockSlots } from './slots'

export const mockSessions: ParkingSession[] = [
  {
    id: 'session-1',
    booking_id: 'booking-1',
    vehicle_id: 'vehicle-1',
    slot_id: mockSlots.find(s => s.status === 'Occupied')?.id || 'slot-1',
    license_plate: '29A-12345',
    entry_time: '2026-05-30T08:30:00Z',
    exit_time: undefined,
    duration_minutes: undefined,
    status: 'Active',
  },
  {
    id: 'session-2',
    booking_id: undefined,
    vehicle_id: 'vehicle-2',
    slot_id: mockSlots.find((s, i) => s.status === 'Occupied' && i > 0)?.id || 'slot-2',
    license_plate: '30B-67890',
    entry_time: '2026-05-30T10:15:00Z',
    exit_time: undefined,
    duration_minutes: undefined,
    status: 'Active',
  },
  {
    id: 'session-3',
    booking_id: undefined,
    vehicle_id: 'vehicle-3',
    slot_id: mockSlots.find((s, i) => s.status === 'Occupied' && i > 1)?.id || 'slot-3',
    license_plate: '51C-11111',
    entry_time: '2026-05-30T14:00:00Z',
    exit_time: undefined,
    duration_minutes: undefined,
    status: 'Active',
  },
]
