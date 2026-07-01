'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  usePricingPolicies,
  useUpdatePricing,
  useFeeConfig,
  useUpdateFeeConfig,
} from '@/hooks/usePricing'
import type { FeeConfig } from '@/types/model'

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ'
}

export function PricingManagement() {
  const { data: policies = [], isLoading } = usePricingPolicies()
  const updatePricing = useUpdatePricing()
  const { data: fee } = useFeeConfig()
  const updateFee = useUpdateFeeConfig()

  // Local edits cho giá/giờ theo từng loại xe (seed từ server).
  const [rates, setRates] = useState<Record<string, string>>({})
  useEffect(() => {
    setRates(Object.fromEntries(policies.map((p) => [p.policyId, String(p.hourlyRate)])))
  }, [policies])

  // Local form cho chính sách phí.
  const [form, setForm] = useState<FeeConfig | null>(null)
  useEffect(() => {
    if (fee) setForm(fee)
  }, [fee])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý giá</h1>
        <p className="mt-0.5 text-sm text-gray-500">Bảng giá theo giờ và các chính sách phí</p>
      </div>

      {/* Bảng giá theo giờ */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Bảng giá theo giờ</h2>
        </header>
        {isLoading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">Đang tải...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {policies.map((p) => {
              const value = rates[p.policyId] ?? String(p.hourlyRate)
              const dirty = Number(value) !== p.hourlyRate
              return (
                <div key={p.policyId} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-28 font-medium text-gray-900">{p.vehicleTypeName}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={value}
                      onChange={(e) => setRates((r) => ({ ...r, [p.policyId]: e.target.value }))}
                      className="w-36"
                    />
                    <span className="text-sm text-gray-500">đ/giờ</span>
                  </div>
                  <span className="ml-auto text-sm text-gray-400">{formatVnd(p.hourlyRate)}/giờ</span>
                  <Button
                    size="sm"
                    disabled={!dirty || updatePricing.isPending}
                    onClick={() =>
                      updatePricing.mutate({ policyId: p.policyId, hourlyRate: Number(value) })
                    }
                  >
                    Lưu
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Chính sách phí */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-gray-900">Chính sách phí</h2>
        </header>
        {form && (
          <form
            className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              updateFee.mutate(form)
            }}
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="depositPercent">% cọc booking</Label>
              <Input
                id="depositPercent"
                type="number"
                min={0}
                max={100}
                value={form.depositPercent}
                onChange={(e) => setForm({ ...form, depositPercent: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="overstayRatePerHour">Phí quá giờ (đ/giờ)</Label>
              <Input
                id="overstayRatePerHour"
                type="number"
                min={0}
                step={1000}
                value={form.overstayRatePerHour}
                onChange={(e) => setForm({ ...form, overstayRatePerHour: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="noShowGraceMinutes">Ân hạn no-show (phút)</Label>
              <Input
                id="noShowGraceMinutes"
                type="number"
                min={0}
                value={form.noShowGraceMinutes}
                onChange={(e) => setForm({ ...form, noShowGraceMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="blacklistThreshold">Ngưỡng blacklist (lần no-show)</Label>
              <Input
                id="blacklistThreshold"
                type="number"
                min={1}
                value={form.blacklistThreshold}
                onChange={(e) => setForm({ ...form, blacklistThreshold: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={updateFee.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                Lưu chính sách phí
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
