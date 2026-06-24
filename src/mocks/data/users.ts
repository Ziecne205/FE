// Single source of truth for mock accounts (all 4 roles).
// Used by BOTH /api/auth/login and /api/users/:id so a logged-in user's id always
// resolves to the same profile. Password is the same for every demo account.

export type MockRole = 'Admin' | 'Manager' | 'Staff' | 'Driver'

export interface MockAccount {
  id: string
  email: string
  password: string
  phone: string
  fullName: string
  role: MockRole
  parkingLotId?: string // Manager/Staff are scoped to a lot
}

export const DEMO_PASSWORD = '123456'

export const MOCK_USERS: MockAccount[] = [
  { id: 'u-admin', email: 'admin@parking.vn', password: DEMO_PASSWORD, phone: '0900000001', fullName: 'Quản trị viên', role: 'Admin' },
  { id: 'u-manager', email: 'manager@parking.vn', password: DEMO_PASSWORD, phone: '0900000002', fullName: 'Nguyễn Văn A', role: 'Manager', parkingLotId: 'lot-1' },
  { id: 'u-staff', email: 'staff@parking.vn', password: DEMO_PASSWORD, phone: '0900000003', fullName: 'Trần Thị B', role: 'Staff', parkingLotId: 'lot-1' },
  { id: 'u-driver', email: 'driver@parking.vn', password: DEMO_PASSWORD, phone: '0901234567', fullName: 'Lê Văn Tài', role: 'Driver' },
]

export function findAccountByEmail(email: string): MockAccount | undefined {
  const e = email.trim().toLowerCase()
  return MOCK_USERS.find((u) => u.email.toLowerCase() === e)
}

/** Fallback when an unknown email is used — derive role by keyword, resolve to that role's seed account. */
export function accountForUnknownEmail(email: string): MockAccount {
  const e = email.toLowerCase()
  const role: MockRole = e.includes('admin')
    ? 'Admin'
    : e.includes('manager')
    ? 'Manager'
    : e.includes('driver')
    ? 'Driver'
    : 'Staff'
  return MOCK_USERS.find((u) => u.role === role)!
}
