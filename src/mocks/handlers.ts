import { http, HttpResponse } from 'msw'
import { mockSlots } from './data/slots'
import { mockSessions } from './data/sessions'
import {
  PARKING_LOTS,
  VEHICLE_TYPES,
  generateSlots,
  computeAvailability,
} from './data/lots'
import { mockIncidents } from './data/incidents'
import { mockReservations } from './data/reservations'
import type { Reservation, ReservationStatus } from '@/types/model'
import type { UpdateSlotRequest, CreateSessionRequest, LoginRequest } from './types'

// Create deep clones to avoid mutation.
// NOTE: slots/sessions remain on the legacy contract until the /dashboard and
// /sessions screens are migrated; everything else is capacity-reservation.
let slots = structuredClone(mockSlots)
let sessions = structuredClone(mockSessions)

// ── Capacity-reservation model state (new contract) ─────────────────────────────
let slotsV2 = generateSlots('lot-1')
let incidentsV2 = structuredClone(mockIncidents)
let reservationsV2 = structuredClone(mockReservations)

const QUOTA_PERCENT = 0.2 // booking quota as % of capacity (per vehicle type)
const ACTIVE_RES_STATUSES: ReservationStatus[] = ['Pending', 'Confirmed', 'CheckedIn']

interface MaintenanceRequest {
  slotCodes: string[]
  maintenance: boolean
}

interface ResolveIncidentRequest {
  handledByStaffId?: string
  resolutionNotes?: string
}

interface CreateReservationRequest {
  parkingLotId: string
  vehicleTypeId: string
  licensePlate: string
  expectedEntryTime: string
  expectedExitTime: string
  userId?: string
  override?: boolean // Manager bypass of a locked window
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

  // Incidents — list (status/lot filter) + resolve.
  http.get('/api/incidents', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const lotId = url.searchParams.get('lotId')
    let result = incidentsV2
    if (lotId) result = result.filter((i) => i.parkingLotId === lotId)
    if (status && status !== 'all') result = result.filter((i) => i.status === status)
    return HttpResponse.json(result)
  }),

  http.put('/api/incidents/:id/resolve', async ({ params, request }) => {
    const body = (await request.json()) as ResolveIncidentRequest
    const idx = incidentsV2.findIndex((i) => i.incidentId === params.id)
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: 'Không tìm thấy sự cố', errorCode: 'NOT_FOUND' },
        { status: 404 },
      )
    }
    incidentsV2[idx] = {
      ...incidentsV2[idx],
      status: 'Resolved',
      handledByStaffId: body.handledByStaffId ?? incidentsV2[idx].handledByStaffId,
      resolutionNotes: body.resolutionNotes,
      resolveAt: new Date().toISOString(),
    }
    return HttpResponse.json(incidentsV2[idx])
  }),

  // Reservations — capacity-slot bookings (no physical slot).
  http.get('/api/reservations', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const lotId = url.searchParams.get('lotId')
    let result = reservationsV2
    if (lotId) result = result.filter((r) => r.parkingLotId === lotId)
    if (status && status !== 'all') result = result.filter((r) => r.status === status)
    return HttpResponse.json(result)
  }),

  http.post('/api/reservations', async ({ request }) => {
    const body = (await request.json()) as CreateReservationRequest

    // Quota check (§5): quotaAbs = ceil(QUOTA_PERCENT * C(type)); a Manager may override.
    const capacity = slotsV2.filter(
      (s) => s.vehicleTypeId === body.vehicleTypeId && s.status !== 'Maintenance',
    ).length
    const quotaAbs = Math.ceil(QUOTA_PERCENT * capacity)
    const activeCount = reservationsV2.filter(
      (r) => r.vehicleTypeId === body.vehicleTypeId && ACTIVE_RES_STATUSES.includes(r.status),
    ).length
    if (activeCount >= quotaAbs && !body.override) {
      return HttpResponse.json(
        { success: false, message: 'Khung giờ đã khóa đặt chỗ', errorCode: 'QUOTA_FULL' },
        { status: 409 },
      )
    }

    // Deposit = 20% of estimated parking fee (10k VND/hour, rounded up).
    const hours = Math.max(
      1,
      Math.ceil(
        (new Date(body.expectedExitTime).getTime() - new Date(body.expectedEntryTime).getTime()) /
          3_600_000,
      ),
    )
    const depositAmount = Math.round(hours * 10_000 * 0.2)
    const vehicleTypeName = VEHICLE_TYPES.find((v) => v.id === body.vehicleTypeId)?.name

    const reservation: Reservation = {
      reservationId: `res-${Date.now()}`,
      parkingLotId: body.parkingLotId,
      vehicleTypeId: body.vehicleTypeId,
      vehicleTypeName,
      licensePlate: body.licensePlate,
      expectedEntryTime: body.expectedEntryTime,
      expectedExitTime: body.expectedExitTime,
      depositAmount,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }
    reservationsV2.push(reservation)
    return HttpResponse.json(
      {
        success: true,
        reservationId: reservation.reservationId,
        status: 'Pending',
        depositAmount,
        message: 'Vui lòng thanh toán cọc để xác nhận',
      },
      { status: 201 },
    )
  }),

  http.post('/api/reservations/:id/cancel', ({ params }) => {
    const idx = reservationsV2.findIndex((r) => r.reservationId === params.id)
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: 'Không tìm thấy đặt chỗ', errorCode: 'NOT_FOUND' },
        { status: 404 },
      )
    }
    reservationsV2[idx] = { ...reservationsV2[idx], status: 'Cancelled' }
    return HttpResponse.json({ success: true, status: 'Cancelled' })
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
