'use client';

import { useState } from 'react';
import { Search, RefreshCw, Download, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { BOOKING_STATUS_LABELS } from '@/lib/constants';
import type { BookingWithDetails, BookingStatus } from '@/types';
import { cn, getStatusColor } from '@/lib/utils';

interface BookingManagementProps {
  bookings: BookingWithDetails[];
  onRefresh?: () => void;
  onExport?: () => void;
  onCreateBooking?: () => void;
  onBookingClick?: (booking: BookingWithDetails) => void;
  userRole: 'Manager' | 'Staff';
}

export function BookingManagement({
  bookings,
  onRefresh,
  onExport,
  onCreateBooking,
  onBookingClick,
  userRole,
}: BookingManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.vehicle_license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    // Date filter logic would go here
    const matchesDate = true;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Group by status
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'Pending').length,
    confirmed: bookings.filter((b) => b.status === 'Confirmed').length,
    completed: bookings.filter((b) => b.status === 'Completed').length,
    cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý Đặt chỗ</h2>
          <p className="text-sm text-gray-600">Theo dõi và quản lý các đặt chỗ trước</p>
        </div>
        {userRole === 'Manager' && onCreateBooking && (
          <Button onClick={onCreateBooking} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo đặt chỗ mới
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Tổng số</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-yellow-500">
          <div className="text-sm text-gray-600 mb-1">Chờ xác nhận</div>
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <div className="text-sm text-gray-600 mb-1">Đã xác nhận</div>
          <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <div className="text-sm text-gray-600 mb-1">Hoàn thành</div>
          <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-gray-500">
          <div className="text-sm text-gray-600 mb-1">Đã hủy</div>
          <div className="text-2xl font-bold text-gray-900">{stats.cancelled}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm theo biển số, tên khách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Pending">Chờ xác nhận</SelectItem>
              <SelectItem value="Confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="Completed">Hoàn thành</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="tomorrow">Ngày mai</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={onRefresh} title="Làm mới">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đặt chỗ</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Biển số xe</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Thời gian đặt</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Không có đặt chỗ nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onBookingClick?.(booking)}
                  >
                    <TableCell className="font-mono text-sm text-blue-600">
                      #{booking.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">{booking.user_name}</TableCell>
                    <TableCell className="font-bold">{booking.vehicle_license_plate}</TableCell>
                    <TableCell className="font-mono">{booking.slot_name}</TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {formatDateTime(booking.booking_start_time)}
                    </TableCell>
                    <TableCell className="text-gray-600">{booking.duration_hours}h</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(booking.duration_hours * 10000)}
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border', getStatusColor(booking.status))}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
