'use client'

import { Car } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuthStore()

  async function handleRegister(data: {
    username: string
    fullName: string
    email?: string
    phone?: string
    password: string
  }) {
    try {
      await register(data)
      router.push('/dashboard')
    } catch {
      // Errors are toasted inside the store action
    }
  }

  return (
    <div className="h-screen w-full overflow-auto flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-blue-500 to-blue-800 flex-col justify-between p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="z-10 mt-8">
          <span className="text-white text-2xl font-bold">ParkFlow Pro</span>
          <h1 className="mt-6 text-4xl font-bold text-white mb-4">Tạo tài khoản mới</h1>
          <p className="text-lg text-blue-100">Đăng ký để đặt chỗ đỗ xe trực tuyến nhanh chóng.</p>
        </div>
        <div className="z-10 mb-8 relative">
          <div className="absolute -right-20 -bottom-20 opacity-20 transform rotate-12 scale-150">
            <Car className="w-48 h-48 text-white" strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-3/5 bg-white flex flex-col justify-center items-center p-6 sm:p-10 relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <span className="text-blue-600 text-xl font-bold">ParkFlow Pro</span>
        </div>

        <div className="w-full max-w-[440px]">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Đăng ký tài khoản</h2>
            <p className="text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>

          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-gray-500 font-mono">© 2026 ParkFlow Pro. Phiên bản 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
