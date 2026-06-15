'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { CrashDeficit } from '@/hooks/useSlotMap'

interface CapacityCrashDialogProps {
  readonly deficits: CrashDeficit[] | null
  readonly isLocking: boolean
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

export function CapacityCrashDialog({ deficits, isLocking, onConfirm, onCancel }: CapacityCrashDialogProps) {
  return (
    <Dialog open={!!deficits} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Cảnh báo giảm sức chứa
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Việc khóa các ô đã chọn để bảo trì sẽ khiến sức chứa khả dụng bị âm đối với các loại xe sau:
        </p>

        <div className="divide-y rounded-lg border border-gray-200">
          {deficits?.map((d) => (
            <div key={d.vehicleTypeName} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm font-medium text-gray-800">{d.vehicleTypeName}</span>
              <span className="font-mono text-sm font-bold text-red-600">{d.predictedHeadroom} chỗ</span>
            </div>
          ))}
        </div>

        <p className="text-xs italic text-gray-500">
          Hệ thống sẽ phải từ chối 100% khách vãng lai nếu tiếp tục. Các booking bị ảnh hưởng cần được hoàn cọc.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isLocking}>
            Hủy
          </Button>
          <Button
            className="bg-amber-500 text-white hover:bg-amber-600"
            onClick={onConfirm}
            disabled={isLocking}
          >
            {isLocking ? 'Đang khóa...' : 'Tiếp tục'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
