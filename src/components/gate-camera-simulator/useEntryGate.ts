import { useState } from 'react'
import { toast } from 'sonner'
import { useEntryScan, useForceCheckin } from '@/hooks/useGateSim'
import { useStaffForceCheckIn } from '@/hooks/useSessions'
import type { EntryState, EventLogEntry } from './types'

function mkEvent(partial: Omit<EventLogEntry, 'id' | 'ts'>): EventLogEntry {
  return { ...partial, id: crypto.randomUUID(), ts: new Date().toISOString() }
}

/**
 * State machine + side effects for the entry gate simulator. Keeping the branching
 * logic here leaves EntryGatePanel as a thin, declarative view.
 */
export function useEntryGate(failureRate: number, onEvent: (e: EventLogEntry) => void) {
  const [state, setState] = useState<EntryState>('IDLE')
  const [scannedPlate, setScannedPlate] = useState('30G-123.45')
  const [manualPlate, setManualPlate] = useState('')
  const [forceReason, setForceReason] = useState('')
  // sessionId from the entry scan — needed for the audited staff force-check-in
  const [pendingSessionId, setPendingSessionId] = useState<number | null>(null)

  const entryScan = useEntryScan(failureRate)
  const forceCheckin = useForceCheckin() // sim-only: /gate/force-checkin (no audit)
  const staffForceCheckIn = useStaffForceCheckIn() // audited: /staff/sessions/{id}/force-check-in

  async function scan() {
    setState('SCANNING')
    try {
      const result = await entryScan.mutateAsync({ licensePlate: scannedPlate })
      if (result.admitted) {
        setState('ADMITTED')
        onEvent(
          mkEvent({
            kind: 'ENTRY',
            message: `Cổng IN-01: Xe vào thành công. Chỗ: ${result.suggestedSlotCode ?? '—'}`,
            plate: scannedPlate,
            slotCode: result.suggestedSlotCode,
          }),
        )
      } else if (result.reason === 'SCAN_FAILED') {
        setState('SCAN_FAILED')
        onEvent(mkEvent({ kind: 'ERROR', message: 'Quét thất bại — nhập tay biển số.', plate: scannedPlate }))
      } else if (result.reason === 'PLATE_MISMATCH') {
        setState('PLATE_MISMATCH')
        if (result.sessionId) setPendingSessionId(Number(result.sessionId))
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

  async function submitManual() {
    if (!manualPlate.trim()) return
    const plate = manualPlate.trim().toUpperCase()
    setState('SCANNING')
    try {
      const result = await entryScan.mutateAsync({ licensePlate: plate })
      if (result.admitted) {
        setState('ADMITTED')
        onEvent(
          mkEvent({
            kind: 'ENTRY',
            message: `Cổng IN-01 (nhập tay): Xe vào thành công.`,
            plate,
            slotCode: result.suggestedSlotCode,
          }),
        )
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

  async function forceViaQr() {
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

  async function staffOverride() {
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
  }

  function reset() {
    setState('IDLE')
    setManualPlate('')
    setForceReason('')
    setPendingSessionId(null)
  }

  const isLoading = entryScan.isPending || forceCheckin.isPending || staffForceCheckIn.isPending

  return {
    state,
    scannedPlate,
    setScannedPlate,
    manualPlate,
    setManualPlate,
    forceReason,
    setForceReason,
    isLoading,
    scan,
    submitManual,
    forceViaQr,
    staffOverride,
    reset,
  }
}
