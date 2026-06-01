'use client';

import { useState } from 'react';
import { cn, getStatusColor } from '@/lib/utils';
import { SLOT_STATUS_LABELS } from '@/lib/constants';
import type { Slot, SlotStatus } from '@/types';

interface SlotMapProps {
  slots: Slot[];
  onSlotClick?: (slot: Slot) => void;
  selectedFloor?: number;
  onFloorChange?: (floor: number) => void;
}

interface SlotCardProps {
  slot: Slot;
  onClick?: () => void;
}

function SlotCard({ slot, onClick }: SlotCardProps) {
  const statusColors: Record<SlotStatus, string> = {
    Available: 'bg-green-50 border-green-500 text-green-800',
    Occupied: 'bg-red-50 border-red-500 text-red-800',
    Reserved: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    Maintenance: 'bg-gray-50 border-gray-500 text-gray-800',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md',
        statusColors[slot.status]
      )}
    >
      <span className="text-xs font-mono font-bold">{slot.slot_name}</span>
      <span className="text-[10px] mt-1">{SLOT_STATUS_LABELS[slot.status]}</span>
    </button>
  );
}

export function SlotMap({ slots, onSlotClick, selectedFloor = 1, onFloorChange }: SlotMapProps) {
  const [activeFloor, setActiveFloor] = useState(selectedFloor);

  const handleFloorChange = (floor: number) => {
    setActiveFloor(floor);
    onFloorChange?.(floor);
  };

  // Group slots by zone
  const slotsByZone = slots.reduce((acc, slot) => {
    const match = slot.slot_name.match(/^F(\d+)-([A-Z])-(\d+)$/);
    if (!match) return acc;

    const [, floor, zone] = match;
    if (parseInt(floor) !== activeFloor) return acc;

    if (!acc[zone]) {
      acc[zone] = [];
    }
    acc[zone].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  // Sort zones alphabetically
  const zones = Object.keys(slotsByZone).sort();

  // Calculate stats for current floor
  const floorSlots = slots.filter((s) => s.slot_name.startsWith(`F${activeFloor}-`));
  const stats = {
    total: floorSlots.length,
    available: floorSlots.filter((s) => s.status === 'Available').length,
    occupied: floorSlots.filter((s) => s.status === 'Occupied').length,
    reserved: floorSlots.filter((s) => s.status === 'Reserved').length,
    maintenance: floorSlots.filter((s) => s.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-6">
      {/* Floor Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Bản đồ Sơ đồ</h2>
          <p className="text-sm text-gray-600">Giám sát trạng thái ô đỗ xe theo thời gian thực</p>
        </div>
        <div className="flex items-center gap-4">
          {[1, 2, -1].map((floor) => (
            <button
              key={floor}
              onClick={() => handleFloorChange(floor)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                activeFloor === floor
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {floor === -1 ? 'Tầng hầm' : `Tầng ${floor}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng Ô Đỗ</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Trống</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.available}</span>
            <span className="text-sm text-gray-600">/ {stats.total}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Đã có xe</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.occupied}</span>
            <span className="text-sm text-gray-600">/ {stats.total}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Đã đặt</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.reserved}</span>
            <span className="text-sm text-gray-600">/ {stats.total}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-gray-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bảo trì</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.maintenance}</span>
            <span className="text-sm text-gray-600">/ {stats.total}</span>
          </div>
        </div>
      </div>

      {/* Slot Grid by Zone */}
      <div className="space-y-6">
        {zones.map((zone) => (
          <div key={zone} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Khu vực {zone}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {slotsByZone[zone]
                .sort((a, b) => a.slot_number - b.slot_number)
                .map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    onClick={() => onSlotClick?.(slot)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Chú thích</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600">Đã có xe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500"></div>
            <span className="text-sm text-gray-600">Bảo trì</span>
          </div>
        </div>
      </div>
    </div>
  );
}
