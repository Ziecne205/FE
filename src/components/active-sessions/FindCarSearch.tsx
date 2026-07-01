'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SESSION_STATUS_LABELS } from '@/lib/constants'
import { formatDateTime, formatDuration } from '@/lib/utils'
import { useFindCar } from '@/hooks/useSessions'
import { useNow } from '@/hooks/useNow'

const STATUS_COLORS: Record<string, string> = {
  Admitted: 'bg-amber-100 text-amber-800',
  Parked: 'bg-green-100 text-green-800',
  Moved: 'bg-orange-100 text-orange-800',
  Completed: 'bg-gray-100 text-gray-700',
  Abandoned: 'bg-red-100 text-red-800',
}

export function FindCarSearch() {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data: result } = useFindCar(submitted)
  const now = useNow()

  const handleSearch = () => setSubmitted(input.trim())
  const handleClear = () => {
    setInput('')
    setSubmitted('')
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-gray-700">Tìm xe theo biển số</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Nhập biển số (vd: 51A-12345)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9 font-mono text-sm"
          />
        </div>
        <Button onClick={handleSearch} size="sm">
          Tìm
        </Button>
        {submitted && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {submitted && (
        <div className="mt-3">
          {result ? (
            <div className="rounded-md border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-gray-900">
                  {result.licensePlate}
                </span>
                <Badge
                  className={`text-xs font-normal ${STATUS_COLORS[result.status] ?? ''}`}
                  variant="outline"
                >
                  {SESSION_STATUS_LABELS[result.status] ?? result.status}
                </Badge>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-500">
                {result.actualSlotCode && (
                  <span>Ô thực tế: <span className="font-mono text-gray-700">{result.actualSlotCode}</span></span>
                )}
                {result.assignedSlotCode && !result.actualSlotCode && (
                  <span>Ô gợi ý: <span className="font-mono text-gray-700">{result.assignedSlotCode}</span></span>
                )}
                <span>Vào lúc: {formatDateTime(result.entryTime)}</span>
                {result.parkedTime && now !== null && (
                  <span>Đỗ: {formatDuration(Math.floor((now - new Date(result.parkedTime).getTime()) / 60000))}</span>
                )}
                {result.vehicleTypeName && (
                  <span>Loại xe: {result.vehicleTypeName}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Không tìm thấy xe với biển số &quot;{submitted}&quot;.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
