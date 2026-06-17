import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { MOCK_CAPACITY, MOCK_VEHICLE_TYPE_NAMES } from './mockData'
import type { QuotaFormDialogProps } from './types'

export function QuotaFormDialog({
  open,
  initialValues,
  lotId,
  onClose,
  onSubmit,
  isSubmitting,
}: QuotaFormDialogProps) {
  const [vehicleTypeId, setVehicleTypeId] = useState('vt-car')
  const [windowStart, setWindowStart] = useState('08:00')
  const [windowEnd, setWindowEnd] = useState('10:00')
  const [quotaPercent, setQuotaPercent] = useState(30)

  // Reset form when dialog opens or initialValues change
  useEffect(() => {
    if (open) {
      setVehicleTypeId(initialValues?.vehicleTypeId ?? 'vt-car')
      setWindowStart(initialValues?.windowStart ?? '08:00')
      setWindowEnd(initialValues?.windowEnd ?? '10:00')
      setQuotaPercent(initialValues?.quotaPercent ?? 30)
    }
  }, [open, initialValues])

  const capacity = MOCK_CAPACITY[vehicleTypeId] ?? 50
  const quotaAbs = Math.ceil((quotaPercent / 100) * capacity)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      quotaId: initialValues?.quotaId,
      parkingLotId: lotId,
      vehicleTypeId,
      windowStart,
      windowEnd,
      quotaPercent,
    })
  }

  const isEdit = !!initialValues?.quotaId

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? 'Sửa hạn mức đặt chỗ' : 'Thêm hạn mức đặt chỗ'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Vehicle type */}
          <div className="space-y-1">
            <Label className="text-sm">Loại xe</Label>
            <Select value={vehicleTypeId} onValueChange={setVehicleTypeId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOCK_VEHICLE_TYPE_NAMES).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time window */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Giờ bắt đầu</Label>
              <Input
                type="time"
                className="h-9 text-sm"
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Giờ kết thúc</Label>
              <Input
                type="time"
                className="h-9 text-sm"
                value={windowEnd}
                onChange={(e) => setWindowEnd(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Percent slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">% sức chứa</Label>
              <span className="text-sm font-semibold text-blue-600">{quotaPercent}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[quotaPercent]}
              onValueChange={([v]) => setQuotaPercent(v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Tương đương{' '}
            <span className="font-semibold">{quotaAbs} suất</span>
            {' '}trên tổng{' '}
            <span className="font-semibold">{capacity} suất</span>{' '}
            ({MOCK_VEHICLE_TYPE_NAMES[vehicleTypeId] ?? vehicleTypeId})
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
