'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ExceptionWithDetails } from '@/types';

// Validation schema
const resolveExceptionSchema = z.object({
  resolution_notes: z
    .string()
    .min(1, 'Ghi chú giải quyết không được để trống')
    .min(10, 'Ghi chú giải quyết phải có ít nhất 10 ký tự')
    .max(500, 'Ghi chú giải quyết không được quá 500 ký tự'),
});

type ResolveExceptionFormData = z.infer<typeof resolveExceptionSchema>;

interface ResolveExceptionModalProps {
  open: boolean;
  onClose: () => void;
  exception: ExceptionWithDetails | null;
  onSubmit: (exceptionId: string, notes: string) => Promise<void>;
}

export function ResolveExceptionModal({
  open,
  onClose,
  exception,
  onSubmit,
}: ResolveExceptionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResolveExceptionFormData>({
    resolver: zodResolver(resolveExceptionSchema),
  });

  const handleFormSubmit = async (data: ResolveExceptionFormData) => {
    if (!exception) return;

    await onSubmit(exception.id, data.resolution_notes);
    toast.success('Giải quyết ngoại lệ thành công');
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!exception) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Giải quyết ngoại lệ</DialogTitle>
          <DialogDescription>
            Thêm ghi chú về cách giải quyết ngoại lệ này
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Exception Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mã ngoại lệ:</span>
              <span className="font-mono font-medium">#{exception.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Biển số xe:</span>
              <span className="font-bold">{exception.session_license_plate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Vị trí:</span>
              <span className="font-mono">{exception.slot_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Loại ngoại lệ:</span>
              <span className="font-medium">{getExceptionTypeLabel(exception.exception_type)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Mô tả:</span>
              <p className="mt-1 text-gray-900">{exception.description}</p>
            </div>
          </div>

          {/* Resolution Notes */}
          <div className="space-y-2">
            <Label htmlFor="resolution_notes">
              Ghi chú giải quyết <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="resolution_notes"
              placeholder="Nhập ghi chú về cách giải quyết ngoại lệ này..."
              rows={5}
              {...register('resolution_notes')}
              className={errors.resolution_notes ? 'border-red-500' : ''}
            />
            {errors.resolution_notes && (
              <p className="text-sm text-red-500">{errors.resolution_notes.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Tối thiểu 10 ký tự, tối đa 500 ký tự
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Giải quyết'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getExceptionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    WrongSlot: 'Sai vị trí',
    AIFailure: 'Lỗi AI',
    PaymentFailure: 'Lỗi thanh toán',
    Overtime: 'Quá giờ',
  };
  return labels[type] || type;
}
