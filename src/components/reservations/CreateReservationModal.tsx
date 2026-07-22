'use client'

import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { useVehicleTypes } from '@/hooks/useAvailability'
import { useCreateReservation, useReservationQuote } from '@/hooks/useReservations'
import type { AppError } from '@/lib/api'
import type { VehicleType } from '@/types/model'

interface CreateReservationModalProps {
  readonly open: boolean
  readonly userId?: string
  readonly canOverride: boolean
  readonly onClose: () => void
}

interface ModalBodyProps {
  readonly userId?: string
  readonly canOverride: boolean
  readonly onClose: () => void
  readonly vehicleTypes: VehicleType[]
}

/** Nội dung modal — mount lại (state mới) mỗi lần dialog mở, nhờ được render có điều kiện ở cha. */
function ModalBody({ userId, canOverride, onClose, vehicleTypes }: ModalBodyProps) {
  const create = useCreateReservation()

  const [licensePlate, setLicensePlate] = useState('')
  const [vehicleTypeId, setVehicleTypeId] = useState(vehicleTypes[0]?.id ?? '')
  const [entry, setEntry] = useState('')
  const [exit, setExit] = useState('')
  const [quotaLocked, setQuotaLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ước tính phí + cọc động — deposit giờ tính trên phí cả khung giờ (không phải basePrice), luôn
  // hỏi BE thay vì tự tính ở FE để khớp công thức mới nhất.
  const quote = useReservationQuote(vehicleTypeId, entry, exit)

  const submit = async (override: boolean) => {
    setError(null)
    if (!licensePlate || !vehicleTypeId || !entry || !exit) {
      setError('Vui lòng nhập đủ thông tin.')
      return
    }
    if (new Date(exit) <= new Date(entry)) {
      setError('Giờ ra phải sau giờ vào.')
      return
    }
    try {
      const res = await create.mutateAsync({
        vehicleTypeId,
        licensePlate,
        expectedEntryTime: entry,
        expectedExitTime: exit,
        userId,
        override,
      })
      toast.success(`Đã tạo đặt chỗ — cọc ${formatCurrency(res.depositAmount)}`)
      onClose()
    } catch (e) {
      const err = e as AppError
      if (err.code === 'QUOTA_FULL') {
        setQuotaLocked(true)
      } else {
        setError(err.message)
      }
    }
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Tạo đặt chỗ mới</DialogTitle>
        <DialogDescription>Giữ một suất chỗ theo khung giờ — không gán ô cụ thể.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="plate">Biển số xe</Label>
          <Input
            id="plate"
            placeholder="51B-99999"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          />
        </div>

        <div className="space-y-2">
          <Label>Loại xe</Label>
          <Select value={vehicleTypeId} onValueChange={setVehicleTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại xe" />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="entry">Giờ vào dự kiến</Label>
            <Input id="entry" type="datetime-local" value={entry} onChange={(e) => setEntry(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exit">Giờ ra dự kiến</Label>
            <Input id="exit" type="datetime-local" value={exit} onChange={(e) => setExit(e.target.value)} />
          </div>
        </div>

        {quote.data && !quotaLocked && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            Phí ước tính <span className="font-semibold">{formatCurrency(quote.data.estimatedFee)}</span> · Cọc
            cần thu <span className="font-semibold text-blue-700">{formatCurrency(quote.data.depositAmount)}</span>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {quotaLocked && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Khung giờ đã khóa đặt chỗ (đạt hạn mức quota)</span>
            </div>
            {canOverride && (
              <p className="mt-1 text-xs text-amber-700">
                Quản lý có thể vượt quyền để vẫn nhận đặt chỗ này.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose} disabled={create.isPending}>
          Hủy
        </Button>
        {quotaLocked && canOverride ? (
          <Button
            className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
            onClick={() => submit(true)}
            disabled={create.isPending}
          >
            <ShieldCheck className="h-4 w-4" />
            {create.isPending ? 'Đang tạo...' : 'Vượt quyền & đặt chỗ'}
          </Button>
        ) : (
          <Button onClick={() => submit(false)} disabled={create.isPending || quotaLocked}>
            {create.isPending ? 'Đang tạo...' : 'Tạo đặt chỗ'}
          </Button>
        )}
      </div>
    </DialogContent>
  )
}

export function CreateReservationModal({
  open,
  userId,
  canOverride,
  onClose,
}: CreateReservationModalProps) {
  const { data: vehicleTypes = [] } = useVehicleTypes()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {open && (
        <ModalBody
          key={vehicleTypes.map((v) => v.id).join(',')}
          userId={userId}
          canOverride={canOverride}
          onClose={onClose}
          vehicleTypes={vehicleTypes}
        />
      )}
    </Dialog>
  )
}
