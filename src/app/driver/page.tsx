'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Car, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store'
import { roleHome } from '@/lib/roles'
import { Button } from '@/components/ui/button'

/**
 * Driver area landing — a standalone shell (NOT the staff/manager console DashboardLayout).
 * Placeholder until the driver tranche (auth / book / my-bookings / profile) is built.
 */
export default function DriverHome() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/driver/auth')
    } else if (user.role !== 'Driver') {
      router.replace(roleHome[user.role])
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user || user.role !== 'Driver') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
      </div>
    )
  }

  const placeholderNav = ['Đặt chỗ', 'Đặt chỗ của tôi', 'Tìm xe của tôi', 'Hồ sơ']

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">ParkFlow — Tài xế</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user.full_name}</span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              logout()
              router.replace('/login')
            }}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Chào {user.full_name}</h1>
        <p className="mt-1 text-sm text-gray-600">
          Khu vực dành cho tài xế. Các chức năng đang được phát triển.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {placeholderNav.map((label) => (
            <div
              key={label}
              className="cursor-not-allowed rounded-xl border border-dashed border-gray-300 bg-white p-5 text-center text-sm font-medium text-gray-400"
            >
              {label}
              <div className="mt-1 text-xs">Sắp ra mắt</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
