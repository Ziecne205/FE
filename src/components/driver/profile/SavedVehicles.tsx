'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Car, Plus, Trash2, X } from 'lucide-react'
import type { ReadonlySavedVehiclesProps, AddVehicleFields } from './types'

const LICENSE_PLATE_RE = /^[0-9]{2}[A-Z]-[0-9]{3}\.[0-9]{2}$|^[0-9]{2}[A-Z][0-9]-[0-9]{4,5}$/

const schema = z.object({
  licensePlate: z
    .string()
    .min(1, 'Vui lòng nhập biển số')
    .regex(LICENSE_PLATE_RE, 'Biển số không đúng định dạng (vd: 29A-123.45)'),
  vehicleTypeId: z.string().min(1, 'Vui lòng chọn loại phương tiện'),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
})

export function SavedVehicles({
  vehicles,
  vehicleTypes,
  isAdding,
  removingId,
  onAdd,
  onRemove,
}: ReadonlySavedVehiclesProps) {
  const [showModal, setShowModal] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddVehicleFields>({
    resolver: zodResolver(schema),
    defaultValues: { licensePlate: '', vehicleTypeId: '', brand: '', model: '', color: '' },
  })

  const selectedTypeId = watch('vehicleTypeId')

  const handleAdd = (data: AddVehicleFields) => {
    onAdd(data)
    reset()
    setShowModal(false)
  }

  const handleRemoveConfirm = (id: string) => {
    onRemove(id)
    setConfirmRemoveId(null)
  }

  const vehicleTypeName = (id: string) =>
    vehicleTypes.find((vt) => vt.id === id)?.name ?? id

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Xe của tôi</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {vehicles.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => { reset(); setShowModal(true) }}
          className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm xe mới
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Car className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Bạn chưa thêm xe nào.</p>
          <p className="text-xs text-gray-400 mt-1">Thêm biển số để tự động điền khi đặt chỗ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <Car className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono font-bold text-sm text-gray-900 truncate">{v.licensePlate}</p>
                  <p className="text-xs text-gray-500 truncate">{vehicleTypeName(v.vehicleTypeId)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmRemoveId(v.id)}
                disabled={removingId === v.id}
                aria-label={`Xóa xe ${v.licensePlate}`}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {removingId === v.id ? (
                  <span className="block w-4 h-4 rounded-full border-2 border-gray-300 border-t-red-400 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add vehicle modal — Centered Minimalist ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-vehicle-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-7 pb-0">
              <h3 id="add-vehicle-title" className="text-xl font-semibold text-gray-900">
                Thêm phương tiện mới
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleAdd)} noValidate className="px-8 pt-6 pb-8 space-y-5">
              {/* Biển số xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Biển số xe <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('licensePlate')}
                  type="text"
                  placeholder="29A-123.45"
                  autoFocus
                  aria-label="Biển số xe"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-mono text-gray-900 placeholder-gray-400 outline-none transition-colors ${
                    errors.licensePlate
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                {errors.licensePlate && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.licensePlate.message}</p>
                )}
              </div>

              {/* Loại phương tiện */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại phương tiện <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {vehicleTypes.map((vt) => (
                    <button
                      key={vt.id}
                      type="button"
                      onClick={() => setValue('vehicleTypeId', vt.id, { shouldValidate: true })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        selectedTypeId === vt.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {vt.name}
                    </button>
                  ))}
                </div>
                {/* hidden input to satisfy react-hook-form registration */}
                <input {...register('vehicleTypeId')} type="hidden" />
                {errors.vehicleTypeId && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.vehicleTypeId.message}</p>
                )}
              </div>

              {/* Hãng xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hãng xe
                </label>
                <input
                  {...register('brand')}
                  type="text"
                  placeholder="Toyota, VinFast, Honda..."
                  aria-label="Hãng xe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Tên xe / Đời xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên xe / Đời xe
                </label>
                <input
                  {...register('model')}
                  type="text"
                  placeholder="Camry 2022, VF8 2023..."
                  aria-label="Tên xe hoặc đời xe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Màu sắc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Màu sắc
                </label>
                <input
                  {...register('color')}
                  type="text"
                  placeholder="Trắng, Đen, Xám..."
                  aria-label="Màu sắc xe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAdding ? 'Đang lưu...' : 'Lưu phương tiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove confirm modal */}
      {confirmRemoveId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận xóa xe"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Xóa xe này?</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Biển số{' '}
                  <span className="font-mono font-bold text-gray-900">
                    {vehicles.find((v) => v.id === confirmRemoveId)?.licensePlate}
                  </span>{' '}
                  sẽ bị xóa khỏi danh sách của bạn.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmRemoveId(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={() => handleRemoveConfirm(confirmRemoveId)}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
