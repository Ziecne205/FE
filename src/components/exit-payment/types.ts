import type { PaymentMethod } from '@/types/model'

export type { PaymentMethod }

export interface FeeBreakdownLine {
  label: string
  hours: number
  ratePerHour: number
  subtotal: number
}

export interface ExitPaymentProps {
  readonly sessionId: string
  readonly licensePlate: string
  readonly entryTime: string
  readonly totalFee: number
}

export interface FeeBreakdownProps {
  readonly licensePlate: string
  readonly entryTime: string
  readonly totalFee: number
  readonly breakdown: FeeBreakdownLine[]
  readonly durationMinutes: number
}

export interface PaymentQrPanelProps {
  readonly sessionId: string
  readonly totalFee: number
  readonly selectedMethod: PaymentMethod
  readonly onMethodChange: (method: PaymentMethod) => void
  readonly onConfirm: () => void
  readonly isPending: boolean
}
