'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResetPassword } from '@/hooks/usePasswordReset'

const schema = z
  .object({
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được quá 50 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
type FormData = z.infer<typeof schema>

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter()
  const reset = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  // Missing/blank token → link was malformed or manually visited.
  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </div>
        <Link
          href="/forgot-password"
          className="block text-center text-sm text-blue-600 hover:underline"
        >
          Yêu cầu liên kết mới
        </Link>
      </div>
    )
  }

  const onSubmit = (data: FormData) => {
    reset.mutate(
      { token, newPassword: data.password },
      {
        onSuccess: () => {
          toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập lại')
          router.push('/login')
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="rp-password" className="block text-sm font-medium text-gray-900 mb-2">
          Mật khẩu mới
        </Label>
        <div className="relative">
          <Input
            id="rp-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={reset.isPending}
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            disabled={reset.isPending}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="rp-confirm" className="block text-sm font-medium text-gray-900 mb-2">
          Xác nhận mật khẩu mới
        </Label>
        <Input
          id="rp-confirm"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          disabled={reset.isPending}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={reset.isPending}>
        {reset.isPending ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
      </Button>

      <Link href="/login" className="block text-center text-sm text-blue-600 hover:underline">
        Quay lại đăng nhập
      </Link>
    </form>
  )
}
