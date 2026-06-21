'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { DriverAuth } from '@/components/driver/auth'

export default function DriverAuthPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Driver') {
      router.replace('/driver')
    }
  }, [isAuthenticated, user, router])

  return <DriverAuth />
}
