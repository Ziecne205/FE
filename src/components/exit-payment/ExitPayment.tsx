'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateDuration } from '@/lib/utils'
import { usePayParking } from '@/hooks/usePayParking'
import { FeeBreakdown } from './FeeBreakdown'
import { PaymentQrPanel } from './PaymentQrPanel'
import type { ExitPaymentProps, FeeBreakdownLine, PaymentMethod } from './types'

const DAY_RATE = 10000   // VND/h  06:00–18:00
const NIGHT_RATE = 15000 // VND/h  18:00–06:00
const SURCHARGE = 5000

function computeBreakdown(entryTime: string): FeeBreakdownLine[] {
  const entry = new Date(entryTime)
  const now = new Date()
  const totalMinutes = Math.max(0, Math.floor((now.getTime() - entry.getTime()) / 60000))
  const totalHours = Math.ceil(totalMinutes / 60)

  // Simple split: hours within 06-18 are day rate, rest night
  let dayHours = 0
  let nightHours = 0
  for (let i = 0; i < totalHours; i++) {
    const h = new Date(entry.getTime() + i * 3600000).getHours()
    if (h >= 6 && h < 18) dayHours++
    else nightHours++
  }

  const lines: FeeBreakdownLine[] = []
  if (dayHours > 0) {
    lines.push({ label: 'Ban ngày (06:00–18:00)', hours: dayHours, ratePerHour: DAY_RATE, subtotal: dayHours * DAY_RATE })
  }
  if (nightHours > 0) {
    lines.push({ label: 'Ban đêm (18:00–06:00)', hours: nightHours, ratePerHour: NIGHT_RATE, subtotal: nightHours * NIGHT_RATE })
  }
  if (lines.length > 0) {
    lines.push({ label: 'Phụ phí/Làm tròn', hours: 0, ratePerHour: 0, subtotal: SURCHARGE })
  }
  return lines
}

export function ExitPayment({ sessionId, licensePlate, entryTime, totalFee }: ExitPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('QR')
  const [success, setSuccess] = useState(false)
  const [paidAmount, setPaidAmount] = useState(totalFee)

  const { mutate, isPending } = usePayParking()

  const durationMinutes = calculateDuration(entryTime)
  const breakdown = computeBreakdown(entryTime)

  function handleConfirm() {
    // Check-out thật theo biển số; BE trả về số tiền đã tính để hiển thị biên nhận.
    mutate(
      { licensePlate, paymentMethod: method },
      {
        onSuccess: (res) => {
          setPaidAmount(res.amount || totalFee)
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
        <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Barie đang mở
        </div>
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
