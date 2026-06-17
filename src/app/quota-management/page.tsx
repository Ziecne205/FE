'use client'

import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { QuotaManagement } from '@/components/quota-management'

export default function QuotaManagementPage() {
  return (
    <ProtectedLayout>
      <QuotaManagement />
    </ProtectedLayout>
  )
}
