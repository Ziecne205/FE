import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'

// Self-service password recovery for every actor (Manager/Staff/Driver — Admins are
// reset by another Admin via /admin/users/{id}/reset-password). Proposed BE contract
// lives in docs/handoff-forgot-password.md; MSW mocks it until the backend ships.

export interface ForgotPasswordResponse {
  /** Generic confirmation — BE never reveals whether the account exists (anti-enumeration). */
  message?: string
  /**
   * DEV/MOCK ONLY. The real backend delivers the reset token out-of-band (email/SMS)
   * and MUST NOT return it in the response. The mock surfaces it so the flow is testable.
   */
  devResetToken?: string
}

/** POST /auth/forgot-password — request a reset token for a username. Always succeeds. */
export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, AppError, { username: string }>({
    mutationFn: ({ username }) =>
      api.post<ForgotPasswordResponse>('/auth/forgot-password', { username }),
    onError: (e) => toast.error(e.message),
  })
}

/** POST /auth/reset-password — set a new password with a valid reset token. */
export function useResetPassword() {
  return useMutation<void, AppError, { token: string; newPassword: string }>({
    mutationFn: ({ token, newPassword }) =>
      api.post<void>('/auth/reset-password', { token, newPassword }),
    onError: (e) => toast.error(e.message),
  })
}
