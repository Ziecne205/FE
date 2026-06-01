'use client';

import { useEffect, useState } from 'react';
import { ParkingCircle, CheckCircle, Car, DollarSign } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { formatCurrency } from '@/lib/utils';
import { REFRESH_INTERVAL } from '@/lib/constants';
import type { OccupancyStats } from '@/types';

interface ManagerDashboardProps {
  stats: OccupancyStats;
  onRefresh?: () => void;
}

export function ManagerDashboard({ stats, onRefresh }: ManagerDashboardProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
      setLastUpdate(new Date());
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [onRefresh]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng số chỗ"
          value={stats.total_slots}
          icon={ParkingCircle}
          iconColor="blue"
        />

        <StatsCard
          title="Chỗ trống"
          value={stats.available}
          icon={CheckCircle}
          iconColor="green"
          trend={{
            value: '+5',
            direction: 'up',
            color: 'green',
          }}
        />

        <StatsCard
          title="Đang sử dụng"
          value={stats.occupied}
          icon={Car}
          iconColor="red"
          badge={`${stats.occupancy_rate}%`}
        />

        <StatsCard
          title="Doanh thu hôm nay"
          value={formatCurrency(stats.current_revenue)}
          icon={DollarSign}
          iconColor="blue"
          trend={{
            value: '+12%',
            direction: 'up',
            color: 'blue',
          }}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Phân bổ chỗ đỗ</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trống</span>
              <span className="text-sm font-bold text-green-600">
                {stats.available} ({Math.round((stats.available / stats.total_slots) * 100)}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đã đỗ</span>
              <span className="text-sm font-bold text-red-600">
                {stats.occupied} ({Math.round((stats.occupied / stats.total_slots) * 100)}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đã đặt</span>
              <span className="text-sm font-bold text-yellow-600">
                {stats.reserved} ({Math.round((stats.reserved / stats.total_slots) * 100)}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bảo trì</span>
              <span className="text-sm font-bold text-gray-600">
                {stats.maintenance} ({Math.round((stats.maintenance / stats.total_slots) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Tỷ lệ lấp đầy</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Hiện tại</span>
                <span className="text-sm font-bold text-gray-900">{stats.occupancy_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.occupancy_rate}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {stats.occupancy_rate >= 80
                ? 'Tỷ lệ lấp đầy cao - Cân nhắc mở thêm khu vực'
                : stats.occupancy_rate >= 50
                ? 'Tỷ lệ lấp đầy trung bình'
                : 'Tỷ lệ lấp đầy thấp'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
