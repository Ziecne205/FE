'use client'

import { SlotMapHeader } from './SlotMapHeader'
import { SlotStatsBar } from './SlotStatsBar'
import { ZoneSection } from './ZoneSection'
import { SlotDetailPanel } from './SlotDetailPanel'
import { MaintenancePanel } from './MaintenancePanel'
import { useSlotMap } from '@/hooks/useSlotMap'
import type { Slot } from '@/types/model'

/**
 * Unified Slot Map (slice 1). Layout from Stitch "Variant 1 (Compact)", maintenance
 * multi-select + action panel from "Variant 3 (Active Selection)", and the capacity-crash
 * confirmation from "Variant 2 (Warning State)" — wired to the real data layer.
 */
export function SlotMap() {
  const map = useSlotMap()

  const handleSlotClick = (slot: Slot) => {
    if (map.maintenanceMode) {
      if (slot.status === 'Available') map.toggleSelect(slot.slotCode)
    } else {
      map.openDetail(slot.slotCode)
    }
  }

  return (
    <div className="space-y-6">
      {/* Capacity-crash warning dialog */}
      {map.pendingLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-500 text-2xl mt-0.5">warning</span>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Xác nhận bảo trì</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Bạn đang đặt <strong>{map.pendingLock.length}</strong> ô sang trạng thái{' '}
                  <span className="font-semibold text-amber-700">Bảo trì</span>:{' '}
                  <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                    {map.pendingLock.join(', ')}
                  </span>
                </p>
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                  ⚠️ Nếu sức chứa còn lại sau bảo trì thấp hơn số đặt chỗ đang chờ, hệ thống sẽ{' '}
                  <strong>tự động huỷ các đặt chỗ mới nhất</strong> và hoàn cọc cho tài xế. Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={map.clearPendingLock}
                disabled={map.isLocking}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={map.confirmLock}
                disabled={map.isLocking}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                {map.isLocking ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận bảo trì'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <SlotMapHeader
        floors={map.floors}
        activeFloor={map.activeFloor}
        floorLabel={map.floorLabel}
        onFloorChange={map.setActiveFloor}
        maintenanceMode={map.maintenanceMode}
        onToggleMaintenance={map.enterMaintenanceMode}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: stats + zone grid */}
        <div className="space-y-6">
          <SlotStatsBar
            total={map.stats.total}
            available={map.stats.available}
            occupied={map.stats.occupied}
            maintenance={map.stats.maintenance}
          />
          {map.isLoading ? (
            <div className="py-16 text-center text-gray-500">Đang tải sơ đồ...</div>
          ) : (
            <div className="space-y-6">
              {map.slotsByZone.map(([zone, slots]) => (
                <ZoneSection
                  key={zone}
                  zone={zone}
                  slots={slots}
                  maintenanceMode={map.maintenanceMode}
                  selected={map.selected}
                  onSlotClick={handleSlotClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: contextual panel */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          {map.maintenanceMode ? (
            <MaintenancePanel
              selected={Array.from(map.selected)}
              reason={map.reason}
              notes={map.notes}
              isLocking={map.isLocking}
              onDeselect={map.toggleSelect}
              onReasonChange={map.setReason}
              onNotesChange={map.setNotes}
              onLock={map.requestLock}
              onClear={map.clearSelection}
            />
          ) : map.detailSlot ? (
            <SlotDetailPanel
              slot={map.detailSlot}
              vehicleTypeName={map.vehicleTypeName(map.detailSlot.vehicleTypeId)}
              isLoading={map.isLocking}
              onToggleMaintenance={map.toggleSlotMaintenance}
              onClose={map.closeDetail}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
              Chọn một ô để xem chi tiết, hoặc bật <span className="font-medium">Chế độ bảo trì</span>.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

