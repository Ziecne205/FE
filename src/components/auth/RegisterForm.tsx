'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const registerSchema = z
  .object({
    username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{9,15}$/, 'Số điện thoại không hợp lệ')
      .optional()
      .or(z.literal('')),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSubmit: (data: {
    username: string
    fullName: string
    email?: string
    phone?: string
    password: string
  }) => void
  isLoading?: boolean
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  const onFormSubmit = (data: RegisterFormData) => {
    onSubmit({
      username: data.username,
      fullName: data.fullName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      password: data.password,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Username */}
      <div>
        <Label htmlFor="reg-username" className="block text-sm font-medium text-gray-900 mb-1">
          Tên đăng nhập <span className="text-red-500">*</span>
        </Label>
        <Input id="reg-username" type="text" placeholder="vd: driver_nguyen" disabled={isLoading} {...register('username')} />
        {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
      </div>

      {/* Full Name */}
      <div>
        <Label htmlFor="reg-fullname" className="block text-sm font-medium text-gray-900 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </Label>
        <Input id="reg-fullname" type="text" placeholder="Nguyễn Văn A" disabled={isLoading} {...register('fullName')} />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>

      {/* Email (optional) */}
      <div>
        <Label htmlFor="reg-email" className="block text-sm font-medium text-gray-900 mb-1">
          Email <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
        </Label>
        <Input id="reg-email" type="email" placeholder="example@email.com" disabled={isLoading} {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Phone (optional) */}
      <div>
        <Label htmlFor="reg-phone" className="block text-sm font-medium text-gray-900 mb-1">
          Số điện thoại <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
        </Label>
        <Input id="reg-phone" type="tel" placeholder="0912 345 678" disabled={isLoading} {...register('phone')} />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="reg-password" className="block text-sm font-medium text-gray-900 mb-1">
          Mật khẩu <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isLoading}
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <Label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-900 mb-1">
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isLoading}
            className="pr-10"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>
    </form>
  )
}
