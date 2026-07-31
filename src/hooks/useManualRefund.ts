import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface ManualRefundResponse {
  id: string;
  reservationId: string;
  licensePlate: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  depositAmount: number;
  reason: string;
  bankInfo: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
}

export function useAllRefundRequests() {
  return useQuery({
    queryKey: ["allRefundRequests"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ManualRefundResponse[] }>(
        "/manager/manual-refunds"
      );
      return response.data.data;
    },
  });
}

export function useMarkRefundProcessed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<{ data: ManualRefundResponse }>(
        `/manager/manual-refunds/${id}/mark-processed`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRefundRequests"] });
    },
  });
}
