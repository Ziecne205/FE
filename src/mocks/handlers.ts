import { http, HttpResponse } from 'msw'
import { mockSlots } from './data/slots'
import { mockSessions } from './data/sessions'
import { mockBookings } from './data/bookings'
import { mockExceptions } from './data/exceptions'

export const handlers = [
  // Slots endpoints
  http.get('/api/slots', () => {
    return HttpResponse.json(mockSlots)
  }),

  http.get('/api/slots/:id', ({ params }) => {
    const slot = mockSlots.find((s) => s.id === params.id)
    if (!slot) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(slot)
  }),

  http.patch('/api/slots/:id', async ({ params, request }) => {
    const updates = await request.json() as Record<string, any>
    const slotIndex = mockSlots.findIndex((s) => s.id === params.id)
    if (slotIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    mockSlots[slotIndex] = { ...mockSlots[slotIndex], ...updates }
    return HttpResponse.json(mockSlots[slotIndex])
  }),

  // Sessions endpoints
  http.get('/api/sessions', () => {
    return HttpResponse.json(mockSessions)
  }),

  http.get('/api/sessions/active', () => {
    const activeSessions = mockSessions.filter((s) => s.status === 'Active')
    return HttpResponse.json(activeSessions)
  }),

  http.post('/api/sessions', async ({ request }) => {
    const data = await request.json() as any

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

    mockSessions.push(newSession)

    // Update slot status to Occupied
    const slotIndex = mockSlots.findIndex((s) => s.id === data.slot_id)
    if (slotIndex !== -1) {
      mockSlots[slotIndex].status = 'Occupied'
    }

    return HttpResponse.json(newSession, { status: 201 })
  }),

  // Bookings endpoints
  http.get('/api/bookings', () => {
    return HttpResponse.json(mockBookings)
  }),

  http.post('/api/bookings', async ({ request }) => {
    const data = await request.json() as any

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

    mockBookings.push(newBooking)

    // Update slot status to Reserved
    const slotIndex = mockSlots.findIndex((s) => s.id === data.slot_id)
    if (slotIndex !== -1) {
      mockSlots[slotIndex].status = 'Reserved'
    }

    return HttpResponse.json(newBooking, { status: 201 })
  }),

  http.patch('/api/bookings/:id', async ({ params, request }) => {
    const updates = await request.json() as Record<string, any>
    const bookingIndex = mockBookings.findIndex((b) => b.id === params.id)
    if (bookingIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    mockBookings[bookingIndex] = { ...mockBookings[bookingIndex], ...updates }
    return HttpResponse.json(mockBookings[bookingIndex])
  }),

  // Exceptions endpoints
  http.get('/api/exceptions', () => {
    return HttpResponse.json(mockExceptions)
  }),

  http.patch('/api/exceptions/:id/resolve', async ({ params, request }) => {
    const { resolved_by } = await request.json() as any
    const exceptionIndex = mockExceptions.findIndex((e) => e.id === params.id)
    if (exceptionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    mockExceptions[exceptionIndex] = {
      ...mockExceptions[exceptionIndex],
      status: 'Resolved',
      resolved_by,
      resolved_at: new Date().toISOString(),
    }
    return HttpResponse.json(mockExceptions[exceptionIndex])
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any

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
