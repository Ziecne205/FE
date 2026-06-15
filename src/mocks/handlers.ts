import { http, HttpResponse } from 'msw'
import { mockSlots } from './data/slots'
import { mockSessions } from './data/sessions'
import { mockBookings } from './data/bookings'
import { mockExceptions } from './data/exceptions'
import {
  PARKING_LOTS,
  VEHICLE_TYPES,
  generateSlots,
  computeAvailability,
} from './data/lots'
import type {
  UpdateSlotRequest,
  CreateSessionRequest,
  CreateBookingRequest,
  UpdateBookingRequest,
  ResolveExceptionRequest,
  LoginRequest,
} from './types'

// Create deep clones to avoid mutation
let slots = structuredClone(mockSlots)
let sessions = structuredClone(mockSessions)
let bookings = structuredClone(mockBookings)
let exceptions = structuredClone(mockExceptions)

// ── Capacity-reservation model state (new contract) ─────────────────────────────
let slotsV2 = generateSlots('lot-1')

interface MaintenanceRequest {
  slotCodes: string[]
  maintenance: boolean
}

export const handlers = [
  // ── Capacity-reservation endpoints (APIs-List.md) ─────────────────────────────
  http.get('/api/vehicle-types', () => HttpResponse.json(VEHICLE_TYPES)),

  http.get('/api/parking-lots', () => HttpResponse.json(PARKING_LOTS)),

  // Per-slot list for the visual map (flagged as an open question in the plan).
  http.get('/api/parking-lots/:id/slots', ({ params }) =>
    HttpResponse.json(slotsV2.filter((s) => s.parkingLotId === params.id))
  ),

  // Realtime availability / headroom — source of truth for "occupancy".
  http.get('/api/parking-lots/:id/availability', ({ params }) =>
    HttpResponse.json(computeAvailability(slotsV2, String(params.id)))
  ),

  // Manager maintenance toggle + capacity-crash warning.
  http.post('/api/admin/slots/maintenance', async ({ request }) => {
    const { slotCodes, maintenance } = (await request.json()) as MaintenanceRequest
    slotsV2 = slotsV2.map((s) =>
      slotCodes.includes(s.slotCode)
        ? { ...s, status: maintenance ? 'Maintenance' : 'Available' }
        : s
    )
    const availability = computeAvailability(slotsV2)
    const crashed = availability.byVehicleType.filter((t) => t.walkInHeadroom < 0)
    return HttpResponse.json({
      success: true,
      availability,
      warning: crashed.length
        ? {
            errorCode: 'CAPACITY_CRASH',
            message: 'Thao tác làm sức chứa tụt dưới số xe đang giữ — vãng lai bị chặn 100%.',
            affectedTypes: crashed.map((t) => t.vehicleTypeName),
          }
        : null,
    })
  }),

  // Slots endpoints
  http.get('/api/slots', () => {
    return HttpResponse.json(slots)
  }),

  http.get('/api/slots/:id', ({ params }) => {
    const slot = slots.find((s) => s.id === params.id)
    if (!slot) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(slot)
  }),

  http.patch('/api/slots/:id', async ({ params, request }) => {
    const updates = await request.json() as UpdateSlotRequest
    const slotIndex = slots.findIndex((s) => s.id === params.id)
    if (slotIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    slots[slotIndex] = { ...slots[slotIndex], ...updates }
    return HttpResponse.json(slots[slotIndex])
  }),

  // Sessions endpoints
  http.get('/api/sessions', () => {
    return HttpResponse.json(sessions)
  }),

  http.get('/api/sessions/active', () => {
    const activeSessions = sessions.filter((s) => s.status === 'Active')
    return HttpResponse.json(activeSessions)
  }),

  http.post('/api/sessions', async ({ request }) => {
    const data = await request.json() as CreateSessionRequest

    // Create new parking session
    const newSession = {
      id: `session-${Date.now()}`,
      booking_id: undefined,
      vehicle_id: `vehicle-${Date.now()}`,
      slot_id: data.slot_id,
      license_plate: data.license_plate,
      entry_time: new Date().toISOString(),
      exit_time: undefined,
      duration_minutes: undefined,
      status: 'Active' as const,
    }

    sessions.push(newSession)

    // Update slot status to Occupied
    const slotIndex = slots.findIndex((s) => s.id === data.slot_id)
    if (slotIndex !== -1) {
      slots[slotIndex].status = 'Occupied'
    }

    return HttpResponse.json(newSession, { status: 201 })
  }),

  // Bookings endpoints
  http.get('/api/bookings', () => {
    return HttpResponse.json(bookings)
  }),

  http.post('/api/bookings', async ({ request }) => {
    const data = await request.json() as CreateBookingRequest

    // Calculate duration in hours
    const startTime = new Date(data.booking_start)
    const endTime = new Date(data.booking_end)
    const durationHours = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))

    // Create new booking
    const newBooking = {
      id: `booking-${Date.now()}`,
      user_id: `user-${Date.now()}`,
      vehicle_id: `vehicle-${Date.now()}`,
      slot_id: data.slot_id,
      booking_start_time: data.booking_start,
      booking_end_time: data.booking_end,
      duration_hours: durationHours,
      status: 'Pending' as const,
      created_at: new Date().toISOString(),
    }

    bookings.push(newBooking)

    // Update slot status to Reserved
    const slotIndex = slots.findIndex((s) => s.id === data.slot_id)
    if (slotIndex !== -1) {
      slots[slotIndex].status = 'Reserved'
    }

    return HttpResponse.json(newBooking, { status: 201 })
  }),

  http.patch('/api/bookings/:id', async ({ params, request }) => {
    const updates = await request.json() as UpdateBookingRequest
    const bookingIndex = bookings.findIndex((b) => b.id === params.id)
    if (bookingIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    bookings[bookingIndex] = { ...bookings[bookingIndex], ...updates }
    return HttpResponse.json(bookings[bookingIndex])
  }),

  // Exceptions endpoints
  http.get('/api/exceptions', () => {
    return HttpResponse.json(exceptions)
  }),

  http.patch('/api/exceptions/:id/resolve', async ({ params, request }) => {
    const { resolved_by } = await request.json() as ResolveExceptionRequest
    const exceptionIndex = exceptions.findIndex((e) => e.id === params.id)
    if (exceptionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    exceptions[exceptionIndex] = {
      ...exceptions[exceptionIndex],
      status: 'Resolved',
      resolved_by,
      resolved_at: new Date().toISOString(),
    }
    return HttpResponse.json(exceptions[exceptionIndex])
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as LoginRequest

    // Mock authentication
    const user = {
      id: '1',
      email,
      phone: '0123456789',
      full_name: email.includes('manager') ? 'Nguyễn Văn A' : 'Trần Thị B',
      role: email.includes('manager') ? 'Manager' : 'Staff',
      facility_id: 'facility-1',
      created_at: new Date(),
    }

    return HttpResponse.json({
      user,
      token: 'mock-jwt-token',
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),
]
