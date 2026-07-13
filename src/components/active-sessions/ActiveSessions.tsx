'use client'

import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { SessionStatsBar } from './SessionStatsBar'
import { SessionTable } from './SessionTable'
import { useOpenSessions } from '@/hooks/useSessions'
import { SESSION_STATUS_LABELS } from '@/lib/constants'
import type { SessionStatusFilter } from './types'

export function ActiveSessions() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SessionStatusFilter>('all')

  const { data: sessions, isLoading } = useOpenSessions()

  const filtered = useMemo(
    () =>
      sessions.filter((s) => {
        const matchStatus = statusFilter === 'all' || s.status === statusFilter
        const matchSearch =
          !search ||
          s.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
          (s.assignedSlotCode ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (s.actualSlotCode ?? '').toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
      }),
    [sessions, search, statusFilter],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Phiên hoạt động</h2>
          <p className="text-sm text-gray-600">Danh sách phiên gửi xe đang mở theo thời gian thực</p>
        </div>
      </div>

      <SessionStatsBar sessions={sessions} />

      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:flex-row">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm theo biển số hoặc ô đỗ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as SessionStatusFilter)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(SESSION_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-500">Đang tải phiên...</div>
      ) : (
        <SessionTable sessions={filtered} />
      )}
    </div>
  )
}
