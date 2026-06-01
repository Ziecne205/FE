'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { ExceptionHandling } from '@/components/exceptions/ExceptionHandling'
import { ResolveExceptionModal } from '@/components/exceptions/ResolveExceptionModal'
import { useAuthStore } from '@/store'
import { useExceptions, useSessions, useSlots, useResolveException } from '@/hooks'
import type { ExceptionWithDetails } from '@/types'

export default function ExceptionsPage() {
  const { user } = useAuthStore()
  const { data: exceptions, refetch, isLoading: exceptionsLoading } = useExceptions()
  const { data: sessions, isLoading: sessionsLoading } = useSessions()
  const { data: slots, isLoading: slotsLoading } = useSlots()
  const resolveException = useResolveException()
  const [selectedException, setSelectedException] = useState<ExceptionWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (exceptionsLoading || sessionsLoading || slotsLoading || !exceptions || !sessions || !slots || !user) {
    return (
      <ProtectedLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  // Enrich exceptions with session and slot details
  const exceptionsWithDetails: ExceptionWithDetails[] = exceptions.map((exception) => {
    const session = sessions.find((s) => s.id === exception.session_id)
    const slot = slots.find((s) => s.id === session?.slot_id)
    return {
      ...exception,
      session_license_plate: session?.license_plate || 'N/A',
      slot_name: slot?.slot_name || 'N/A',
      created_at: new Date().toISOString(), // Mock - would come from exception data
    }
  })

  const handleResolveClick = (exception: ExceptionWithDetails) => {
    setSelectedException(exception)
    setIsModalOpen(true)
  }

  const handleResolveException = async (exceptionId: string, notes: string) => {
    await resolveException.mutateAsync({
      exceptionId,
      resolvedBy: user.id,
      notes,
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedException(null)
  }

  return (
    <ProtectedLayout>
      <ExceptionHandling
        exceptions={exceptionsWithDetails}
        userRole={user.role as 'Manager' | 'Staff'}
        onRefresh={() => refetch()}
        onResolveException={handleResolveClick}
      />

      <ResolveExceptionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        exception={selectedException}
        onSubmit={handleResolveException}
      />
    </ProtectedLayout>
  )
}
