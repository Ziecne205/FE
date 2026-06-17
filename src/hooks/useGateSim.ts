import { useMutation } from '@tanstack/react-query'
import type {
  EntryScanResult,
  ExitScanResult,
  ForceCheckinResult,
  CameraSlotResult,
} from '@/components/gate-camera-simulator/types'
import {
  CANNED_ENTRY_SUCCESS,
  CANNED_ENTRY_SCAN_FAILED,
  CANNED_ENTRY_MISMATCH,
  CANNED_ENTRY_FULL,
  CANNED_EXIT_SUCCESS,
  CANNED_FORCE_CHECKIN,
} from '@/components/gate-camera-simulator/mockData'

// TODO(opus): POST /api/gate/entry/scan
export function useEntryScan(failureRate: number) {
  return useMutation<EntryScanResult, Error, { licensePlate: string }>({
    mutationFn: async ({ licensePlate: _licensePlate }) => {
      await new Promise((r) => setTimeout(r, 600))
      const roll = Math.random() * 100
      if (roll < failureRate) return CANNED_ENTRY_SCAN_FAILED
      if (roll < failureRate + 10) return CANNED_ENTRY_MISMATCH
      if (roll < failureRate + 15) return CANNED_ENTRY_FULL
      return CANNED_ENTRY_SUCCESS
    },
  })
}

// TODO(opus): POST /api/gate/exit/scan
export function useExitScan(failureRate: number) {
  return useMutation<ExitScanResult, Error, { licensePlate: string }>({
    mutationFn: async ({ licensePlate: _licensePlate }) => {
      await new Promise((r) => setTimeout(r, 600))
      const roll = Math.random() * 100
      if (roll < failureRate) throw new Error('Quét biển số cổng ra thất bại.')
      return CANNED_EXIT_SUCCESS
    },
  })
}

// TODO(opus): POST /api/gate/force-checkin
export function useForceCheckin() {
  return useMutation<ForceCheckinResult, Error, { licensePlate: string }>({
    mutationFn: async ({ licensePlate: _licensePlate }) => {
      await new Promise((r) => setTimeout(r, 800))
      return CANNED_FORCE_CHECKIN
    },
  })
}

// TODO(opus): POST /api/camera/slot-occupied
export function useCameraOccupied() {
  return useMutation<CameraSlotResult, Error, { slotCode: string }>({
    mutationFn: async ({ slotCode: _slotCode }) => {
      await new Promise((r) => setTimeout(r, 400))
      return { matched: true, slotStatus: 'Occupied' }
    },
  })
}

// TODO(opus): POST /api/camera/slot-vacated
export function useCameraVacated() {
  return useMutation<CameraSlotResult, Error, { slotCode: string }>({
    mutationFn: async ({ slotCode: _slotCode }) => {
      await new Promise((r) => setTimeout(r, 400))
      return { matched: true, slotStatus: 'Available' }
    },
  })
}
