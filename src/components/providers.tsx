'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState, useEffect } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 1000, // 10 seconds - matches real-time update interval
            refetchInterval: 10 * 1000, // Auto-refetch every 10 seconds
            refetchOnWindowFocus: true,
            refetchOnMount: true, // Always refetch on mount
            refetchOnReconnect: true,
            retry: 1,
          },
        },
      })
  )

  const [mockingEnabled, setMockingEnabled] = useState(false)

  useEffect(() => {
    async function enableMocking() {
      if (process.env.NODE_ENV === 'development') {
        const { initMocks } = await import('@/mocks')
        await initMocks()
        setMockingEnabled(true)
      } else {
        setMockingEnabled(true)
      }
    }

    enableMocking()
  }, [])

  if (!mockingEnabled) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
