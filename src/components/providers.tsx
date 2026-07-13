'use client'

import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { ReactNode, useState, useEffect } from 'react'
import { Toaster, toast } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 1000, // 10 seconds
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 1,
            throwOnError: false,
            // No global polling — real-time views opt in per-query via
            // `refetchInterval: REFRESH_INTERVAL` so static data (RBAC, configs,
            // audit logs) isn't re-fetched every 10s.
          },
        },
      })
  )

  // MSW is only needed when talking to mocks (no real API base). In production the
  // import is skipped and we start ready — no first-paint "initializing" flash.
  const needsMocking = !process.env.NEXT_PUBLIC_API_BASE
  const [mockingReady, setMockingReady] = useState(!needsMocking)

  useEffect(() => {
    if (!needsMocking) return
    let active = true
    import('@/mocks')
      .then(({ initMocks }) => initMocks())
      .then(() => {
        if (active) setMockingReady(true)
      })
    return () => {
      active = false
    }
  }, [needsMocking])

  if (!mockingReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Đang khởi tạo...</p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
