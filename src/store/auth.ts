import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fields: { fullName: string; phone: string; email: string; password: string; licensePlate?: string }) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          if (!res.ok) throw new Error('Login failed')
          const { user: u, token } = await res.json()
          const mockUser: User = {
            id: u.id,
            email: u.email,
            phone: u.phone ?? '',
            full_name: u.full_name,
            role: u.role as User['role'],
            facility_id: u.facility_id,
          }
          if (token) sessionStorage.setItem('token', token)
          set({ user: mockUser, isAuthenticated: true, isLoading: false })
          toast.success('Đăng nhập thành công')
        } catch (error) {
          set({ isLoading: false })
          toast.error('Đăng nhập thất bại')
          throw error
        }
      },

      register: async (fields) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...fields, role: 'Driver' }),
          })
          if (!res.ok) throw new Error('Register failed')
          const { user: u, token } = await res.json()
          const mockUser: User = {
            id: u.id,
            email: u.email,
            phone: u.phone ?? '',
            full_name: u.full_name,
            role: 'Driver',
          }
          if (token) sessionStorage.setItem('token', token)
          set({ user: mockUser, isAuthenticated: true, isLoading: false })
          toast.success('Đăng ký thành công')
        } catch (error) {
          set({ isLoading: false })
          toast.error('Đăng ký thất bại')
          throw error
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        toast.success('Đăng xuất thành công')
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
