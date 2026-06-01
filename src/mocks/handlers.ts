import { http, HttpResponse } from 'msw'
import { mockSlots } from './data/slots'
import { mockSessions } from './data/sessions'
import { mockBookings } from './data/bookings'
import { mockExceptions } from './data/exceptions'
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

export const handlers = [
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
