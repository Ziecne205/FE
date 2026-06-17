'use client'

import { useMemo, useState } from 'react'
import { Search, RefreshCw, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReservationStatsBar } from './ReservationStatsBar'
import { ReservationTable } from './ReservationTable'
import { CreateReservationModal } from './CreateReservationModal'
import { CancelReservationDialog } from './CancelReservationDialog'
import { useReservations, useCancelReservation } from '@/hooks/useReservations'
import { useParkingLots } from '@/hooks/useAvailability'
import { useAuthStore } from '@/store'
import { RESERVATION_STATUS_LABELS } from '@/lib/constants'
import type { Reservation, ReservationStatus } from '@/types/model'

export function Reservations() {
  const { user } = useAuthStore()
  const isManager = user?.role === 'Manager'
  const { data: lots } = useParkingLots()
  const lotId = lots?.[0]?.id

  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [cancelling, setCancelling] = useState<Reservation | null>(null)

  const { data: reservations = [], isLoading, refetch } = useReservations({ lotId })
  const cancelReservation = useCancelReservation()

  const filtered = useMemo(
    () =>
      reservations.filter((r) => {
        const matchStatus = statusFilter === 'all' || r.status === statusFilter
        const matchSearch =
          !search || r.licensePlate.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
      }),
    [reservations, statusFilter, search],
  )

  const handleCancel = () => {
    if (!cancelling) return
    cancelReservation.mutate(cancelling.reservationId, { onSuccess: () => setCancelling(null) })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Đặt chỗ</h2>
          <p className="text-sm text-gray-600">Giữ suất chỗ theo khung giờ (không gán ô)</p>
        </div>
        {isManager && (
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Tạo đặt chỗ
          </Button>
        )}
      </div>

      <ReservationStatsBar reservations={reservations} />

      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:flex-row">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm theo biển số..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReservationStatus | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(RESERVATION_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Làm mới">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-gray-500">Đang tải đặt chỗ...</div>
      ) : (
        <ReservationTable reservations={filtered} onCancel={setCancelling} />
      )}

      <CreateReservationModal
        open={createOpen}
        parkingLotId={lotId}
        userId={user?.id}
        canOverride={isManager}
        onClose={() => setCreateOpen(false)}
      />
      <CancelReservationDialog
        reservation={cancelling}
        isCancelling={cancelReservation.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelling(null)}
      />
    </div>
  )
}
