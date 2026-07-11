'use client'

import { useState } from 'react'
import { Search, QrCode, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExitPayment } from '@/components/exit-payment'
import { useFindCar } from '@/hooks/useSessions'
import { useSessionPayosLink } from '@/hooks/useSessionPayosLink'
import { formatCurrency } from '@/lib/utils'

/**
 * Trang Check-out (cổng ra): tìm phiên theo biển số → hiển thị phí động (BE tính theo
 * thời gian đã đỗ) → thanh toán (tiền mặt / QR PayOS động) → check-out thật + mở barie.
 * Tái sử dụng ExitPayment cho luồng phí + xác nhận; QR PayOS là link thật từ BE.
 */
export function CheckOut() {
  const [plate, setPlate] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data: session, isError, error } = useFindCar(submitted)
  const payos = useSessionPayosLink()

  function search() {
    const p = plate.trim().toUpperCase()
    if (p.length < 4) {
      toast.error('Nhập ít nhất 4 ký tự biển số')
      return
    }
    setSubmitted(p)
  }

  function generatePayosQr() {
    if (!session) return
    payos.mutate(
      { sessionId: session.sessionId },
      {
        onSuccess: (link) => {
          window.open(link.checkoutUrl, '_blank', 'noopener')
          toast.success(`Đã tạo QR PayOS ${formatCurrency(link.amount)} — khách quét để thanh toán`)
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Check-out cổng ra</h2>
        <p className="text-sm text-gray-500">Tìm phiên theo biển số, tính phí động và thu tiền.</p>
      </div>

      {/* Plate search */}
      <div className="flex flex-col items-stretch gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Nhập biển số xe ra…"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            className="pl-9 font-mono uppercase"
          />
        </div>
        <Button onClick={search} className="gap-1.5">
          <Search className="h-4 w-4" />
          Tìm phiên
        </Button>
      </div>

      {submitted && isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Lỗi khi tìm phiên: {error?.message ?? 'Vui lòng thử lại.'}
        </div>
      )}

      {submitted && !isError && !session && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Không tìm thấy phiên đang mở cho biển số <span className="font-mono font-semibold">{submitted}</span>.
        </div>
      )}

      {session && (
        <div className="space-y-4">
          {/* Real dynamic PayOS QR action */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <QrCode className="h-4 w-4" />
              Tạo mã QR PayOS (số tiền động theo thời gian đỗ)
            </div>
            <Button size="sm" onClick={generatePayosQr} disabled={payos.isPending} className="gap-1.5">
              {payos.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Tạo QR PayOS
            </Button>
          </div>

          <ExitPayment
            sessionId={session.sessionId}
            licensePlate={session.licensePlate}
            entryTime={session.entryTime}
            totalFee={session.totalFee ?? 0}
          />
        </div>
      )}
    </div>
  )
}
