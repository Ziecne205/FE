export type BookStep = 'form' | 'payment' | 'confirmation'

export interface BookFormValues {
  parkingLotId: string
  vehicleTypeId: string
  licensePlate: string
  expectedEntryTime: string
  expectedExitTime: string
}
