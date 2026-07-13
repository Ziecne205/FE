# Handoff — Self-service password reset (`/auth/forgot-password`, `/auth/reset-password`)

**To:** Backend team
**From:** Frontend
**Status:** Frontend implemented against the proposed contract below and mocked via MSW. **Non-functional against the real API until these two endpoints exist.**

## Why

Today the only password reset in the system is `PATCH /admin/users/{id}/reset-password` — an Admin resetting *someone else's* password. Every other actor (Manager, Staff, Driver) has **no recovery path** if they forget their password. This adds self-service recovery for those actors. (Admins remain reset-by-another-Admin.)

The FE flow is already built and wired:
- `/forgot-password` — request a reset (by username)
- `/reset-password?token=…` — set a new password with the token
- "Quên mật khẩu?" on the login page links to `/forgot-password`

It talks to the two endpoints below. Both are **public** (no auth), like `/auth/login` and `/auth/register`. Responses use the standard envelope `{ success, message, data, errorCode }`.

---

## 1. `POST /auth/forgot-password`

Request a reset token for an account.

**Request**
```json
{ "username": "manager@parking.vn" }
```

**Response — always `200`, always generic** (regardless of whether the account exists):
```json
{
  "success": true,
  "message": "Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.",
  "data": { "message": "…" }
}
```

**Behavior**
- Look up the account by `username`. If it exists, generate a **single-use, time-limited** reset token (recommend TTL ~15 min) and deliver it **out-of-band** (email/SMS to the account's registered contact).
- **Anti-enumeration:** never reveal whether the account exists — same 200 + message either way. Do not vary status code or timing meaningfully.
- **Do NOT return the token in the response.** (The MSW mock returns a `data.devResetToken` for local testing only; the FE reads it solely to make the demo flow clickable. The real backend must omit it.)
- Recommend rate-limiting per username/IP to prevent abuse.

---

## 2. `POST /auth/reset-password`

Consume a token and set a new password.

**Request**
```json
{ "token": "<opaque reset token>", "newPassword": "newSecret123" }
```

**Response — success (`200`)**
```json
{ "success": true, "message": "Đặt lại mật khẩu thành công", "data": null }
```

**Response — failure (`400`)** — envelope with `success:false` and an `errorCode`:

| Condition                          | `errorCode`        | Suggested `message`                               |
|------------------------------------|--------------------|---------------------------------------------------|
| Token missing/invalid/used/expired | `INVALID_TOKEN`    | `Liên kết đặt lại không hợp lệ hoặc đã hết hạn`    |
| Password fails policy              | `VALIDATION_ERROR` | `Mật khẩu phải có ít nhất 6 ký tự`                |

**Behavior**
- Validate the token (exists, not expired, not already used, matches an account).
- Enforce the password policy (FE currently requires **6–50 chars**; align server-side and tighten as needed).
- On success: update the password hash, **invalidate the token** (single use), and ideally invalidate the account's existing sessions/JWTs.

---

## FE ↔ error-code mapping

The FE surfaces `message` from the envelope directly in a toast, so any human-readable `message` works. `errorCode` is used for programmatic mapping ([src/lib/errors.ts](../src/lib/errors.ts)); `TOKEN_EXPIRED` already exists there — reuse it instead of `INVALID_TOKEN` if you prefer, and the FE will map it. Either is fine.

## Where this lives on the FE

- Hook: [src/hooks/usePasswordReset.ts](../src/hooks/usePasswordReset.ts)
- UI: [src/components/auth/ForgotPasswordForm.tsx](../src/components/auth/ForgotPasswordForm.tsx), [src/components/auth/ResetPasswordForm.tsx](../src/components/auth/ResetPasswordForm.tsx)
- Pages: `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`
- Mock (delete-me once real endpoints ship): the two `/api/auth/*-password` handlers in [src/mocks/handlers.ts](../src/mocks/handlers.ts)

## Open questions for backend

1. **Identifier:** request by `username` (assumed here, since it's the guaranteed identifier and matches login). Switch to `email` if you prefer — but note staff/manager accounts may not have an email on file.
2. **Delivery channel:** email, SMS, or both? Determines what contact info must be mandatory at registration.
3. **Token format/TTL:** confirm TTL and whether the token is opaque (recommended) vs. a signed JWT.
