'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import type { UpcomingReservation } from '@/hooks/useSessions'

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ thanh toán cọc',
  Confirmed: 'Đã xác nhận',
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
}

interface Props {
  readonly reservations: UpcomingReservation[]
}

/** Dat cho chua check-in — hien truoc "Phien hoat dong" hien tai de Staff biet truoc xe se den luc nao. */
export function UpcomingReservationsTable({ reservations }: Props) {
  if (reservations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-10 text-center text-sm text-gray-500 shadow-sm">
        Không có đặt chỗ nào sắp tới
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-mono text-xs uppercase tracking-wide text-gray-500">
              Biển số
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wide text-gray-500">
              Loại xe
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wide text-gray-500">
              Trạng thái
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wide text-gray-500">
              Giờ vào dự kiến
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wide text-gray-500">
              Giờ ra dự kiến
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wide text-gray-500">
              Phí dự kiến
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((r, i) => (
            <TableRow key={r.reservationId} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
              <TableCell className="font-mono font-medium text-gray-900">{r.licensePlate}</TableCell>
              <TableCell className="text-sm text-gray-600">{r.vehicleTypeName ?? '—'}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs font-normal ${STATUS_COLORS[r.status] ?? ''}`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">{formatDateTime(r.expectedEntryTime)}</TableCell>
              <TableCell className="text-sm text-gray-600">{formatDateTime(r.expectedExitTime)}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {r.estimatedFeeAtBooking != null ? formatCurrency(r.estimatedFeeAtBooking) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
        Hiển thị {reservations.length} đặt chỗ
      </div>
    </div>
  )
}
