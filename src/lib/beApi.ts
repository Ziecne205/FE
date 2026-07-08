// Hình dạng DTO của Spring Boot backend + hàm map sang model FE (@/types/model).
// Mọi việc "nối API" gom về đây: hook chỉ gọi endpoint rồi map qua các hàm này,
// UI giữ nguyên vì luôn nhận shape FE đã quen.
import type {
  Slot,
  SlotStatus,
  VehicleType,
  ParkingSession,
  SessionStatus,
  Incident,
  IncidentStatus,
  IncidentType,
  Reservation,
  ReservationStatus,
  BookingQuota,
  PricingPolicy,
  FeeConfig,
  LotAvailability,
} from '@/types/model'

// ── BE DTO shapes ───────────────────────────────────────────────────────────────
export interface BeVehicleType {
  vehicleTypeId: number
  typeName: string
  dimensions?: string | null
}

interface BeFloor {
  floorId: number
  floorName: string
}

export interface BeGate {
  gateId: number
  gateName: string
  gateType: string // "Entry" | "Exit"
}

export interface BeSlot {
  slotId: number
  zone?: string | null
  slotCode: string
  status: string
  floor?: BeFloor | null
  vehicleType?: BeVehicleType | null
}

export interface BeActiveSession {
  sessionId: number
  licensePlateIn: string
  vehicleTypeName?: string | null
  entryTime: string
  entryGateName?: string | null
  status: string
  suggestedSlotCode?: string | null
  actualSlotCode?: string | null
  hasReservation: boolean
  hasCard: boolean
  parkedMinutes: number
  isForceCheckIn?: boolean | null  // staff overrode plate mismatch
  isOverstay?: boolean | null      // session exceeded 24h grace period
  estimatedFee?: number | null     // phí tạm tính theo bảng giá đến hiện tại
}

export interface BeIncident {
  incidentId: number
  // BE @JsonIgnore các quan hệ và phơi ID phẳng qua getter:
  sessionId?: number | null
  reportedByUserId?: number | null
  handledByStaffId?: number | null
  issueType: string
  description: string
  proofImageUrl?: string | null
  status: string
  resolvedAt?: string | null
  resolutionNotes?: string | null
  createdAt?: string | null
}

export interface BeReservation {
  reservationId: number
  // BE @JsonIgnore user & vehicleType, phơi phẳng qua getter:
  userId?: number | null
  vehicleTypeId?: number | null
  vehicleTypeName?: string | null
  licensePlate: string
  expectedEntryTime: string
  expectedExitTime: string
  depositAmount: number
  depositStatus?: string | null
  status: string
  createdAt: string
}

export interface BeQuota {
  quotaId: number
  vehicleType?: BeVehicleType | null
  startTime: string // "HH:mm:ss"
  endTime: string
  quotaPercent: number
  isActive?: boolean | null
}

export interface BePricingPolicy {
  policyId: number
  vehicleType?: BeVehicleType | null
  basePrice: number
  baseHours: number
  extraHourPrice: number
  nightSurcharge?: number | null
  lostTicketFee?: number | null
  effectiveDate: string
  status: string
}

export interface BeFeeConfig {
  depositPercent: number
  overstayRatePerHour: number
  noShowGraceMinutes: number
  blacklistThreshold: number
}

export interface BeParkingInfo {
  parkingName: string
  operatingHours: string
  totalAvailableSlots: number
  availabilityByVehicleType: Array<{
    vehicleTypeName: string
    totalSlots: number
    availableSlots: number
  }>
  pricingPolicies: Array<{
    vehicleTypeName: string
    basePrice: number
    baseHours: number
    extraHourPrice: number
    nightSurcharge?: number | null
  }>
}

/**
 * Shape returned by GET /manager/availability — matches LotAvailability directly.
 * (Different from the public /driver/parking-info which uses BeParkingInfo above.)
 */
export interface BeManagerAvailability {
  byVehicleType: Array<{
    vehicleTypeName: string
    capacity: number
    inside: number
    outstanding: number
    walkInHeadroom: number
    byZone: Array<{ zone: string; available: number }>
  }>
}

/** Floor DTO from /manager/floors */
export interface BeFloor {
  floorId: number
  floorName: string
  dedicatedVehicleTypeId?: number | null
  totalCapacity?: number | null
}

/** CheckOut response now includes isOverstay from the backend */
export interface BeCheckOutResponse {
  sessionId: number
  amount: number
  paymentStatus: string
  paymentMethod: string
  plateMismatch: boolean
  slotFreed?: string | null
  isOverstay?: boolean | null
}

export interface BeRevenueReport {
  fromDate: string
  toDate: string
  completedSessions: number
  totalRevenue: number
  avgRevenuePerSession: number
}

export interface BeTrafficReport {
  period: string
  totalEntries: number
  totalExits: number
  currentInside: number
  walkInCount: number
  reservationCount: number
  peakHour: number
  peakHourCount: number
}

// ── helpers ─────────────────────────────────────────────────────────────────────
/** "B1" → -1, "Tầng 2" → 2, "P3" → 3. Tầng hầm (có chữ B) là số âm. */
function parseFloor(floorName?: string | null): number {
  if (!floorName) return 0
  const digits = floorName.match(/\d+/)
  const n = digits ? parseInt(digits[0], 10) : 0
  return /b/i.test(floorName) ? -n : n
}

