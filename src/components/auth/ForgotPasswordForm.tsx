'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/hooks/usePasswordReset'

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
})
type FormData = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const forgot = useForgotPassword()
  const [submitted, setSubmitted] = useState(false)
  const [devToken, setDevToken] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '' },
  })

  const onSubmit = (data: FormData) => {
    forgot.mutate(
      { username: data.username },
      {
        onSuccess: (res) => {
          setSubmitted(true)
          setDevToken(res?.devResetToken)
        },
      },
    )
  }

  // Generic confirmation — shown regardless of whether the account exists.
  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Nếu tài khoản tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới thông tin liên hệ
          đã đăng ký.
        </div>
        {devToken && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <p className="mb-1 font-semibold">DEV/MOCK — liên kết thử nghiệm:</p>
            <Link
              href={`/reset-password?token=${encodeURIComponent(devToken)}`}
              className="font-mono break-all text-blue-600 hover:underline"
            >
              /reset-password?token={devToken}
            </Link>
          </div>
        )}
        <Link href="/login" className="block text-center text-sm text-blue-600 hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="fp-username" className="block text-sm font-medium text-gray-900 mb-2">
          Tên đăng nhập
        </Label>
        <Input
          id="fp-username"
          type="text"
          placeholder="vd: manager@parking.vn"
          disabled={forgot.isPending}
          {...register('username')}
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={forgot.isPending}>
        {forgot.isPending ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại'}
      </Button>

      <Link href="/login" className="block text-center text-sm text-blue-600 hover:underline">
        Quay lại đăng nhập
      </Link>
    </form>
  )
}
