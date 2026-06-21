import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { User, VehicleType } from '@/types/model'
import type { SavedVehicle, AccountFormFields, AddVehicleFields } from '@/components/driver/profile/types'

interface ProfileResponse {
  user: User
  vehicles: SavedVehicle[]
}

export function useProfile(userId: string) {
  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ['profile', userId],
    queryFn: () => api.get<ProfileResponse>(`/users/${userId}`),
    enabled: !!userId,
  })

  const { data: vehicleTypes = [] } = useQuery<VehicleType[]>({
    queryKey: ['vehicle-types'],
    queryFn: () => api.get<VehicleType[]>('/vehicle-types'),
  })

  return {
    data: data?.user ?? { id: userId, email: '', fullName: '', role: 'Driver' as const },
    vehicles: data?.vehicles ?? [],
    vehicleTypes,
    isLoading,
  }
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AccountFormFields) =>
      api.put<User>(`/users/${userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      toast.success('Đã lưu thông tin')
    },
    onError: () => toast.error('Lưu thất bại'),
  })
}

export function useAddVehicle(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AddVehicleFields) =>
      api.post<SavedVehicle>(`/users/${userId}/vehicles`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      toast.success('Đã thêm xe')
    },
    onError: () => toast.error('Thêm xe thất bại'),
  })
}

export function useRemoveVehicle(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vehicleId: string) =>
      api.del<void>(`/users/${userId}/vehicles/${vehicleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      toast.success('Đã xóa xe')
    },
    onError: () => toast.error('Xóa xe thất bại'),
  })
}

// Convenience hook for the booking form plate dropdown
export function useSavedVehicles(userId: string) {
  return useQuery<SavedVehicle[]>({
    queryKey: ['profile', userId, 'vehicles'],
    queryFn: async () => {
      const res = await api.get<ProfileResponse>(`/users/${userId}`)
      return res.vehicles
    },
    enabled: !!userId,
  })
}
