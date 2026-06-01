import { Slot, SlotStatus } from '@/types'

// Generate mock slots for 3 floors with zones A, B, C
export function generateMockSlots(): Slot[] {
  const slots: Slot[] = []
  const floors = [1, 2, -1] // Floor 1, 2, and Basement (-1)
  const zones = ['A', 'B', 'C']
  const slotsPerZone = 10

  let slotId = 1

  floors.forEach((floor) => {
    zones.forEach((zone) => {
      for (let i = 1; i <= slotsPerZone; i++) {
        const floorLabel = floor === -1 ? 'B' : `F${floor}`
        const slotName = `${floorLabel}-${zone}-${i.toString().padStart(2, '0')}`

        // Randomly assign status for demo
        const rand = Math.random()
        let status: SlotStatus
        if (rand < 0.5) status = 'Available'
        else if (rand < 0.75) status = 'Occupied'
        else if (rand < 0.9) status = 'Reserved'
        else status = 'Maintenance'

        slots.push({
          id: `slot-${slotId}`,
          zone_id: `zone-${floor}-${zone}`,
          slot_number: i,
          slot_name: slotName,
          status,
        })
        slotId++
      }
    })
  })

  return slots
}

export const mockSlots = generateMockSlots()
