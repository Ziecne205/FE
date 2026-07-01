# REST API Reference Guide

This document catalogs the complete REST API integration for the Parking Management System (Phase 4).

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

## 1. Auth & Public Module
*Endpoints handling authentication, registration, and public parking info.*

### `POST /auth/login`
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

### `POST /auth/register`
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

### `GET /driver/parking-info` (Public)
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

---

## 2. Driver Module
*Endpoints for driver apps to manage bookings, payments, and feedback.*

### `POST /driver/reservations`
- **Request:**
  ```json
  {
    "vehicleTypeId": 1,
    "licensePlate": "30G-123.45",
    "expectedEntryTime": "2026-07-02T08:00:00Z",
    "expectedExitTime": "2026-07-02T12:00:00Z"
  }
  ```
- **Response:**
  ```json
  {
    "reservationId": 1,
    "status": "Pending",
    "depositAmount": 50000
  }
  ```

### `GET /driver/reservations/my`
- **Request:** None
- **Response:** Array of reservations belonging to the authenticated driver.

### `PATCH /driver/reservations/{id}/cancel`
- **Request:** None
- **Response:** The cancelled reservation object.

### `POST /driver/reservations/{id}/confirm-deposit`
- **Request:** None
- **Response:** The confirmed reservation object.

### `POST /driver/payments/payos/create-link`
- **Request:**
  ```json
  {
    "type": "DEPOSIT",
    "id": 1 // reservationId
  }
  ```
- **Response:**
  ```json
  {
    "checkoutUrl": "https://pay.payos.vn/...",
    "orderCode": "123456789"
  }
  ```

### `POST /driver/payments/checkout` (Mock Flow)
- **Request:**
  ```json
  {
    "sessionId": 123,
    "amount": 15000
  }
  ```
- **Response:** `{ "checkoutUrl": "..." }`

### `POST /driver/feedbacks`
- **Request:**
  ```json
  {
    "sessionId": 123,
    "rating": 5,
    "comment": "Rất tốt"
  }
  ```
- **Response:** `void`

---

## 3. Staff Module (Operations)
*Endpoints for staff managing gates, sessions, and incident resolution.*

### `GET /staff/sessions/active`
- **Request:** None
- **Response:** Array of Active Sessions.
  ```json
  [
    {
      "sessionId": 123,
      "licensePlateIn": "30G-123.45",
      "vehicleTypeName": "Ô tô",
      "entryTime": "2026-07-02T08:00:00Z",
      "entryGateName": "IN-01",
      "status": "Parked",
      "suggestedSlotCode": "A-01",
      "actualSlotCode": "A-01",
      "hasReservation": true,
      "hasCard": false,
      "parkedMinutes": 120,
      "isForceCheckIn": false,
      "isOverstay": false
    }
  ]
  ```

### `GET /staff/sessions/search?licensePlate={plate}`
- **Request:** None
- **Response:** Returns a single Active Session matching the plate.

### `POST /staff/sessions/check-in`
- **Request:**
  ```json
  {
    "licensePlate": "30G-123.45",
    "vehicleTypeId": 1,
    "entryGateId": 1
  }
  ```
- **Response:** The created session object.

### `POST /staff/sessions/{id}/force-check-in` (Audited Override)
- **Request:**
  ```json
  {
    "actualPlate": "30G-123.45",
    "reason": "Biển số bị dính bùn, AI đọc sai"
  }
  ```
- **Response:** The overridden session object.

### `POST /staff/sessions/check-out`
- **Request:**
  ```json
  {
    "licensePlate": "30G-123.45",
    "exitGateId": 2,
    "paymentMethod": "QR",
    "lostTicket": false
  }
  ```
- **Response:**
  ```json
  {
    "sessionId": 123,
    "amount": 15000,
    "paymentStatus": "Success",
    "paymentMethod": "QR",
    "plateMismatch": false,
    "slotFreed": "A-01",
    "isOverstay": false
  }
  ```

### `GET /staff/incidents`
- **Request:** None
- **Response:** Array of incidents.

### `PATCH /staff/incidents/{id}/resolve?resolutionNotes={notes}`
- **Request:** None (No Request Body)
- **Response:** The resolved incident object.

---

## 4. Manager Module (Building & Pricing Config)
*Endpoints for managing the building topology, availability, and financial rules.*

### `GET /manager/availability`
- **Request:** None
- **Response:**
  ```json
  {
    "byVehicleType": [
      {
        "vehicleTypeName": "Ô tô",
        "capacity": 100,
        "inside": 45,
        "outstanding": 10,
        "walkInHeadroom": 45,
        "byZone": [
          { "zone": "Khu A", "available": 20 }
        ]
      }
    ]
  }
  ```

