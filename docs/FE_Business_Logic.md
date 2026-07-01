# Frontend Business Logic

This document details the core business logic rules and workflows implemented in the ParkFlow Frontend application. It covers how the frontend enforces system rules, handles edge cases, and interacts with the backend's Phase 4 integration.

---

## 1. Capacity & Availability Management

### Real-time Headroom Calculation
The frontend queries `/manager/availability` to retrieve a unified snapshot of the building's capacity. The availability is broken down by vehicle type (e.g., Car vs. Motorbike) and defines:
- **`capacity`**: Total physical slots available for the vehicle type.
- **`inside`**: Vehicles currently parked inside the facility.
- **`outstanding`**: Confirmed reservations that have not yet checked in.
- **`walkInHeadroom`**: The number of slots available for drive-up customers (`capacity - inside - outstanding`).

### Capacity-Crash Protection (Maintenance Mode)
When a Manager attempts to set one or more slots to **Maintenance** mode via the `SlotMap`:
1. The frontend intercepts the action (`useSlotMap.ts`).
2. It evaluates whether removing these slots might cause the `capacity` to drop below the current `inside + outstanding` count.
3. If true, a **Capacity-Crash Warning Modal** is triggered.
4. The manager is warned that proceeding will force the backend to **automatically cancel** the newest pending reservations to prevent overbooking, and must explicitly confirm the action.

---

## 2. Gate Operations & Check-in

### Hardware Scanning vs. Staff Intervention
The frontend provides a simulator (`EntryGatePanel`) that mocks hardware ALPR (Automatic License Plate Recognition) cameras.
- **`ADMITTED`**: Plate recognized, booking found (or walk-in headroom available).
- **`SCAN_FAILED`**: Camera unable to read plate. Staff must manually enter the plate.
- **`PLATE_MISMATCH`**: Camera reads a plate, but it doesn't match the active reservation for that timeslot.

### Audited Force Check-in
If a `PLATE_MISMATCH` occurs, the system denies entry by default. However, staff can override this decision:
1. The frontend surfaces a **Ghi đè biển số** (Force Override) button.
2. The staff must enter an optional reason (e.g., "AI misread, plate is muddy").
3. The frontend calls `POST /staff/sessions/{id}/force-check-in`.
4. This is an **audited action**; the backend writes a `STAFF_FORCE_CHECK_IN` event to the system Audit Logs, tracking who authorized the entry.

---

## 3. Check-out & Financial Rules

### Fee Breakdown
At checkout, the frontend displays a breakdown of the total fee calculated by the backend. The breakdown visually splits the parking duration into:
- Day-time blocks (e.g., 06:00 - 18:00)
- Night-time blocks (e.g., 18:00 - 06:00)
- Fixed surcharges or rounding adjustments.

### Overstay (Quá hạn ưu đãi)
If a vehicle remains parked beyond the configured 24-hour grace period:
1. The backend applies an `extraHourPrice` surcharge.
2. The checkout response returns `isOverstay: true`.
3. The `ExitPayment` screen intercepts this flag and renders an **Amber Warning Badge**, informing the staff and driver that a late-checkout penalty was applied to the final bill.

---

## 4. Reservations & Payments

### Booking Lifecycle
1. **Pending**: Driver selects times and requests a slot.
2. **Deposit Required**: Driver must pay a % deposit (configured by the manager via `useFeeConfig`).
3. **Confirmed**: Frontend hits the PayOS webhook mock/success URL, which triggers `POST /driver/reservations/{id}/confirm-deposit`.
4. **Fulfilled/Checked-in**: The driver scans at the gate.

### Cancellation & No-shows
Drivers can cancel their reservations from their dashboard (`PATCH /driver/reservations/{id}/cancel`). If a driver fails to show up within the `noShowGraceMinutes` threshold, the backend marks them as a No-Show, potentially triggering a blacklist threshold.

---

## 5. Incident Management

### Resolution Flow
When gate errors, payment failures, or hardware faults occur, the backend creates an `Incident`.
- Managers can take ownership of unassigned incidents via `PATCH /manager/incidents/{id}/take-over`.
- To resolve an incident, staff must provide `resolutionNotes`. The frontend safely passes these notes as a URL Query Parameter (`?resolutionNotes=...`) to `PATCH /staff/incidents/{id}/resolve` to comply with the backend's expected signature.

---

## 6. Authentication & RBAC

- **Registration**: The public registration form (`/register`) collects `username`, `password`, `fullName`, `phone`, and `email`. By default, users are assigned the `Driver` role.
- **JWT Bearer**: The frontend stores the token in local storage (or a secure cookie) and automatically injects it into the `Authorization: Bearer <token>` header via the `apiFetch` interceptor.
- **Role Fencing**: Routes under `/admin` and `/dashboard` query the active user's role and restrict access accordingly (e.g., `Driver` cannot access the `SlotMap` or `AdminDashboard`).
