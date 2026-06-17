'use client'

import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, getStatusColor, formatDateTime, formatCurrency } from '@/lib/utils'
import { RESERVATION_STATUS_LABELS } from '@/lib/constants'
import type { Reservation } from '@/types/model'

interface ReservationTableProps {
  readonly reservations: Reservation[]
  readonly onCancel: (reservation: Reservation) => void
}

const CANCELLABLE = new Set(['Pending', 'Confirmed'])

export function ReservationTable({ reservations, onCancel }: ReservationTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Biển số</TableHead>
              <TableHead>Loại xe</TableHead>
              <TableHead>Khung giờ</TableHead>
              <TableHead className="text-right">Cọc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                  Không có đặt chỗ nào
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((r) => (
                <TableRow key={r.reservationId} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm text-blue-600">
                    {r.reservationId.slice(0, 10)}
                  </TableCell>
                  <TableCell className="font-bold">{r.licensePlate}</TableCell>
                  <TableCell>{r.vehicleTypeName}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(r.expectedEntryTime)} → {formatDateTime(r.expectedExitTime)}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(r.depositAmount)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
                        getStatusColor(r.status),
                      )}
                    >
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {CANCELLABLE.has(r.status) && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => onCancel(r)}>
                        <XCircle className="h-3 w-3" />
                        Hủy
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
