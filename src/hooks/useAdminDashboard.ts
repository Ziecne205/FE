import type { AdminDashboard } from '@/components/admin/system-overview/types';
import { mockDashboard } from '@/components/admin/system-overview/mockData';

export interface UseAdminDashboardReturn {
  data: AdminDashboard;
  isLoading: boolean;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  // TODO(opus): GET /api/admin/dashboard
  return {
    data: mockDashboard,
    isLoading: false,
  };
}
