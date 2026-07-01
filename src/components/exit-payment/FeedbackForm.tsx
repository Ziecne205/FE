'use client'

import { useState } from 'react'
import { Star, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSubmitFeedback } from '@/hooks/useFeedback'

interface FeedbackFormProps {
  readonly sessionId: string
}

/** Đánh giá nhanh trải nghiệm gửi xe — hiển thị sau khi thanh toán cổng ra thành công. */
export function FeedbackForm({ sessionId }: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { mutate, isPending } = useSubmitFeedback()

  const numericSessionId = Number(sessionId)
  const canSubmit = rating > 0 && Number.isFinite(numericSessionId) && !isPending

  function handleSubmit() {
    if (!canSubmit) return
    mutate(
      { sessionId: numericSessionId, rating, comment: comment.trim() || undefined },
      { onSuccess: () => setSubmitted(true) },
    )
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        Cảm ơn bạn đã đánh giá!
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm">
      <p className="mb-2 text-sm font-medium text-gray-700">Đánh giá trải nghiệm gửi xe</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} sao`}
            onClick={() => setRating(value)}
            className="p-0.5"
          >
            <Star
              className={`h-6 w-6 ${
                value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        className="mt-3 text-sm"
        placeholder="Nhận xét thêm (không bắt buộc)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      <Button className="mt-3 w-full" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
        {isPending ? 'Đang gửi…' : 'Gửi đánh giá'}
      </Button>
    </div>
  )
}