/** "08:00:00" → "08:00" */
function hhmm(time?: string | null): string {
  return (time ?? '').slice(0, 5)
}

// ── mappers: BE → FE ──────────────────────────────────────────────────────────────
export function mapVehicleType(v: BeVehicleType): VehicleType {
  return { id: String(v.vehicleTypeId), name: v.typeName }
}

export function mapSlot(s: BeSlot): Slot {
  return {
    id: String(s.slotId),
    slotCode: s.slotCode,
    floor: parseFloor(s.floor?.floorName),
    zone: s.zone ?? undefined,
    vehicleTypeId: s.vehicleType ? String(s.vehicleType.vehicleTypeId) : '',
    status: s.status as SlotStatus,
  }
}

export function mapActiveSession(s: BeActiveSession): ParkingSession {
  return {
    sessionId: String(s.sessionId),
    // BE DTO chỉ cho biết có booking hay không (không trả reservationId);
    // dùng cờ để UI hiện nhãn "Đặt chỗ".
    reservationId: s.hasReservation ? 'booked' : null,
    vehicleTypeId: '',
    vehicleTypeName: s.vehicleTypeName ?? undefined,
    licensePlate: s.licensePlateIn,
    assignedSlotCode: s.suggestedSlotCode ?? undefined,
    actualSlotCode: s.actualSlotCode ?? undefined,
    entryTime: s.entryTime,
    isPaid: false,
    totalFee: s.estimatedFee ?? undefined, // phí tạm tính từ BE (null khi chưa có bảng giá)
    status: s.status as SessionStatus,
    isForceCheckIn: s.isForceCheckIn ?? undefined,
    isOverstay: s.isOverstay ?? undefined,
  }
}

export function mapIncident(i: BeIncident): Incident {
  return {
    incidentId: String(i.incidentId),
    issueType: i.issueType as IncidentType,
    sessionId: i.sessionId != null ? String(i.sessionId) : undefined,
    description: i.description,
    createdAt: i.createdAt ?? i.resolvedAt ?? new Date().toISOString(),
    status: i.status as IncidentStatus,
    handledByStaffId: i.handledByStaffId != null ? String(i.handledByStaffId) : undefined,
    resolutionNotes: i.resolutionNotes ?? undefined,
    resolveAt: i.resolvedAt ?? undefined,
  }
}

export function mapReservation(r: BeReservation): Reservation {
  return {
    reservationId: String(r.reservationId),
    userId: r.userId != null ? String(r.userId) : undefined,
    vehicleTypeId: r.vehicleTypeId != null ? String(r.vehicleTypeId) : '',
    vehicleTypeName: r.vehicleTypeName ?? undefined,
    licensePlate: r.licensePlate,
    expectedEntryTime: r.expectedEntryTime,
    expectedExitTime: r.expectedExitTime,
    depositAmount: Number(r.depositAmount ?? 0),
    status: r.status as ReservationStatus,
    createdAt: r.createdAt,
  }
}

export function mapQuota(q: BeQuota): BookingQuota {
  return {
    quotaId: String(q.quotaId),
    vehicleTypeId: q.vehicleType ? String(q.vehicleType.vehicleTypeId) : '',
    windowStart: hhmm(q.startTime),
    windowEnd: hhmm(q.endTime),
    quotaPercent: Number(q.quotaPercent ?? 0),
    isActive: q.isActive !== false, // BE mới có cờ IsActive; mặc định coi là bật.
  }
}

export function mapPricingPolicy(p: BePricingPolicy): PricingPolicy {
  return {
    policyId: String(p.policyId),
    vehicleTypeId: p.vehicleType ? String(p.vehicleType.vehicleTypeId) : '',
    vehicleTypeName: p.vehicleType?.typeName ?? '',
    hourlyRate: Number(p.basePrice ?? 0), // v3.1 giá phẳng → basePrice là giá/giờ.
    status: (p.status as 'Active' | 'Expired') ?? 'Active',
    effectiveDate: p.effectiveDate,
  }
}

export function mapFeeConfig(c: BeFeeConfig): FeeConfig {
  return {
    depositPercent: Number(c.depositPercent ?? 0),
    overstayRatePerHour: Number(c.overstayRatePerHour ?? 0),
    noShowGraceMinutes: Number(c.noShowGraceMinutes ?? 0),
    blacklistThreshold: Number(c.blacklistThreshold ?? 0),
  }
}

function mapAvailability(info: BeParkingInfo): LotAvailability {
  return {
    byVehicleType: (info.availabilityByVehicleType ?? []).map((a) => ({
      vehicleTypeName: a.vehicleTypeName,
      capacity: a.totalSlots,
      inside: a.totalSlots - a.availableSlots,
      outstanding: 0, // BE /parking-info không tách "booking chưa vào".
      walkInHeadroom: a.availableSlots,
      byZone: [],
    })),
  }
}

/**
 * Passthrough: GET /manager/availability already returns the canonical
 * LotAvailability shape (capacity, inside, outstanding, walkInHeadroom, byZone).
 * No mapping needed — cast directly.
 */
export function mapManagerAvailability(raw: BeManagerAvailability): LotAvailability {
  return raw as LotAvailability
}
