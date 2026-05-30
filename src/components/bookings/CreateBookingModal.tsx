'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Slot } from '@/types';

// Validation schema
const bookingSchema = z.object({
  customer_name: z
    .string()
    .min(1, 'Tên khách hàng không được để trống')
    .min(2, 'Tên khách hàng phải có ít nhất 2 ký tự')
    .max(100, 'Tên khách hàng không được quá 100 ký tự'),
  customer_phone: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
  customer_email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  license_plate: z
    .string()
    .min(1, 'Biển số xe không được để trống')
    .regex(/^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/, 'Biển số xe không hợp lệ (VD: 29A-12345)'),
  slot_id: z.string().min(1, 'Vui lòng chọn vị trí đỗ xe'),
  booking_start: z
    .string()
    .min(1, 'Thời gian bắt đầu không được để trống')
    .refine((val) => {
      const date = new Date(val);
      return date > new Date();
    }, 'Thời gian bắt đầu phải sau thời điểm hiện tại'),
  booking_end: z
    .string()
    .min(1, 'Thời gian kết thúc không được để trống'),
}).refine((data) => {
  const start = new Date(data.booking_start);
  const end = new Date(data.booking_end);
  return end > start;
}, {
  message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
  path: ['booking_end'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface CreateBookingModalProps {
  open: boolean;
  onClose: () => void;
  availableSlots: Slot[];
  onSubmit: (data: BookingFormData) => Promise<void>;
}

export function CreateBookingModal({
  open,
  onClose,
  availableSlots,
  onSubmit,
}: CreateBookingModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedSlotId = watch('slot_id');

  const handleFormSubmit = async (data: BookingFormData) => {
    try {
      await onSubmit(data);
      toast.success('Tạo đặt chỗ thành công');
      reset();
      onClose();
    } catch (error) {
      toast.error('Không thể tạo đặt chỗ. Vui lòng thử lại.');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Get minimum datetime (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo đặt chỗ mới</DialogTitle>
          <DialogDescription>
            Điền thông tin khách hàng và chọn vị trí đỗ xe
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customer_name">
              Tên khách hàng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer_name"
              placeholder="Nguyễn Văn A"
              {...register('customer_name')}
              className={errors.customer_name ? 'border-red-500' : ''}
            />
            {errors.customer_name && (
              <p className="text-sm text-red-500">{errors.customer_name.message}</p>
            )}
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="customer_phone">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer_phone"
              placeholder="0912345678"
              {...register('customer_phone')}
              className={errors.customer_phone ? 'border-red-500' : ''}
            />
            {errors.customer_phone && (
              <p className="text-sm text-red-500">{errors.customer_phone.message}</p>
            )}
          </div>

          {/* Customer Email */}
          <div className="space-y-2">
            <Label htmlFor="customer_email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer_email"
              type="email"
              placeholder="example@email.com"
              {...register('customer_email')}
              className={errors.customer_email ? 'border-red-500' : ''}
            />
            {errors.customer_email && (
              <p className="text-sm text-red-500">{errors.customer_email.message}</p>
            )}
          </div>

          {/* License Plate */}
          <div className="space-y-2">
            <Label htmlFor="license_plate">
              Biển số xe <span className="text-red-500">*</span>
            </Label>
            <Input
              id="license_plate"
              placeholder="29A-12345"
              {...register('license_plate')}
              className={errors.license_plate ? 'border-red-500' : ''}
            />
            {errors.license_plate && (
              <p className="text-sm text-red-500">{errors.license_plate.message}</p>
            )}
          </div>

          {/* Slot Selection */}
          <div className="space-y-2">
            <Label htmlFor="slot_id">
              Vị trí đỗ xe <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedSlotId}
              onValueChange={(value) => setValue('slot_id', value, { shouldValidate: true })}
            >
              <SelectTrigger className={errors.slot_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn vị trí đỗ xe" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">Không có vị trí trống</div>
                ) : (
                  availableSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.slot_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.slot_id && (
              <p className="text-sm text-red-500">{errors.slot_id.message}</p>
            )}
          </div>

          {/* Booking Start Time */}
          <div className="space-y-2">
            <Label htmlFor="booking_start">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="booking_start"
              type="datetime-local"
              min={getMinDateTime()}
              {...register('booking_start')}
              className={errors.booking_start ? 'border-red-500' : ''}
            />
            {errors.booking_start && (
              <p className="text-sm text-red-500">{errors.booking_start.message}</p>
            )}
          </div>

          {/* Booking End Time */}
          <div className="space-y-2">
            <Label htmlFor="booking_end">
              Thời gian kết thúc <span className="text-red-500">*</span>
            </Label>
            <Input
              id="booking_end"
              type="datetime-local"
              min={getMinDateTime()}
              {...register('booking_end')}
              className={errors.booking_end ? 'border-red-500' : ''}
            />
            {errors.booking_end && (
              <p className="text-sm text-red-500">{errors.booking_end.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || availableSlots.length === 0}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo đặt chỗ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
