// Single API seam. Components/hooks call apiFetch — switching from MSW mocks to the
// real Spring Boot backend is just setting NEXT_PUBLIC_API_BASE (no component changes).
import { normalizeSpringBootError, type AppError } from './errors'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api'

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/**
 * Typed fetch wrapper.
 * - Prefixes API_BASE, JSON-encodes the body, sets JSON headers.
 * - On failure throws a normalized {@link AppError} (handles the
 *   `{success,message,errorCode}` envelope and the Spring Boot default shape).
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  let res: Response
  try {
    res = await fetch(url, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (networkError) {
    throw normalizeSpringBootError(networkError)
  }

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    throw normalizeSpringBootError(payload ?? res)
  }
  return payload as T
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) => apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  del: <T>(path: string, options?: ApiOptions) => apiFetch<T>(path, { ...options, method: 'DELETE' }),
}

export type { AppError }
