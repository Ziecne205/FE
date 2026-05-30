'use client';

import { useState } from 'react';
import { Search, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
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
import { formatDateTime } from '@/lib/utils';
import { EXCEPTION_TYPE_LABELS } from '@/lib/constants';
import type { ExceptionWithDetails, ExceptionType, ExceptionStatus } from '@/types';
import { cn, getStatusColor } from '@/lib/utils';

interface ExceptionHandlingProps {
  exceptions: ExceptionWithDetails[];
  onRefresh?: () => void;
  onExceptionClick?: (exception: ExceptionWithDetails) => void;
  onResolve?: (exceptionId: string) => void;
  userRole: 'Manager' | 'Staff';
}

export function ExceptionHandling({
  exceptions,
  onRefresh,
  onExceptionClick,
  onResolve,
  userRole,
}: ExceptionHandlingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ExceptionType | 'all'>('all');

  // Filter exceptions
  const filteredExceptions = exceptions.filter((exception) => {
    const matchesSearch =
      exception.session_license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exception.slot_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || exception.status === statusFilter;
    const matchesType = typeFilter === 'all' || exception.exception_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Stats
  const stats = {
    total: exceptions.length,
    open: exceptions.filter((e) => e.status === 'Open').length,
    resolved: exceptions.filter((e) => e.status === 'Resolved').length,
    wrongSlot: exceptions.filter((e) => e.exception_type === 'WrongSlot').length,
    aiFailure: exceptions.filter((e) => e.exception_type === 'AIFailure').length,
    paymentFailure: exceptions.filter((e) => e.exception_type === 'PaymentFailure').length,
    overtime: exceptions.filter((e) => e.exception_type === 'Overtime').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Xử lý Ngoại lệ</h2>
          <p className="text-sm text-gray-600">Theo dõi và giải quyết các sự cố hệ thống</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Tổng số</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-red-500">
          <div className="text-sm text-gray-600 mb-1">Chưa xử lý</div>
          <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <div className="text-sm text-gray-600 mb-1">Đã xử lý</div>
          <div className="text-2xl font-bold text-gray-900">{stats.resolved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Đỗ sai vị trí</div>
          <div className="text-2xl font-bold text-gray-900">{stats.wrongSlot}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Lỗi AI</div>
          <div className="text-2xl font-bold text-gray-900">{stats.aiFailure}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Quá giờ</div>
          <div className="text-2xl font-bold text-gray-900">{stats.overtime}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm theo biển số, vị trí..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ExceptionStatus | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Open">Chưa xử lý</SelectItem>
              <SelectItem value="Resolved">Đã xử lý</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ExceptionType | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Loại ngoại lệ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="WrongSlot">Đỗ sai vị trí</SelectItem>
              <SelectItem value="AIFailure">Lỗi AI Camera</SelectItem>
              <SelectItem value="PaymentFailure">Lỗi thanh toán</SelectItem>
              <SelectItem value="Overtime">Quá giờ</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={onRefresh} title="Làm mới">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại ngoại lệ</TableHead>
                <TableHead>Biển số xe</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExceptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Không có ngoại lệ nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredExceptions.map((exception) => (
                  <TableRow
                    key={exception.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onExceptionClick?.(exception)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium">
                          {EXCEPTION_TYPE_LABELS[exception.exception_type]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{exception.session_license_plate}</TableCell>
                    <TableCell className="font-mono">{exception.slot_name}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {exception.description}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {formatDateTime(exception.created_at)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                          getStatusColor(exception.status)
                        )}
                      >
                        {exception.status === 'Open' ? 'Chưa xử lý' : 'Đã xử lý'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {exception.status === 'Open' && onResolve && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolve(exception.id);
                          }}
                          className="gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Xử lý
                        </Button>
                      )}
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
