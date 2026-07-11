// Capacity-Reservation domain model — canonical types going forward.
// New code imports from '@/types/model'. The legacy '@/types' (slot-owns-booking)
// is kept until the /dashboard and /sessions screens migrate off it (then deleted).
// Single building, multiple floors — NO multi-lot (parkingLotId removed v3.1).

// ── Status labels (text as returned by API; service maps INT↔label) ─────────────
export type SlotStatus = 'Available' | 'Occupied' | 'Maintenance'; // NO Reserved
// 'Abandoned' là nhãn vận hành phía FE (thẻ "Bỏ dở" ở SessionStatsBar); BE hiện chưa phát ra
// trạng thái này (mới chỉ có truy vấn nghi vấn bỏ xe) nên số đếm thực tế sẽ là 0 cho tới khi BE hỗ trợ.
export type SessionStatus = 'Admitted' | 'Parked' | 'Moved' | 'Completed' | 'Exception' | 'Abandoned';
export type ReservationStatus =
  | 'Pending' | 'Confirmed' | 'CheckedIn' | 'Fulfilled' | 'Cancelled' | 'Expired';

const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  Pending: 'Chờ thanh toán',
  Confirmed: 'Đã xác nhận',
  CheckedIn: 'Đã vào bãi',
  Fulfilled: 'Hoàn thành',
  Cancelled: 'Đã hủy',
  Expired: 'Hết hạn',
}
export type PaymentStatus = 'Pending' | 'Success' | 'Failed' | 'Refunded';
export type PaymentType = 'Deposit' | 'Parking' | 'Penalty';
export type PaymentMethod = 'Cash' | 'QR';
export type IncidentStatus = 'Open' | 'InProgress' | 'Resolved';
export type IncidentType =
  // BE IssueType enum (giá trị thật từ server)
  | 'LostCard' | 'Loiterer' | 'ExitTailgating' | 'PlateMismatch'
  | 'CapacityCrash' | 'Overstay' | 'CameraMiss' | 'Other'
  // Giá trị mock cũ — giữ để dữ liệu MSW còn type-check (dev only)
  | 'UNMAPPED_OCCUPANCY' | 'ABANDONED_SESSION' | 'EXIT_UNCLOSED'
  | 'OVERSTAY' | 'MANUAL_OVERRIDE' | 'OTHER';
export type GateType = 'Entry' | 'Exit';
export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Driver';

// ── Core entities ───────────────────────────────────────────────────────────────
export interface VehicleType {
  id: string;
  name: string; // "Ô tô" | "Xe máy" | "Xe tải"
}

export interface Slot {
  id: string;
  slotCode: string; // F{floor}-{zone}{number}, zone optional → F2-B07 / F2-07
  floor: number;
  zone?: string;
  vehicleTypeId: string;
  status: SlotStatus;
}

export interface Reservation {
  reservationId: string;
  userId?: string; // driver who owns this reservation
  vehicleTypeId: string;
  vehicleTypeName?: string;
  licensePlate: string;
  expectedEntryTime: string; // ISO-8601
  expectedExitTime: string;
  depositAmount: number; // VND
  status: ReservationStatus;
  createdAt: string;
}

export interface ParkingSession {
  sessionId: string;
  reservationId?: string | null; // null for walk-ins
  vehicleTypeId: string;
  vehicleTypeName?: string;
  licensePlate: string;
  assignedSlotCode?: string; // advisory slot at the gate
  actualSlotCode?: string; // slot the camera confirmed
  entryTime: string; // Admitted — billing basis
  parkedTime?: string;
  movedTime?: string;
  exitTime?: string;
  totalFee?: number;
  isPaid: boolean;
  status: SessionStatus;
  isForceCheckIn?: boolean; // staff overrode a plate mismatch at check-in
  isOverstay?: boolean;     // session ran past the 24-hour overstay grace period
}

export interface Payment {
  paymentId: string;
  reservationId?: string | null;
  sessionId?: string | null;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
}

export interface Incident {
  incidentId: string;
  issueType: IncidentType;
  slotCode?: string;
  sessionId?: string;
  description: string;
  createdAt: string;
  status: IncidentStatus;
  handledByStaffId?: string;
  resolutionNotes?: string;
  resolveAt?: string;
}

// ── Capacity / availability — the source of truth for "occupancy" ───────────────
export interface ZoneAvailability {
  zone: string;
  available: number;
}

export interface VehicleTypeAvailability {
  vehicleTypeName: string;
  capacity: number; // C — usable slots (minus Maintenance)
  inside: number; // cameras count actual cars
  outstanding: number; // confirmed bookings not yet entered
  walkInHeadroom: number; // C − inside − outstanding (can be negative on capacity crash)
  byZone: ZoneAvailability[];
}

/** Tình trạng chỗ trống toàn tòa (1 building) theo loại xe. */
export interface LotAvailability {
  byVehicleType: VehicleTypeAvailability[];
}

// ── Admin / quota ───────────────────────────────────────────────────────────────
export interface BookingQuota {
  quotaId: string;
  vehicleTypeId: string;
  windowStart: string; // "08:00"
  windowEnd: string; // "10:00"
  quotaPercent: number; // % of C, 0–100
  isActive: boolean;
}

export interface OccupancyWindow {
  windowStart: string;
  windowEnd: string;
  entries: number;
  exits: number;
  inside: number;
}

/** Khoảng ngày cho báo cáo (revenue/traffic). */
export interface DateRange {
  from: string;
  to: string;
}

// ── Quản lý tài chính (Manager) ─────────────────────────────────────────────────
/** Bảng giá theo giờ — mỗi loại xe một mức (v3.1: giá phẳng, không ngày/đêm). */
export interface PricingPolicy {
  policyId: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  basePrice: number; // giá cơ bản cho baseHours đầu tiên (VND)
  baseHours: number; // số giờ đã gồm trong basePrice
  extraHourPrice: number; // VND mỗi giờ vượt baseHours
  nightSurcharge: number; // phụ thu đêm (0 nếu không áp dụng)
  lostTicketFee: number; // phí mất vé (0 nếu không áp dụng)
  status: 'Active' | 'Expired';
  effectiveDate: string; // ISO
}

/** Các chính sách phí cấu hình bởi Manager. */
export interface FeeConfig {
  depositPercent: number; // % cọc booking (mặc định 20)
  overstayRatePerHour: number; // phí quá giờ / giờ
  noShowGraceMinutes: number; // ân hạn no-show
  blacklistThreshold: number; // số lần no-show liên tiếp → blacklist
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  status?: 'Active' | 'Inactive';
}
