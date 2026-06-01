'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { LoginPage } from '@/components/auth/LoginPage'

export default function Login() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return <LoginPage onLogin={handleLogin} />
}
