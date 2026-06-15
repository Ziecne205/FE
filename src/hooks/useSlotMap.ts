'use client'

import { useMemo, useState } from 'react'
import type { Slot } from '@/types/model'
import {
  useAvailability,
  useLotSlots,
  useParkingLots,
  useSetMaintenance,
  useVehicleTypes,
} from '@/hooks/useAvailability'

export interface CrashDeficit {
  vehicleTypeName: string
  predictedHeadroom: number // negative = deficit
}

function floorLabel(floor: number): string {
  return floor === -1 ? 'Hầm B1' : `Tầng ${floor}`
}

/**
 * Slot-map state + logic: floor tabs, maintenance multi-select, single-slot detail,
 * and predictive capacity-crash detection. Wires to the real availability/slots/
 * maintenance endpoints. Defaults to the first lot from GET /api/parking-lots.
 */
export function useSlotMap(initialLotId?: string) {
  const { data: lots } = useParkingLots()
  const lotId = initialLotId ?? lots?.[0]?.id
  const { data: slots = [], isLoading } = useLotSlots(lotId)
  const { data: availability } = useAvailability(lotId)
  const { data: vehicleTypes = [] } = useVehicleTypes()
  const setMaintenance = useSetMaintenance(lotId)

  const [activeFloor, setActiveFloor] = useState<number | null>(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailCode, setDetailCode] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [crashDeficits, setCrashDeficits] = useState<CrashDeficit[] | null>(null)

  const vtName = useMemo(
    () => Object.fromEntries(vehicleTypes.map((v) => [v.id, v.name])),
    [vehicleTypes],
  )

  // Floors present, sorted with basement last (B1 shown after upper floors).
  const floors = useMemo(() => {
    const set = Array.from(new Set(slots.map((s) => s.floor)))
    return set.sort((a, b) => (a < 0 ? 1 : b < 0 ? -1 : a - b))
  }, [slots])

  const floor = activeFloor ?? floors[0] ?? 1
  const floorSlots = useMemo(() => slots.filter((s) => s.floor === floor), [slots, floor])

  const slotsByZone = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const s of floorSlots) {
      const z = s.zone ?? '—'
      if (!map.has(z)) map.set(z, [])
      map.get(z)!.push(s)
    }
    for (const list of map.values()) list.sort((a, b) => a.slotCode.localeCompare(b.slotCode))
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [floorSlots])

  const stats = useMemo(
    () => ({
      total: floorSlots.length,
      available: floorSlots.filter((s) => s.status === 'Available').length,
      occupied: floorSlots.filter((s) => s.status === 'Occupied').length,
      maintenance: floorSlots.filter((s) => s.status === 'Maintenance').length,
    }),
    [floorSlots],
  )

  const detailSlot = useMemo(
    () => slots.find((s) => s.slotCode === detailCode) ?? null,
    [slots, detailCode],
  )

  /** Predict per-type headroom if the selected Available slots become Maintenance. */
  function predictCrash(slotCodes: string[]): CrashDeficit[] {
    const selectedSlots = slots.filter(
      (s) => slotCodes.includes(s.slotCode) && s.status === 'Available',
    )
    const reducedByType = new Map<string, number>()
    for (const s of selectedSlots) {
      const name = vtName[s.vehicleTypeId] ?? s.vehicleTypeId
      reducedByType.set(name, (reducedByType.get(name) ?? 0) + 1)
    }
    const deficits: CrashDeficit[] = []
    for (const [name, reduced] of reducedByType) {
      const current = availability?.byVehicleType.find((t) => t.vehicleTypeName === name)
      if (!current) continue
      const predicted = current.walkInHeadroom - reduced
      if (predicted < 0) deficits.push({ vehicleTypeName: name, predictedHeadroom: predicted })
    }
    return deficits
  }

  function enterMaintenanceMode(on: boolean) {
    setMaintenanceMode(on)
    setSelected(new Set())
    if (on) setDetailCode(null)
  }

  function toggleSelect(code: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }

  /** Step 1: from the action panel — check for crash, else apply directly. */
  function requestLock() {
    const codes = Array.from(selected)
    if (!codes.length) return
    const deficits = predictCrash(codes)
    if (deficits.length) {
      setCrashDeficits(deficits)
    } else {
      applyLock(codes)
    }
  }

  /** Step 2: confirmed (or no crash) — call the API. */
  function applyLock(codes: string[]) {
    setMaintenance.mutate(
      { slotCodes: codes, maintenance: true },
      {
        onSuccess: () => {
          setSelected(new Set())
          setReason('')
          setNotes('')
          setCrashDeficits(null)
        },
      },
    )
  }

  /** Single-slot toggle from the detail panel. */
  function toggleSlotMaintenance(slot: Slot) {
    setMaintenance.mutate({
      slotCodes: [slot.slotCode],
      maintenance: slot.status !== 'Maintenance',
    })
  }

  return {
    lotId,
    isLoading,
    floors,
    floorLabel,
    activeFloor: floor,
    setActiveFloor,
    maintenanceMode,
    enterMaintenanceMode,
    slotsByZone,
    stats,
    selected,
    toggleSelect,
    clearSelection: () => setSelected(new Set()),
    detailSlot,
    openDetail: (code: string) => setDetailCode(code),
    closeDetail: () => setDetailCode(null),
    toggleSlotMaintenance,
    vehicleTypeName: (id: string) => vtName[id] ?? id,
    reason,
    setReason,
    notes,
    setNotes,
    requestLock,
    isLocking: setMaintenance.isPending,
    crashDeficits,
    confirmCrashLock: () => crashDeficits && applyLock(Array.from(selected)),
    cancelCrash: () => setCrashDeficits(null),
  }
}
