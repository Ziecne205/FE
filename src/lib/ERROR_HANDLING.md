# Error Handling System

This document describes the error handling and normalization system for the Parking Management System frontend.

## Overview

The error normalizer converts Spring Boot error responses into a consistent `AppError` format that the frontend always expects. This ensures:
- Consistent error handling across the application
- User-friendly Vietnamese error messages
- Type-safe error handling with TypeScript
- Easy debugging with structured error details

## AppError Format

All errors in the frontend are normalized to this shape:

```typescript
interface AppError {
  status: number           // HTTP status code
  code: string            // Error code for programmatic handling
  message: string         // User-friendly message in Vietnamese
  details?: object        // Additional error details (optional)
  timestamp: string       // ISO timestamp
  path?: string          // Request path that caused the error
}
```

## Spring Boot Error Formats

### Standard Error Response
```json
{
  "timestamp": "2026-05-31T13:20:39.910Z",
  "status": 404,
  "error": "Not Found",
  "message": "Slot not found with id: slot-123",
  "path": "/api/slots/slot-123"
}
```

### Validation Error Response
```json
{
  "timestamp": "2026-05-31T13:20:39.910Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Validation failed",
  "path": "/api/bookings",
  "errors": [
    {
      "field": "license_plate",
      "rejectedValue": "ABC",
      "defaultMessage": "License plate must match format: 29A-12345",
      "objectName": "bookingRequest",
      "code": "Pattern"
    }
  ]
}
```

## Error Codes

The system defines error codes for common scenarios:

### Authentication & Authorization
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `TOKEN_EXPIRED` - JWT token expired
- `INVALID_CREDENTIALS` - Wrong email/password

### Validation
- `VALIDATION_ERROR` - Form validation failed
- `INVALID_INPUT` - Input format incorrect

### Resource
- `NOT_FOUND` - Resource doesn't exist
- `ALREADY_EXISTS` - Duplicate resource
- `CONFLICT` - Data conflict

### Business Logic
- `SLOT_NOT_AVAILABLE` - Parking slot unavailable
- `BOOKING_EXPIRED` - Booking time expired
- `SESSION_ACTIVE` - Session already active
- `INVALID_LICENSE_PLATE` - License plate format invalid

### Server
- `INTERNAL_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - Service down
- `NETWORK_ERROR` - Network connection failed

## Usage Examples

### In React Query Hooks

```typescript
import { normalizeSpringBootError, handleApiError } from '@/lib/errors'
import { toast } from 'sonner'

export function useSlots() {
  return useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const response = await fetch('/api/slots')
      if (!response.ok) {
        throw await handleApiError(response)
      }
      return response.json()
    },
    throwOnError: (error) => {
      const appError = normalizeSpringBootError(error)
      toast.error(appError.message)
      return false
    },
  })
}
```

### In Mutation Hooks

```typescript
export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBookingInput) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw await handleApiError(response)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Tạo đặt chỗ thành công')
    },
    onError: (error) => {
      const appError = normalizeSpringBootError(error)
      toast.error(appError.message)
      
      // Handle specific error codes
      if (appError.code === 'SLOT_NOT_AVAILABLE') {
        // Show slot selection modal again
      }
    },
  })
}
```

### In API Route Handlers

```typescript
// src/app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { normalizeSpringBootError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    
    const response = await fetch(`${backendUrl}/api/slots`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      const appError = normalizeSpringBootError(errorData)
      return NextResponse.json(appError, { status: appError.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const appError = normalizeSpringBootError(error)
    return NextResponse.json(appError, { status: appError.status })
  }
}
```

### Handling Validation Errors

```typescript
const appError = normalizeSpringBootError(error)

if (appError.code === 'VALIDATION_ERROR' && appError.details?.validationErrors) {
  // Display field-specific errors
  const validationErrors = appError.details.validationErrors as Array<{
    field: string
    message: string
    rejectedValue: unknown
  }>
  
  validationErrors.forEach(err => {
    console.log(`${err.field}: ${err.message}`)
  })
}
```

## Vietnamese Error Messages

All error codes have predefined Vietnamese messages:

| Error Code | Vietnamese Message |
|-----------|-------------------|
| UNAUTHORIZED | Vui lòng đăng nhập để tiếp tục |
| FORBIDDEN | Bạn không có quyền truy cập tài nguyên này |
| TOKEN_EXPIRED | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại |
| INVALID_CREDENTIALS | Email hoặc mật khẩu không đúng |
| VALIDATION_ERROR | Dữ liệu không hợp lệ |
| NOT_FOUND | Không tìm thấy tài nguyên |
| SLOT_NOT_AVAILABLE | Vị trí đỗ xe không khả dụng |
| INTERNAL_ERROR | Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau |
| NETWORK_ERROR | Lỗi kết nối mạng. Vui lòng kiểm tra kết nối |

## Error Mapping Logic

The normalizer uses multiple strategies to map Spring Boot errors:

1. **Message Pattern Matching** - Checks error message for keywords
   - "slot not available" → `SLOT_NOT_AVAILABLE`
   - "booking expired" → `BOOKING_EXPIRED`
   - "already exists" → `ALREADY_EXISTS`

2. **Error Type Matching** - Checks Spring Boot error type
   - "Unauthorized" → `UNAUTHORIZED`
   - "Forbidden" → `FORBIDDEN`

3. **Status Code Fallback** - Uses HTTP status code
   - 401 → `UNAUTHORIZED`
   - 404 → `NOT_FOUND`
   - 422 → `VALIDATION_ERROR`
   - 500 → `INTERNAL_ERROR`

## Testing

### Unit Test Example

```typescript
import { normalizeSpringBootError, ErrorCodes } from '@/lib/errors'

describe('normalizeSpringBootError', () => {
  it('should normalize Spring Boot 404 error', () => {
    const springError = {
      timestamp: '2026-05-31T13:20:39.910Z',
      status: 404,
      error: 'Not Found',
      message: 'Slot not found',
      path: '/api/slots/123',
    }

    const result = normalizeSpringBootError(springError)

    expect(result.status).toBe(404)
    expect(result.code).toBe(ErrorCodes.NOT_FOUND)
    expect(result.message).toBe('Không tìm thấy tài nguyên')
  })

  it('should normalize validation error', () => {
    const validationError = {
      timestamp: '2026-05-31T13:20:39.910Z',
      status: 422,
      error: 'Unprocessable Entity',
      message: 'Validation failed',
      path: '/api/bookings',
      errors: [
        {
          field: 'license_plate',
          rejectedValue: 'ABC',
          defaultMessage: 'Invalid format',
          objectName: 'bookingRequest',
          code: 'Pattern',
        },
      ],
    }

    const result = normalizeSpringBootError(validationError)

    expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR)
    expect(result.details?.validationErrors).toHaveLength(1)
  })
})
```

## Best Practices

1. **Always normalize errors** - Use `normalizeSpringBootError()` for all API errors
2. **Use error codes** - Check `appError.code` for programmatic handling
3. **Show user-friendly messages** - Display `appError.message` to users
4. **Log full errors** - Log complete `appError` object for debugging
5. **Handle validation errors** - Check `appError.details.validationErrors` for field-level errors
6. **Don't expose internal errors** - Never show raw Spring Boot errors to users

## Future Enhancements

- Add error retry logic for transient failures
- Implement error reporting/tracking (e.g., Sentry)
- Add error analytics dashboard
- Support multiple languages (English + Vietnamese)
- Add error recovery suggestions
