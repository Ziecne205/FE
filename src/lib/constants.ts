// Design system constants based on 00-design-system.md

export const COLORS = {
  primary: {
    blue: '#3B82F6',
    darkBlue: '#1E40AF',
  },
  status: {
    available: '#10B981',
    occupied: '#EF4444',
    reserved: '#F59E0B',
    maintenance: '#6B7280',
  },
  neutral: {
    background: '#F9FAFB',
    cardBackground: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

export const PRICING = {
  BASE_RATE: 10000, // VND per hour
} as const;

export const SLOT_STATUS_LABELS: Record<string, string> = {
  Available: 'Trống',
  Occupied: 'Đã đỗ',
  Reserved: 'Đã đặt',
  Maintenance: 'Bảo trì',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
};

export const EXCEPTION_TYPE_LABELS: Record<string, string> = {
  WrongSlot: 'Đỗ sai vị trí',
  AIFailure: 'Lỗi AI Camera',
  PaymentFailure: 'Lỗi thanh toán',
  Overtime: 'Quá giờ',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  Cash: 'Tiền mặt',
  VNPay: 'VNPay',
  QR: 'Mã QR',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  Manager: 'Quản lý',
  Staff: 'Nhân viên',
  Driver: 'Tài xế',
  Admin: 'Quản trị viên',
};

export const REFRESH_INTERVAL = 10000; // 10 seconds for real-time updates

// ── Capacity-Reservation model labels (canonical; pair with @/types/model) ───────

export const SLOT_STATUS_LABELS_V2: Record<string, string> = {
  Available: 'Trống',
  Occupied: 'Đã có xe',
  Maintenance: 'Bảo trì',
};

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ cọc',
  Confirmed: 'Đã xác nhận',
  CheckedIn: 'Đã vào',
  Fulfilled: 'Đã đỗ',
  Cancelled: 'Đã hủy',
  Expired: 'Hết hạn',
};

export const SESSION_STATUS_LABELS: Record<string, string> = {
  Admitted: 'Đã vào (chờ đỗ)',
  Parked: 'Đã đỗ',
  Moved: 'Đang rời ô',
  Completed: 'Hoàn thành',
  Abandoned: 'Bỏ dở',
};

export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  UNMAPPED_OCCUPANCY: 'Xe lậu (không khớp phiên)',
  ABANDONED_SESSION: 'Phiên bỏ dở',
  EXIT_UNCLOSED: 'Cổng ra chưa đóng',
  OVERSTAY: 'Quá giờ',
  MANUAL_OVERRIDE: 'Cho vào thủ công (audit)',
  OTHER: 'Khác',
};

export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  Open: 'Chưa xử lý',
  InProgress: 'Đang xử lý',
  Resolved: 'Đã xử lý',
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  Deposit: 'Tiền cọc',
  Parking: 'Phí gửi xe',
  Penalty: 'Phạt',
};

export const PAYMENT_METHOD_LABELS_V2: Record<string, string> = {
  Cash: 'Tiền mặt',
  QR: 'Mã QR',
  WindshieldQR: 'QR dán kính',
};

// Per-lot time parameters (defaults — Business-Flow-v2 §8.3). Real values come from
// GET /api/admin/lots/{id}/config once Admin config lands.
export const TIME_PARAMS_DEFAULT = {
  earlyGraceMinutes: 15,
  lateGraceMinutes: 30,
  ttlAdmittedMinutes: 15,
  ttlMovedMinutes: 30,
  softHoldMinutes: 3,
} as const;
