'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateDuration } from '@/lib/utils'
import { usePayParking } from '@/hooks/usePayParking'
import { FeeBreakdown } from './FeeBreakdown'
import { PaymentQrPanel } from './PaymentQrPanel'
import { FeedbackForm } from './FeedbackForm'
import type { ExitPaymentProps, FeeBreakdownLine, PaymentMethod } from './types'

function computeBreakdown(entryTime: string, totalFee: number): FeeBreakdownLine[] {
  const entry = new Date(entryTime)
  const now = new Date()
  const totalMinutes = Math.max(0, Math.floor((now.getTime() - entry.getTime()) / 60000))
  const totalHours = Math.ceil(totalMinutes / 60)

  // Aligning with BE formula: Base + (ExtraHour × hours)
  // Since BE returns the final totalFee, we display a simplified breakdown
  // rather than re-computing the exact split which caused FE/BE drift.
  return [
    {
      label: 'Phí đỗ xe (Theo chính sách giá)',
      hours: totalHours,
      ratePerHour: 0, // Hidden in UI if 0
      subtotal: totalFee,
    },
  ]
}

export function ExitPayment({ sessionId, licensePlate, entryTime, totalFee }: ExitPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('QR')
  const [success, setSuccess] = useState(false)
  const [paidAmount, setPaidAmount] = useState(totalFee)
  const [isOverstay, setIsOverstay] = useState(false)

  const { mutate, isPending } = usePayParking()

  const durationMinutes = calculateDuration(entryTime)
  const breakdown = computeBreakdown(entryTime, totalFee)

  function handleConfirm() {
    // Check-out thật theo biển số; BE trả về số tiền đã tính để hiển thị biên nhận.
    mutate(
      { licensePlate, paymentMethod: method },
      {
        onSuccess: (res) => {
          setPaidAmount(res.amount || totalFee)
          setIsOverstay(res.isOverstay)
          setSuccess(true)
        },
      },
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">Đã thanh toán</p>
          <p className="mt-1 font-mono text-lg font-semibold text-gray-600">{licensePlate}</p>
          <p className="mt-1 text-sm text-gray-500">
            {formatCurrency(paidAmount)} · Mời xe qua khỏi barie
          </p>
        </div>
        {isOverstay && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 max-w-sm text-left">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Quá hạn ưu đãi (Overstay)</p>
              <p className="text-xs text-amber-700 mt-1">
                Phiên đỗ xe đã quá 24h grace period. Phụ phí 1 giờ (Extra Hour) đã được cộng vào tổng tiền.
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Barie đang mở
        </div>
        <FeedbackForm sessionId={sessionId} />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Thanh toán cổng ra</h2>
        <p className="text-sm text-gray-500">Cổng Ra · Làn A</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FeeBreakdown
          licensePlate={licensePlate}
          entryTime={entryTime}
          totalFee={totalFee}
          breakdown={breakdown}
          durationMinutes={durationMinutes}
        />

        <PaymentQrPanel
          sessionId={sessionId}
          totalFee={totalFee}
          selectedMethod={method}
          onMethodChange={setMethod}
          onConfirm={handleConfirm}
          isPending={isPending}
        />
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <AlertTriangle className="h-4 w-4" />
          Báo lỗi nhận diện
        </Button>
      </div>
    </div>
  )
}
