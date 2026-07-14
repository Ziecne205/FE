import type { UserRole } from '@/types/model'

/**
 * Role-based routing config (one app, four roles).
 * - `roleHome`: where each role lands after login / from `/`.
 * - `canAccess`: per-route-prefix guard. Admin is a superset (allowed everywhere).
 */
export const roleHome: Record<UserRole, string> = {
  Admin: '/admin/overview',
  Manager: '/dashboard',
  Staff: '/dashboard',
  // App này chỉ cho nội bộ — Driver dùng app parking-driver riêng; nếu lỡ đăng nhập ở đây thì về login.
  Driver: '/login',
}

// Route prefix → roles allowed (Admin is handled separately, allowed everywhere).
const ROUTE_ROLES: ReadonlyArray<{ prefix: string; roles: UserRole[] }> = [
  { prefix: '/admin', roles: ['Admin'] },
  // Manager-only analytics / operations
  { prefix: '/capacity', roles: ['Manager'] },
  { prefix: '/quota', roles: ['Manager'] },
  { prefix: '/pricing', roles: ['Manager'] },
  { prefix: '/reports', roles: ['Manager'] },
  { prefix: '/bookings', roles: ['Manager'] },
  // Tạo tài khoản nội bộ (Manager tạo Manager/Staff). Admin là superset -> tự động vào được.
  { prefix: '/accounts', roles: ['Manager'] },
  // Staff-only operations
  { prefix: '/check-in', roles: ['Staff'] },
  { prefix: '/check-out', roles: ['Staff'] },
  // Legacy routes (nay gộp vào /check-in + /check-out) — vẫn cho truy cập trực tiếp.
  { prefix: '/simulator', roles: ['Staff'] },
  { prefix: '/exit-payment', roles: ['Staff'] },
  // Shared console (Manager + Staff)
  { prefix: '/dashboard', roles: ['Manager', 'Staff'] },
  { prefix: '/slots', roles: ['Manager', 'Staff'] },
  { prefix: '/sessions', roles: ['Manager', 'Staff'] },
  { prefix: '/incidents', roles: ['Manager', 'Staff'] },
]

/** Whether `role` may view `pathname`. Unguarded paths (e.g. /help) are open to any authed user. */
export function canAccess(role: UserRole, pathname: string): boolean {
  if (role === 'Admin') return true
  const match = ROUTE_ROLES.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'),
  )
  return match ? match.roles.includes(role) : true
}
