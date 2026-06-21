import { useState } from 'react'
import { api, type AppError } from '@/lib/api'
import type { ParkingSession } from '@/types/model'

export interface FindCarResult {
  data: ParkingSession | null
  isLoading: boolean
  error: string | null
  search: (plate: string) => Promise<void>
  reset: () => void
}

// TODO(opus): GET /api/sessions/find?plate=
export function useFindCar(): FindCarResult {
  const [data, setData] = useState<ParkingSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (plate: string) => {
    if (!plate.trim()) return
    setIsLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await api.get<ParkingSession>(`/sessions/find?plate=${encodeURIComponent(plate.trim())}`)
      setData(result)
    } catch (err) {
      const appErr = err as AppError
      setError(appErr.message ?? 'Không tìm thấy xe')
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
  }

  return { data, isLoading, error, search, reset }
}
