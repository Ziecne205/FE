# Driver APIs

Endpoints for driver apps to manage bookings, payments, and feedback.

**Envelope Convention:** Responses are wrapped in `{ success, message, data, errorCode }`. Structures below represent the `data` payload.

---

## `POST /driver/reservations`
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

## `GET /driver/reservations/my`
- **Request:** None
- **Response:** Array of reservations belonging to the authenticated driver.

## `PATCH /driver/reservations/{id}/cancel`
- **Request:** None
- **Response:** The cancelled reservation object.

## `POST /driver/reservations/{id}/confirm-deposit`
- **Request:** None
- **Response:** The confirmed reservation object (transitions from Pending to Confirmed).

## `POST /driver/payments/payos/create-link`
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

## `POST /driver/payments/checkout` (Mock Flow)
- **Request:**
  ```json
  {
    "sessionId": 123,
    "amount": 15000
  }
  ```
- **Response:** `{ "checkoutUrl": "..." }`

## `POST /driver/feedbacks`
- **Request:**
  ```json
  {
    "sessionId": 123,
    "rating": 5,
    "comment": "Rất tốt"
  }
  ```
- **Response:** `void`
