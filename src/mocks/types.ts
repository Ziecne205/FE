// Request body types for MSW handlers
export interface UpdateSlotRequest {
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance'
}

export interface CreateSessionRequest {
  license_plate: string
  slot_id: string
  vehicle_type: 'car'
}

export interface LoginRequest {
  email: string
  password: string
}
