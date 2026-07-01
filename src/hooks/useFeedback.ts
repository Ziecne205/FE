import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type AppError } from '@/lib/api'

/** BE FeedbackRequest (DriverController) — POST /driver/feedbacks. */
export interface FeedbackInput {
  sessionId: number
  rating: number // 1–5
  comment?: string
}

/** BE feedback record trả về sau khi tạo. */
export interface FeedbackRecord {
  feedbackId: number
  rating: number
  comment?: string
  createdAt: string
}

/** Gửi đánh giá phiên đỗ xe — POST /driver/feedbacks. */
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (data: FeedbackInput) => api.post<FeedbackRecord>('/driver/feedbacks', data),
    onSuccess: () => toast.success('Cảm ơn bạn đã đánh giá!'),
    onError: (error: AppError) => toast.error(error.message),
  })
}
