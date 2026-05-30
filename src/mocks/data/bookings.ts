import { Booking } from '@/types'
import { mockSlots } from './slots'

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    user_id: 'user-1',
    vehicle_id: 'vehicle-1',
    slot_id: mockSlots.find(s => s.status === 'Occupied')?.id || 'slot-1',
    booking_start_time: '2026-05-31T08:00:00Z',
    booking_end_time: '2026-05-31T12:00:00Z',
    duration_hours: 4,
    status: 'Confirmed',
    created_at: '2026-05-30T10:00:00Z',
  },
  {
    id: 'booking-2',
    user_id: 'user-2',
    vehicle_id: 'vehicle-2',
    slot_id: mockSlots.find(s => s.status === 'Reserved')?.id || 'slot-2',
    booking_start_time: '2026-05-31T14:00:00Z',
    booking_end_time: '2026-05-31T18:00:00Z',
    duration_hours: 4,
    status: 'Pending',
    created_at: '2026-05-30T12:00:00Z',
  },
  {
    id: 'booking-3',
    user_id: 'user-3',
    vehicle_id: 'vehicle-3',
    slot_id: mockSlots.find((s, i) => s.status === 'Reserved' && i > 0)?.id || 'slot-3',
    booking_start_time: '2026-06-01T09:00:00Z',
    booking_end_time: '2026-06-01T17:00:00Z',
    duration_hours: 8,
    status: 'Confirmed',
    created_at: '2026-05-29T15:00:00Z',
  },
]
