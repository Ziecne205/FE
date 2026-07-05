'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store'
import { DashboardLayout as BaseDashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { canAccess, roleHome } from '@/lib/roles'

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
  '/quota': 'Hạn mức đặt chỗ',
  '/pricing': 'Quản lý giá',
  '/reports': 'Báo cáo',
  '/exit-payment': 'Thanh toán cổng ra',
  '/simulator': 'Mô phỏng Cổng & Camera',
  '/admin/overview': 'Trung tâm Giám sát',
  '/admin/users': 'Quản lý tài khoản',
  '/admin/rbac': 'Phân quyền',
  '/admin/system-config': 'Cấu hình hệ thống',
  '/admin/audit-logs': 'Nhật ký hệ thống',
  '/help': 'Trợ giúp',
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  const allowed = !!user && canAccess(user.role, pathname)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (user && !canAccess(user.role, pathname)) {
      // Authenticated but wrong role for this route → send to the role's home.
      router.replace(roleHome[user.role])
    }
  }, [isAuthenticated, user, pathname, router])

  // Show loading while checking auth, if not authenticated, or while redirecting a disallowed role.
  if (!isAuthenticated || !user || !allowed) {
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
