import { create } from 'zustand'
import { Exception, ExceptionType } from '@/types'

interface ExceptionState {
  exceptions: Exception[]
  setExceptions: (exceptions: Exception[]) => void
  addException: (exception: Exception) => void
  resolveException: (exceptionId: string, resolvedBy: string) => void
  getOpenExceptions: () => Exception[]
  getExceptionsByType: (type: ExceptionType) => Exception[]
}

export const useExceptionStore = create<ExceptionState>((set, get) => ({
  exceptions: [],

  setExceptions: (exceptions: Exception[]) => set({ exceptions }),

  addException: (exception: Exception) => {
    set((state) => ({
      exceptions: [...state.exceptions, exception],
    }))
  },

  resolveException: (exceptionId: string, resolvedBy: string) => {
    set((state) => ({
      exceptions: state.exceptions.map((exception) =>
        exception.id === exceptionId
          ? {
              ...exception,
              status: 'Resolved' as const,
              resolved_by: resolvedBy,
              resolved_at: new Date().toISOString(),
            }
          : exception
      ),
    }))
  },

  getOpenExceptions: () => {
    const { exceptions } = get()
    return exceptions.filter((exception) => exception.status === 'Open')
  },

  getExceptionsByType: (type: ExceptionType) => {
    const { exceptions } = get()
    return exceptions.filter((exception) => exception.exception_type === type)
  },
}))
