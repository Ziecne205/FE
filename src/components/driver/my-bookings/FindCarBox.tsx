'use client'

import { useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { useFindCar } from '@/hooks/useFindCar'
import type { ReadonlyFindCarBoxProps } from './types'

export function FindCarBox({ className }: ReadonlyFindCarBoxProps) {
  const [plate, setPlate] = useState('')
  const { data, isLoading, error, search, reset } = useFindCar()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search(plate)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlate(e.target.value)
    if (data || error) reset()
  }

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm p-5 ${className ?? ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <Search className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">Tìm xe của tôi</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={plate}
          onChange={handleChange}
          placeholder="Nhập biển số xe..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Biển số xe"
        />
        <button
          type="submit"
          disabled={isLoading || !plate.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Tìm
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </p>
      )}

      {data && (
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Xe đang ở:</p>
              {data.actualSlotCode ? (
                <p className="mt-1 font-mono font-bold text-lg text-blue-700">{data.actualSlotCode}</p>
              ) : data.assignedSlotCode ? (
                <p className="mt-1 font-mono font-bold text-lg text-blue-700">{data.assignedSlotCode} <span className="text-xs font-sans font-normal text-gray-500">(chỗ gợi ý)</span></p>
              ) : (
                <p className="mt-1 text-sm text-gray-600">Chưa xác định vị trí</p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>Biển số: <span className="font-mono font-medium text-gray-700">{data.licensePlate}</span></span>
                <span>Trạng thái: <span className="font-medium text-gray-700">{data.status}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
