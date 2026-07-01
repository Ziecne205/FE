# Hardware Simulator APIs

Demo endpoints representing external hardware systems (Gates & ALPR Cameras).

**Envelope Convention:** Responses are wrapped in `{ success, message, data, errorCode }`. Structures below represent the `data` payload.

---

## `POST /gate/entry/scan`
- **Request:** 
  ```json
  { 
    "licensePlate": "30G-123.45", 
    "failureRate": 10 
  }
  ```
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

## `POST /gate/exit/scan`
- **Request:** 
  ```json
  { 
    "licensePlate": "30G-123.45", 
    "failureRate": 10 
  }
  ```
- **Response:**
  ```json
  {
    "totalFee": 15000,
    "licensePlate": "30G-123.45",
    "durationHours": 1.5,
    "paymentMethods": ["QR", "CASH"]
  }
  ```

## `POST /gate/force-checkin`
*Note: This is the hardware simulator bypass, lacking an audit log. The audited production equivalent is `POST /staff/sessions/{id}/force-check-in`.*
- **Request:** 
  ```json
  { "licensePlate": "30G-123.45" }
  ```
- **Response:** 
  ```json
  { "admitted": true, "message": "Forced" }
  ```

## `POST /camera/slot-occupied`
- **Request:** 
  ```json
  { "slotCode": "A-01", "licensePlate": "30G-123.45" }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "slotCode": "A-01",
    "status": "Occupied"
  }
  ```

## `POST /camera/slot-vacated`
- **Request:** 
  ```json
  { "slotCode": "A-01" }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "slotCode": "A-01",
    "status": "Available"
  }
  ```
