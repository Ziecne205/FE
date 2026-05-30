// Core entity types based on SPEC.md

export type SlotStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
export type VehicleType = 'car';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type SessionStatus = 'Active' | 'Completed';
export type PaymentMethod = 'Cash' | 'VNPay' | 'QR';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';
export type ExceptionType = 'WrongSlot' | 'AIFailure' | 'PaymentFailure' | 'Overtime';
export type ExceptionStatus = 'Open' | 'Resolved';
export type UserRole = 'Manager' | 'Staff' | 'Driver' | 'Admin';

export interface Facility {
  id: string;
  name: string;
  address: string;
  total_floors: number;
  total_zones: number;
  total_slots: number;
  operating_hours: string;
}

export interface Floor {
  id: string;
  facility_id: string;
  floor_number: number;
  zone_count: number;
}

export interface Zone {
  id: string;
  floor_id: string;
  zone_letter: string;
  slot_count: number;
}

export interface Slot {
  id: string;
  zone_id: string;
  slot_number: number;
  slot_name: string; // Format: F{floor}-{zone}-{number}
  status: SlotStatus;
}

export interface Vehicle {
  id: string;
  user_id: string;
  license_plate: string;
  vehicle_type: VehicleType;
}

export interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string;
  slot_id: string;
  booking_start_time: string;
  booking_end_time: string;
  duration_hours: number;
  status: BookingStatus;
  created_at: string;
}

export interface ParkingSession {
  id: string;
  booking_id?: string; // nullable for walk-ins
  vehicle_id: string;
  slot_id: string;
  license_plate: string;
  entry_time: string;
  exit_time?: string;
  duration_minutes?: number;
  status: SessionStatus;
}

export interface Payment {
  id: string;
  session_id?: string;
  booking_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  paid_at?: string;
}

export interface Exception {
  id: string;
  session_id: string;
  exception_type: ExceptionType;
  description: string;
  resolved_by?: string; // staff/manager user_id
  resolved_at?: string;
  status: ExceptionStatus;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  facility_id?: string; // for Manager/Staff
}

// UI-specific types

export interface OccupancyStats {
  total_slots: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  occupancy_rate: number;
  current_revenue: number;
}

export interface ActiveSessionWithDetails extends ParkingSession {
  slot_name: string;
  estimated_price: number;
  current_duration_minutes: number;
}

export interface BookingWithDetails extends Booking {
  slot_name: string;
  vehicle_license_plate: string;
  user_name: string;
}

export interface ExceptionWithDetails extends Exception {
  session_license_plate: string;
  slot_name: string;
  created_at: string;
}

export interface ReportData {
  date: string;
  revenue: number;
  sessions: number;
  occupancy_rate: number;
  peak_hour?: string;
}
