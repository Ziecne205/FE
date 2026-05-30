'use client';

import { useState } from 'react';
import { Calendar, Download, TrendingUp, DollarSign, Car, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ReportData } from '@/types';

interface ReportsProps {
  reportData: ReportData[];
  onExport?: () => void;
  onDateRangeChange?: (range: string) => void;
}

export function Reports({ reportData, onExport, onDateRangeChange }: ReportsProps) {
  const [dateRange, setDateRange] = useState('week');

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    onDateRangeChange?.(range);
  };

  // Calculate summary stats
  const totalRevenue = reportData.reduce((sum, day) => sum + day.revenue, 0);
  const totalSessions = reportData.reduce((sum, day) => sum + day.sessions, 0);
  const avgOccupancy =
    reportData.reduce((sum, day) => sum + day.occupancy_rate, 0) / reportData.length || 0;
  const avgRevenuePerDay = totalRevenue / reportData.length || 0;

  // Find peak day
  const peakDay = reportData.reduce(
    (max, day) => (day.revenue > max.revenue ? day : max),
    reportData[0] || { revenue: 0, date: '', sessions: 0, occupancy_rate: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Báo cáo & Thống kê</h2>
          <p className="text-sm text-gray-600">Phân tích hiệu suất và doanh thu</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">30 ngày qua</SelectItem>
              <SelectItem value="quarter">90 ngày qua</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="ml-1">+12%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Tổng doanh thu</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalRevenue)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Trung bình {formatCurrency(avgRevenuePerDay)}/ngày
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Car className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Tổng phiên gửi xe</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalSessions}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Trung bình {Math.round(totalSessions / reportData.length)}/ngày
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Tỷ lệ lấp đầy TB</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {avgOccupancy.toFixed(1)}%
            </h3>
            <p className="text-xs text-gray-500 mt-1">Trong khoảng thời gian đã chọn</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Ngày cao điểm</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(peakDay.revenue)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{formatDate(peakDay.date)}</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ Doanh thu</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Biểu đồ sẽ được hiển thị ở đây</p>
            <p className="text-sm text-gray-400 mt-1">
              Tích hợp thư viện biểu đồ (Chart.js, Recharts, v.v.)
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chi tiết theo ngày</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số phiên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ lấp đầy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giờ cao điểm
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(day.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {day.sessions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(day.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${day.occupancy_rate}%` }}
                        />
                      </div>
                      <span>{day.occupancy_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {day.peak_hour || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
