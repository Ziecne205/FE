'use client'

import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, getStatusColor, formatDateTime } from '@/lib/utils'
import { INCIDENT_TYPE_LABELS, INCIDENT_STATUS_LABELS } from '@/lib/constants'
import type { Incident } from '@/types/model'

interface IncidentTableProps {
  readonly incidents: Incident[]
  readonly onResolve: (incident: Incident) => void
}

export function IncidentTable({ incidents, onResolve }: IncidentTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loại sự cố</TableHead>
              <TableHead>Vị trí / Phiên</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                  Không có sự cố nào
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((inc) => (
                <TableRow key={inc.incidentId} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">{INCIDENT_TYPE_LABELS[inc.issueType]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {inc.slotCode ?? (inc.sessionId ? `#${inc.sessionId}` : '—')}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-gray-600">
                    {inc.description}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDateTime(inc.createdAt)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
                        getStatusColor(inc.status),
                      )}
                    >
                      {INCIDENT_STATUS_LABELS[inc.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {inc.status !== 'Resolved' && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => onResolve(inc)}>
                        <CheckCircle className="h-3 w-3" />
                        Xử lý
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
