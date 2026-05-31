// Request body types for MSW handlers
export interface UpdateSlotRequest {
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance'
}

export interface CreateSessionRequest {
  license_plate: string
  slot_id: string
  vehicle_type: 'car'
}

export interface CreateBookingRequest {
  customer_name: string
  customer_phone: string
  customer_email: string
  license_plate: string
  slot_id: string
  booking_start: string
  booking_end: string
}

export interface UpdateBookingRequest {
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
}

export interface ResolveExceptionRequest {
  resolved_by: string
  resolution_notes: string
}

export interface LoginRequest {
  email: string
  password: string
}
