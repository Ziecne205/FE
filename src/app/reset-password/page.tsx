'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthShell } from '@/components/auth/AuthShell'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

// useSearchParams requires a Suspense boundary during prerender in the App Router.
function ResetPasswordInner() {
  const params = useSearchParams()
  return <ResetPasswordForm token={params.get('token')} />
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      heading="Đặt lại mật khẩu"
      subheading="Tạo mật khẩu mới để tiếp tục sử dụng hệ thống."
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Đặt lại mật khẩu</h2>
        <p className="text-sm text-gray-600">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>
      <Suspense fallback={null}>
        <ResetPasswordInner />
      </Suspense>
    </AuthShell>
  )
}
