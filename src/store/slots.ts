import { create } from 'zustand'
import { Slot, SlotStatus } from '@/types'

interface SlotState {
  slots: Slot[]
  selectedFloor: number
  setSlots: (slots: Slot[]) => void
  updateSlotStatus: (slotId: string, status: SlotStatus) => void
  setSelectedFloor: (floor: number) => void
  getSlotsByFloor: (floor: number) => Slot[]
}

export const useSlotStore = create<SlotState>((set, get) => ({
  slots: [],
  selectedFloor: 1,

  setSlots: (slots: Slot[]) => set({ slots }),

  updateSlotStatus: (slotId: string, status: SlotStatus) => {
    set((state) => ({
      slots: state.slots.map((slot) =>
        slot.id === slotId ? { ...slot, status } : slot
      ),
    }))
  },

  setSelectedFloor: (floor: number) => set({ selectedFloor: floor }),

  getSlotsByFloor: (floor: number) => {
    const { slots } = get()
    return slots.filter((slot) => {
      // Extract floor number from slot_name (e.g., "F1-A-15" -> 1)
      const floorNum = parseInt(slot.slot_name.split('-')[0].substring(1))
      return floorNum === floor
    })
  },
}))