### `POST /manager/slots/maintenance`
- **Request:**
  ```json
  {
    "slotCodes": ["A-01", "A-02"],
    "maintenance": true
  }
  ```
- **Response:** `void`

### `GET /manager/pricing-policies`
- **Request:** None
- **Response:** Array of policies (FE filters for `status === "Active"`).

### `PUT /manager/pricing-policies/{id}`
- **Request:**
  ```json
  {
    "vehicleTypeId": 1,
    "basePrice": 10000,
    "baseHours": 1,
    "extraHourPrice": 10000,
    "effectiveDate": "2026-07-02T00:00:00Z"
  }
  ```
- **Response:** Updated pricing policy.

### `GET /manager/fee-config`
- **Request:** None
- **Response:**
  ```json
  {
    "hourlyRate": 10000,
    "depositPercent": 50,
    "overstayRatePerHour": 20000,
    "noShowGraceMinutes": 30,
    "blacklistThreshold": 3
  }
  ```

### `PUT /manager/fee-config`
- **Request:** Exact same schema as the `GET` response.
- **Response:** Updated fee config.

### `GET /manager/floors`
- **Request:** None
- **Response:** Array of Floors.
  ```json
  [
    {
      "floorId": 1,
      "floorName": "Tầng 1",
      "dedicatedVehicleTypeId": 1,
      "totalCapacity": 150
    }
  ]
  ```

### `POST /manager/floors` & `PUT /manager/floors/{id}`
- **Request:**
  ```json
  {
    "floorName": "Tầng 1",
    "dedicatedVehicleTypeId": 1,
    "totalCapacity": 150
  }
  ```
- **Response:** The floor object.

### `DELETE /manager/floors/{id}`
- **Request:** None
- **Response:** `void`

### `PATCH /manager/incidents/{id}/take-over`
- **Request:** None
- **Response:** `void`

---

## 5. Admin Module (System & RBAC)
*Endpoints for user access control and system audit trails.*

### `GET /admin/users`
- **Request:** None
- **Response:** Array of users (with roles).

### `PATCH /admin/users/{id}/status`
- **Request:** `{ "status": "Inactive" }`
- **Response:** Updated user.

### `PATCH /admin/users/{id}/reset-password`
- **Request:** Raw string body containing the new password.
- **Response:** `void`

### `GET /admin/rbac/roles` & `GET /admin/rbac/permissions`
- **Request:** None
- **Response:** Arrays of Roles and Permissions.

### `POST /admin/rbac/roles/{roleId}/permissions/{permissionId}`
- **Request:** None
- **Response:** `void`

### `DELETE /admin/rbac/roles/{roleId}/permissions/{permissionId}`
- **Request:** None
- **Response:** `void`

### `GET /admin/system-configs`
- **Request:** None
- **Response:** Array of `configKey`/`configValue` pairs.

### `POST /admin/system-configs` & `PUT /admin/system-configs/{key}`
- **Request:**
  ```json
  {
    "configKey": "MAX_SLOTS",
    "configValue": "500",
    "description": "Max slots"
  }
  ```
- **Response:** The config object.

### `DELETE /admin/system-configs/{key}`
- **Request:** None
- **Response:** `void`

### `GET /admin/audit-logs`
- **Query Params:** `action`, `entityName`, `from`, `to`
- **Response:** Array of Audit Logs.

---

## 6. Hardware Simulator Module
*Demo endpoints representing external hardware systems (Gates & ALPR Cameras).*

### `POST /gate/entry/scan`
- **Request:** `{ "licensePlate": "30G-123.45", "failureRate": 10 }`
- **Response:**
  ```json
  {
    "admitted": true,
    "message": "Welcome",
    "suggestedSlotCode": "A-01",
    "reason": null,
    "sessionId": 123
  }
  ```

### `POST /gate/exit/scan`
- **Request:** `{ "licensePlate": "30G-123.45", "failureRate": 10 }`
- **Response:**
  ```json
  {
    "totalFee": 15000,
    "licensePlate": "30G-123.45",
    "durationHours": 1.5,
    "paymentMethods": ["QR", "CASH"]
  }
  ```

### `POST /gate/force-checkin` (Hardware Simulator Bypass)
- **Request:** `{ "licensePlate": "30G-123.45" }`
- **Response:** `{ "admitted": true, "message": "Forced" }`

### `POST /camera/slot-occupied` & `POST /camera/slot-vacated`
- **Request:** `{ "slotCode": "A-01", "licensePlate": "30G-123.45" }` (licensePlate optional for vacated)
- **Response:**
  ```json
  {
    "success": true,
    "slotCode": "A-01",
    "status": "Occupied"
  }
  ```
