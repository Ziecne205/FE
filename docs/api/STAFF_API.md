# Staff APIs

Endpoints for staff managing gates, sessions, and incident resolution.

**Envelope Convention:** Responses are wrapped in `{ success, message, data, errorCode }`. Structures below represent the `data` payload.

---

## `GET /staff/sessions/active`
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

## `GET /staff/sessions/search?licensePlate={plate}`
- **Request:** None (Query param `licensePlate`)
- **Response:** Returns a single Active Session matching the plate.

## `POST /staff/sessions/check-in`
- **Request:**
  ```json
  {
    "licensePlate": "30G-123.45",
    "vehicleTypeId": 1,
    "entryGateId": 1
  }
  ```
- **Response:** The created session object.

## `POST /staff/sessions/{id}/force-check-in` (Audited Override)
- **Request:**
  ```json
  {
    "actualPlate": "30G-123.45",
    "reason": "Biển số bị dính bùn, AI đọc sai"
  }
  ```
- **Response:** The overridden session object.

## `POST /staff/sessions/check-out`
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

## `GET /staff/incidents`
- **Request:** None
- **Response:** Array of incidents.

## `PATCH /staff/incidents/{id}/resolve?resolutionNotes={notes}`
- **Request:** None (No Request Body. Uses query parameter `resolutionNotes`)
- **Response:** The resolved incident object.
