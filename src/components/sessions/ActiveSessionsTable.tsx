'use client';

import { useState } from 'react';
import { Search, RefreshCw, Download, MoreVertical } from 'lucide-react';
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
import { formatDateTime, formatDuration, formatCurrency, calculateDuration } from '@/lib/utils';
import type { ActiveSessionWithDetails } from '@/types';

interface ActiveSessionsTableProps {
  sessions: ActiveSessionWithDetails[];
  onRefresh?: () => void;
  onExport?: () => void;
  onSessionClick?: (session: ActiveSessionWithDetails) => void;
}

export function ActiveSessionsTable({
  sessions,
  onRefresh,
  onExport,
  onSessionClick,
}: ActiveSessionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.license_plate
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesFloor =
      floorFilter === 'all' ||
      session.slot_name.startsWith(`F${floorFilter}-`);

    const matchesZone =
      zoneFilter === 'all' ||
      session.slot_name.includes(`-${zoneFilter}-`);

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'booking' && session.booking_id) ||
      (typeFilter === 'walkin' && !session.booking_id);

    return matchesSearch && matchesFloor && matchesZone && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm theo biển số xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tất cả tầng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tầng</SelectItem>
              <SelectItem value="1">Tầng 1</SelectItem>
              <SelectItem value="2">Tầng 2</SelectItem>
              <SelectItem value="-1">Tầng hầm</SelectItem>
            </SelectContent>
          </Select>

          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mọi khu vực" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi khu vực</SelectItem>
              <SelectItem value="A">Khu A</SelectItem>
              <SelectItem value="B">Khu B</SelectItem>
              <SelectItem value="C">Khu C</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Mọi loại hình" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi loại hình</SelectItem>
              <SelectItem value="booking">Có đặt chỗ</SelectItem>
              <SelectItem value="walkin">Không đặt chỗ</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Export Button */}
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
                <TableHead>Biển số xe</TableHead>
                <TableHead>Vị trí (Slot)</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giờ vào</TableHead>
                <TableHead>Thời gian đỗ</TableHead>
                <TableHead className="text-right">Phí tạm tính</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Không có phiên hoạt động nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onSessionClick?.(session)}
                  >
                    <TableCell className="font-bold text-blue-600">
                      {session.license_plate}
                    </TableCell>
                    <TableCell>
                      <a
                        href="#"
                        className="text-blue-600 font-mono hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {session.slot_name}
                      </a>
                    </TableCell>
                    <TableCell>
                      {session.booking_id ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 uppercase">
                          Đặt chỗ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase">
                          Walk-in
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDateTime(session.entry_time)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDuration(session.current_duration_minutes)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-900">
                      {formatCurrency(session.estimated_price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionClick?.(session);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredSessions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredSessions.length} phiên hoạt động
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
