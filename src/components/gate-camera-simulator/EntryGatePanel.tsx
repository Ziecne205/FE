'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useEntryScan, useForceCheckin } from '@/hooks/useGateSim'
import { useStaffForceCheckIn } from '@/hooks/useSessions'
import type { EntryGatePanelProps, EntryState, EventLogEntry } from './types'

function mkEvent(partial: Omit<EventLogEntry, 'id' | 'ts'>): EventLogEntry {
  return { ...partial, id: crypto.randomUUID(), ts: new Date().toISOString() }
}

export function EntryGatePanel({ failureRate, onEvent }: EntryGatePanelProps) {
  const [state, setState] = useState<EntryState>('IDLE')
  const [scannedPlate, setScannedPlate] = useState('30G-123.45')
  const [manualPlate, setManualPlate] = useState('')
  const [forceReason, setForceReason] = useState('')
  // sessionId returned by the gate entry scan (needed for the audited force-check-in)
  const [pendingSessionId, setPendingSessionId] = useState<number | null>(null)

  const entryScan = useEntryScan(failureRate)
  const forceCheckin = useForceCheckin()         // sim-only: /gate/force-checkin (no audit)
  const staffForceCheckIn = useStaffForceCheckIn() // audited: /staff/sessions/{id}/force-check-in

  async function handleScan() {
    setState('SCANNING')
    try {
      const result = await entryScan.mutateAsync({ licensePlate: scannedPlate })
      if (result.admitted) {
        setState('ADMITTED')
        onEvent(mkEvent({
          kind: 'ENTRY',
          message: `Cổng IN-01: Xe vào thành công. Chỗ: ${result.suggestedSlotCode ?? '—'}`,
          plate: scannedPlate,
          slotCode: result.suggestedSlotCode,
        }))
      } else if (result.reason === 'SCAN_FAILED') {
        setState('SCAN_FAILED')
        onEvent(mkEvent({ kind: 'ERROR', message: 'Quét thất bại — nhập tay biển số.', plate: scannedPlate }))
      } else if (result.reason === 'PLATE_MISMATCH') {
        setState('PLATE_MISMATCH')
        // Store the sessionId so staff can call the audited force-check-in
        if (result.sessionId) setPendingSessionId(result.sessionId)
        onEvent(mkEvent({ kind: 'ERROR', message: 'Biển số không khớp đặt chỗ.', plate: scannedPlate }))
      } else if (result.reason === 'FULL') {
        setState('FULL')
        onEvent(mkEvent({ kind: 'ERROR', message: 'Bãi xe đã đầy — từ chối vào.', plate: scannedPlate }))
      } else {
        setState('IDLE')
        toast.error(result.message ?? 'Lỗi không xác định.')
      }
    } catch {
      setState('IDLE')
      toast.error('Lỗi kết nối cổng vào.')
    }
  }

  async function handleManualSubmit() {
    if (!manualPlate.trim()) return
    setState('SCANNING')
    try {
      const result = await entryScan.mutateAsync({ licensePlate: manualPlate.trim().toUpperCase() })
      if (result.admitted) {
        setState('ADMITTED')
        onEvent(mkEvent({
          kind: 'ENTRY',
          message: `Cổng IN-01 (nhập tay): Xe vào thành công.`,
          plate: manualPlate.trim().toUpperCase(),
          slotCode: result.suggestedSlotCode,
        }))
      } else if (result.reason === 'PLATE_MISMATCH') {
        setState('PLATE_MISMATCH')
        onEvent(mkEvent({ kind: 'ERROR', message: 'Biển số nhập tay không khớp đặt chỗ.', plate: manualPlate }))
      } else if (result.reason === 'FULL') {
        setState('FULL')
        onEvent(mkEvent({ kind: 'ERROR', message: 'Bãi xe đã đầy.', plate: manualPlate }))
      } else {
        toast.error(result.message ?? 'Lỗi không xác định.')
        setState('SCAN_FAILED')
      }
    } catch {
      toast.error('Lỗi kết nối.')
      setState('SCAN_FAILED')
    }
  }

  async function handleForceCheckin() {
    const plate = state === 'SCAN_FAILED' ? manualPlate || scannedPlate : scannedPlate
    try {
      const result = await forceCheckin.mutateAsync({ licensePlate: plate })
      if (result.admitted) {
        setState('ADMITTED')
        onEvent(mkEvent({ kind: 'FORCE', message: `Force check-in: ${result.message}`, plate }))
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Force check-in thất bại.')
    }
  }

  function handleReset() {
    setState('IDLE')
    setManualPlate('')
    setForceReason('')
    setPendingSessionId(null)
  }

  const isLoading = entryScan.isPending || forceCheckin.isPending || staffForceCheckIn.isPending

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="material-symbols-outlined text-green-600">login</span>
          Cổng Vào (IN-01)
        </h3>
        <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${
          state === 'ADMITTED'     ? 'bg-green-100 text-green-700' :
          state === 'FULL'         ? 'bg-red-100 text-red-700 animate-pulse' :
          state === 'SCAN_FAILED'  ? 'bg-yellow-100 text-yellow-700' :
          state === 'PLATE_MISMATCH' ? 'bg-orange-100 text-orange-700' :
          state === 'SCANNING'     ? 'bg-blue-100 text-blue-700' :
                                     'bg-gray-100 text-gray-500'
        }`}>
          {state === 'IDLE'          && 'Chờ quét'}
          {state === 'SCANNING'      && 'Đang quét…'}
          {state === 'SCAN_FAILED'   && 'Quét lỗi'}
          {state === 'PLATE_MISMATCH'&& 'Không khớp'}
          {state === 'FULL'          && 'HẾT CHỖ'}
          {state === 'ADMITTED'      && 'Đã vào'}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Camera feed mock */}
        <div className="relative bg-gray-900 rounded-lg h-40 overflow-hidden border border-gray-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-gray-600">videocam</span>
          {/* ALPR overlay */}
          {state !== 'SCAN_FAILED' && (
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
              <span className="bg-black/70 border border-yellow-500/60 px-2 py-0.5 rounded font-mono text-yellow-400 text-sm">
                {scannedPlate}
              </span>
              <span className="text-xs font-mono text-green-400 bg-black/60 px-1 rounded">
                Conf: {Math.max(10, 98 - failureRate)}%
              </span>
            </div>
          )}
          {state === 'SCAN_FAILED' && (
            <div className="absolute inset-4 border-2 border-dashed border-red-500/70 rounded flex items-center justify-center">
              <span className="bg-red-700 text-white text-xs font-mono px-2 py-1 rounded">UNREADABLE</span>
            </div>
          )}
          {state === 'FULL' && (
            <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
              <span className="text-white text-2xl font-black tracking-widest">HẾT CHỖ</span>
            </div>
          )}
          {state === 'ADMITTED' && (
            <div className="absolute inset-0 bg-green-900/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-300 text-5xl">check_circle</span>
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="bg-black/60 text-white text-[10px] font-mono px-1 rounded">CAM_IN_01</span>
          </div>
        </div>

        {/* Plate input + scan */}
        {(state === 'IDLE' || state === 'SCANNING') && (
          <div className="flex gap-2">
            <input
              type="text"
              value={scannedPlate}
              onChange={(e) => setScannedPlate(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Biển số nhận diện"
              disabled={isLoading}
            />
            <button
              onClick={handleScan}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">document_scanner</span>
              Quét
            </button>
          </div>
        )}

        {/* Manual plate input (SCAN_FAILED) */}
        {state === 'SCAN_FAILED' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex flex-col gap-2">
            <p className="text-sm font-semibold text-yellow-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">edit_document</span>
              Nhập tay biển số
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualPlate}
                onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
                placeholder="VD: 30G-123.45"
                className="flex-1 border border-yellow-300 rounded-lg px-3 py-2 font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Nhập tay biển số"
                disabled={isLoading}
              />
              <button
                onClick={handleManualSubmit}
                disabled={isLoading || !manualPlate.trim()}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                Gửi
              </button>
            </div>
            <button
              onClick={handleForceCheckin}
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              Force Check-in (Quét QR)
            </button>
          </div>
        )}

        {/* Plate mismatch — audited staff force check-in */}
        {state === 'PLATE_MISMATCH' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex flex-col gap-2">
            <p className="text-sm font-semibold text-orange-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">warning</span>
              Biển số không khớp đặt chỗ
            </p>
            <p className="text-xs text-orange-700">Biển số <span className="font-mono font-bold">{scannedPlate}</span> không tìm thấy đặt chỗ tương ứng.</p>
            <p className="text-xs text-gray-600">Nhân viên có thể ghi đè (hành động sẽ được ghi vào audit log):</p>
            <textarea
              value={forceReason}
              onChange={(e) => setForceReason(e.target.value)}
              placeholder="Lý do ghi đè (tuỳ chọn)…"
              rows={2}
              disabled={isLoading}
              className="w-full border border-orange-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <button
              onClick={async () => {
                if (!pendingSessionId) {
                  toast.error('Không tìm thấy phiên cần ghi đè.')
                  return
                }
                try {
                  await staffForceCheckIn.mutateAsync({
                    sessionId: pendingSessionId,
                    actualPlate: scannedPlate,
                    reason: forceReason || undefined,
                  })
                  setState('ADMITTED')
                  onEvent(mkEvent({ kind: 'FORCE', message: `Ghi đè biển số (có audit): ${scannedPlate}`, plate: scannedPlate }))
                } catch {
                  toast.error('Ghi đè thất bại.')
                }
              }}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Ghi đè biển số (Có audit log)
            </button>
            <button onClick={handleReset} className="text-xs text-gray-500 hover:underline text-center">Huỷ / Thử lại</button>
          </div>
        )}

        {/* FULL state */}
        {state === 'FULL' && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-center">
            <p className="text-red-700 font-bold text-lg">HẾT CHỖ</p>
            <p className="text-red-600 text-sm mt-1">Bãi xe không còn chỗ trống. Từ chối xe vào.</p>
            <button onClick={handleReset} className="mt-3 text-xs text-gray-500 hover:underline">Đặt lại</button>
          </div>
        )}

        {/* Admitted */}
        {state === 'ADMITTED' && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-center">
            <p className="text-green-700 font-bold flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Xe đã vào thành công
            </p>
            <button onClick={handleReset} className="mt-2 text-xs text-gray-500 hover:underline">Đặt lại</button>
          </div>
        )}
      </div>
    </section>
  )
}
