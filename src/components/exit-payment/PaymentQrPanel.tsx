'use client'

import { Banknote, QrCode, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { PaymentMethod } from '@/types/model'
import type { PaymentQrPanelProps } from './types'

const METHODS: { value: PaymentMethod; icon: React.ReactNode; label: string }[] = [
  { value: 'Cash', icon: <Banknote className="h-4 w-4" />, label: PAYMENT_METHOD_LABELS.Cash },
  { value: 'QR', icon: <QrCode className="h-4 w-4" />, label: PAYMENT_METHOD_LABELS.QR },
]

function QrPlaceholder({ sessionId }: { sessionId: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-48 w-48"
      aria-label={`QR thanh toán phiên ${sessionId}`}
      role="img"
    >
      <rect width="200" height="200" fill="#f9fafb" rx="8" />
      {/* outer frame */}
      <rect x="10" y="10" width="60" height="60" fill="none" stroke="#111827" strokeWidth="6" rx="4" />
      <rect x="22" y="22" width="36" height="36" fill="#111827" rx="2" />
      <rect x="130" y="10" width="60" height="60" fill="none" stroke="#111827" strokeWidth="6" rx="4" />
      <rect x="142" y="22" width="36" height="36" fill="#111827" rx="2" />
      <rect x="10" y="130" width="60" height="60" fill="none" stroke="#111827" strokeWidth="6" rx="4" />
      <rect x="22" y="142" width="36" height="36" fill="#111827" rx="2" />
      {/* data dots */}
      {[80,90,100,110,120].map((x) =>
        [80,90,100,110,120].map((y) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill="#111827" rx="1" />
        ))
      )}
      {[140,155,170].map((x) =>
        [130,145,160,175].map((y) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill="#111827" rx="1" />
        ))
      )}
      {[80,95,110].map((x) =>
        [140,155,170].map((y) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill="#111827" rx="1" />
        ))
      )}
    </svg>
  )
}

export function PaymentQrPanel({
  sessionId,
  totalFee,
  selectedMethod,
  onMethodChange,
  onConfirm,
  isPending,
}: PaymentQrPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Phương thức thanh toán
        </h3>
        <div className="flex gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onMethodChange(m.value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors',
                selectedMethod === m.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedMethod !== 'Cash' && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {selectedMethod === 'QR' ? 'Quét mã để thanh toán' : 'QR dán kính'}
          </h3>
          <div className="flex flex-col items-center gap-3">
            <QrPlaceholder sessionId={sessionId} />
            <p className="text-center text-xs text-gray-500">
              Hướng camera điện thoại về phía màn hình
              <br />
              Hỗ trợ MoMo, ZaloPay, VNPAY và các app ngân hàng
            </p>
            <p className="text-xs font-medium text-gray-400">Đang chờ khách hàng quét mã...</p>
          </div>
        </div>
      )}

      {selectedMethod === 'Cash' && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Banknote className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600">
              Thu tiền mặt từ khách
            </p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalFee)}</p>
          </div>
        </div>
      )}

      <Button
        onClick={onConfirm}
        disabled={isPending}
        className="h-12 w-full gap-2 bg-blue-600 text-base font-semibold hover:bg-blue-700"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-5 w-5" />
        )}
        Xác nhận đã thanh toán — Mở barie
      </Button>
    </div>
  )
}
