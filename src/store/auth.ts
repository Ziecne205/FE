import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
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
          // Mock login - will be replaced with real API call
          const mockUser: User = {
            id: '1',
            email,
            phone: '0123456789',
            full_name: email.includes('manager') ? 'Nguyễn Văn A' : 'Trần Thị B',
            role: email.includes('manager') ? 'Manager' : 'Staff',
            facility_id: 'facility-1',
          }

          set({ user: mockUser, isAuthenticated: true, isLoading: false })
          toast.success('Đăng nhập thành công')
        } catch (error) {
          set({ isLoading: false })
          toast.error('Đăng nhập thất bại')
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
