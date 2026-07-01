'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { Reservation } from '@/types/model'

interface CancelReservationDialogProps {
  readonly reservation: Reservation | null
  readonly isCancelling: boolean
  readonly onConfirm: () => void
  readonly onClose: () => void
}

export function CancelReservationDialog({
  reservation,
  isCancelling,
  onConfirm,
  onClose,
}: CancelReservationDialogProps) {
  return (
    <Dialog open={!!reservation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Hủy đặt chỗ
          </DialogTitle>
        </DialogHeader>

        {reservation && (
          <p className="text-sm text-gray-600">
            Hủy đặt chỗ <span className="font-mono font-medium">{reservation.licensePlate}</span> (
            {reservation.vehicleTypeName}). Theo chính sách, tiền cọc{' '}
            <span className="font-semibold text-gray-800">{formatCurrency(reservation.depositAmount)}</span> sẽ bị
            mất.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isCancelling}>
            Giữ lại
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isCancelling}>
            {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
