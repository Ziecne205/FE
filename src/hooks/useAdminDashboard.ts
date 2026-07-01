import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AdminDashboard } from '@/components/admin/system-overview/types'
import { mockDashboard } from '@/components/admin/system-overview/mockData'

export interface UseAdminDashboardReturn {
  data: AdminDashboard
  isLoading: boolean
}

/** Tổng quan hệ thống cho Admin — GET /api/admin/dashboard (floors + totals + usageCurve). */
export function useAdminDashboard(): UseAdminDashboardReturn {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<AdminDashboard>('/admin/dashboard'),
  })
  // Giữ mock làm fallback khi đang tải để UI không vỡ (shape khớp).
  return { data: data ?? mockDashboard, isLoading }
}
