'use client'

import { AuthShell } from '@/components/auth/AuthShell'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      heading="Khôi phục tài khoản"
      subheading="Lấy lại quyền truy cập vào hệ thống quản lý bãi đỗ xe."
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quên mật khẩu?</h2>
        <p className="text-sm text-gray-600">
          Nhập tên đăng nhập, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu tới thông tin liên hệ
          đã đăng ký.
        </p>
      </div>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
