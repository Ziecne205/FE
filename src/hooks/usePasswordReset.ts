import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'

// Self-service password recovery via OTP (Manager/Staff/Driver — Admins are reset by
// another Admin via /admin/users/{id}/reset-password). Flow:
//   1) POST /auth/forgot-password { identifier } → BE emails a 6-digit OTP, returns the
//      masked email (data) so the UI can say "sent to n***@gmail.com".
//   2) POST /auth/reset-password { otp, newPassword } → sets the new password.

/** POST /auth/forgot-password — request an OTP. Returns the masked email it was sent to. */
export function useForgotPassword() {
  return useMutation<string, AppError, { identifier: string }>({
    mutationFn: ({ identifier }) =>
      api.post<string>('/auth/forgot-password', { identifier }),
    onError: (e) => toast.error(e.message),
  })
}

/** POST /auth/reset-password — set a new password with a valid OTP. */
export function useResetPassword() {
  return useMutation<void, AppError, { otp: string; newPassword: string }>({
    mutationFn: ({ otp, newPassword }) =>
      api.post<void>('/auth/reset-password', { otp, newPassword }),
    onError: (e) => toast.error(e.message),
  })
}
