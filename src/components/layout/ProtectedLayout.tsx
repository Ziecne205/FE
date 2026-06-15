'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store'
import { DashboardLayout as BaseDashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface ProtectedLayoutProps {
  children: ReactNode
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/capacity': 'Bảng điều khiển Sức chứa',
  '/slots': 'Sơ đồ chỗ đỗ',
  '/sessions': 'Phiên đỗ xe',
  '/bookings': 'Quản lý đặt chỗ',
  '/incidents': 'Sự cố',
  '/exceptions': 'Xử lý ngoại lệ',
  '/reports': 'Báo cáo',
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Show loading while checking auth or if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <h1 className="mt-4 text-xl font-semibold text-gray-700">Đang tải...</h1>
        </div>
      </div>
    )
  }

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/dashboard' },
    { label: routeTitles[pathname] || 'Trang' },
  ]

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <ErrorBoundary>
      <BaseDashboardLayout
        user={user}
        breadcrumbs={breadcrumbs}
        lastUpdate={new Date()}
        onLogout={handleLogout}
      >
        {children}
      </BaseDashboardLayout>
    </ErrorBoundary>
  )
}
