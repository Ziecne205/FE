# API Routes Structure

This directory contains Next.js API route handlers that will be used when connecting to the Java Spring Boot backend.

## Current Status

**Mock Mode (Development):** Currently using MSW (Mock Service Worker) for API mocking. All requests are intercepted by MSW handlers in `src/mocks/handlers.ts`.

**Future (Production):** These route handlers will proxy requests to the Java Spring Boot backend.

## Directory Structure

```
src/app/api/
├── slots/           # Slot management endpoints
├── sessions/        # Parking session endpoints
├── bookings/        # Booking management endpoints
├── exceptions/      # Exception handling endpoints
└── auth/            # Authentication endpoints
```

## REST API Endpoints

### Slots
- `GET /api/slots` - List all slots
- `GET /api/slots/[id]` - Get slot by ID
- `PATCH /api/slots/[id]` - Update slot status

### Sessions
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/active` - List active sessions
- `POST /api/sessions` - Create new session (manual entry)

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/[id]` - Update booking status

### Exceptions
- `GET /api/exceptions` - List all exceptions
- `PATCH /api/exceptions/[id]/resolve` - Resolve exception

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## Migration Plan

When connecting to Spring Boot backend:

1. **Keep MSW for development** - Useful for frontend development without backend
2. **Add API route handlers** - Proxy requests to Spring Boot in production
3. **Environment variables** - Configure backend URL via `.env`
4. **Error handling** - Map Spring Boot errors to frontend format
5. **Authentication** - Handle JWT tokens from Spring Boot

## Example Route Handler

```typescript
// src/app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // In production, proxy to Spring Boot
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
  
  try {
    const response = await fetch(`${backendUrl}/api/slots`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    )
  }
}
```

## Notes

- MSW intercepts requests in development mode only
- API routes follow Next.js App Router conventions
- All routes use TypeScript for type safety
- Error responses follow consistent format
