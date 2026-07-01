# Manager APIs

Endpoints for managing the building topology, availability, and financial rules.

**Envelope Convention:** Responses are wrapped in `{ success, message, data, errorCode }`. Structures below represent the `data` payload.

---

## `GET /manager/availability`
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

## `POST /manager/slots/maintenance`
- **Request:**
  ```json
  {
    "slotCodes": ["A-01", "A-02"],
    "maintenance": true
  }
  ```
- **Response:** `void`

## `GET /manager/pricing-policies`
- **Request:** None
- **Response:** Array of policies (FE filters for `status === "Active"`).

## `PUT /manager/pricing-policies/{id}`
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

## `GET /manager/fee-config`
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

## `PUT /manager/fee-config`
- **Request:** Exact same schema as the `GET` response.
- **Response:** Updated fee config.

## `GET /manager/floors`
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

## `POST /manager/floors`
- **Request:**
  ```json
  {
    "floorName": "Tầng 1",
    "dedicatedVehicleTypeId": 1,
    "totalCapacity": 150
  }
  ```
- **Response:** The floor object.

## `PUT /manager/floors/{id}`
- **Request:** Same as POST.
- **Response:** The updated floor object.

## `DELETE /manager/floors/{id}`
- **Request:** None
- **Response:** `void`

## `PATCH /manager/incidents/{id}/take-over`
- **Request:** None
- **Response:** `void`
