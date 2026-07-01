# Auth & Public APIs

Endpoints handling authentication, registration, and public parking info.

**Envelope Convention:**
All endpoints (except `/api/auth/**`, Webhooks, and Swagger) wrap responses in a standard envelope:
```json
{
  "success": true,
  "message": "OK",
  "data": { ... },
  "errorCode": null
}
```
*Note: The structures below represent the inner `data` payload.*

---

## `POST /auth/login`
- **Request:**
  ```json
  {
    "username": "driver1", // or email
    "password": "password123",
    "rememberMe": false
  }
  ```
- **Response:**
  ```json
  {
    "token": "eyJhbGci...",
    "role": "Driver",
    "user": {
      "userId": 1,
      "username": "driver1",
      "fullName": "Nguyen Van A",
      "email": "driver@test.com",
      "phone": "0912345678"
    }
  }
  ```

## `POST /auth/register`
- **Request:**
  ```json
  {
    "username": "driver1",
    "password": "password123",
    "fullName": "Nguyen Van A",
    "phoneNumber": "0912345678",
    "email": "driver@test.com",
    "roleName": "Driver"
  }
  ```
- **Response:** Same as `/auth/login`.

## `GET /driver/parking-info` (Public)
- **Request:** None
- **Response:**
  ```json
  {
    "parkingName": "ParkFlow",
    "operatingHours": "24/7",
    "totalAvailableSlots": 120,
    "availabilityByVehicleType": [...],
    "pricingPolicies": [...]
  }
  ```
