# SPEC - Parking Building Management System

> Project Code: **SU26SWP08**
> Last Updated: 2026-05-28
> Phase: 1 (MVP - Manager/Staff Screens)

## Project Overview

A multi-story parking building management system integrating hardware (AI cameras, RFID, Smart Poles with sensors, barriers, LED displays) with software for real-time slot management, booking, automated check-in/out, and reporting.

**MVP Scope:** Frontend prototype with mock API and simulated hardware data. Focus on Manager and Staff workflows.

---

## Tech Stack

### Frontend
- **Framework:** React with Next.js
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Language:** TypeScript
- **State Management:** React Context / Zustand (TBD)
- **API Client:** Fetch API / Axios (TBD)
- **Real-time Updates:** Polling (5-10 second intervals)

### Backend (Mock for MVP)
- Mock API with simulated Smart Pole events
- JSON-based mock data
- Simulated hardware responses

### Authentication
- JWT-based authentication
- Role-based access control (RBAC)

### Localization
- Vietnamese only (Phase 1)

### Deployment
- Web only
- Responsive design (desktop, tablet, mobile)

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Parking Facility Manager** | Full facility management: slots, floors, zones, pricing, reports, bookings, exception handling, maintenance marking |
| **Parking Staff** | Manual entry (AI Camera backup), active session monitoring, exception handling (cannot book, cannot mark maintenance) |
| **Parking User/Driver** | (Phase 2) Booking, view parking info, payment |
| **System Administrator** | (Phase 2) User management, role assignment, system configuration |

---

## Data Model

### Entity Hierarchy
```
Facility
  └── Floor
       └── Zone
            └── Slot
```

### Slot Naming Convention
**Format:** `F{floor}-{zone}-{number}`
- Example: `F1-A-15` (Floor 1, Zone A, Slot 15)
- Example: `F2-B-08` (Floor 2, Zone B, Slot 8)

### Slot States
```
Available    → Reserved (booking created)
Available    → Occupied (walk-in, Smart Pole detects car)
Reserved     → Occupied (booked user arrives, Smart Pole confirms)
Occupied     → Available (car leaves, Smart Pole detects movement)
Any State    → Maintenance (Manager marks manually)
Maintenance  → Available (Manager marks fixed)
Reserved     → Available (booking timeout/cancellation)
```

### Core Entities

**Facility**
- id, name, address, total_floors, total_zones, total_slots, operating_hours

**Floor**
- id, facility_id, floor_number, zone_count

**Zone**
- id, floor_id, zone_letter (A, B, C...), slot_count

**Slot**
- id, zone_id, slot_number, slot_name (F1-A-15), status (Available/Occupied/Reserved/Maintenance)

**Vehicle**
- id, user_id, license_plate, vehicle_type (car only for Phase 1)

**Booking**
- id, user_id, vehicle_id, slot_id, booking_start_time, booking_end_time, duration_hours, status (Pending/Confirmed/Completed/Cancelled), created_at

**ParkingSession**
- id, booking_id (nullable for walk-ins), vehicle_id, slot_id, license_plate, entry_time, exit_time, duration_minutes, status (Active/Completed)

**Payment**
- id, session_id, booking_id, amount, payment_method (Cash/VNPay/QR), payment_status (Pending/Completed/Failed), paid_at

**Exception**
- id, session_id, exception_type (WrongSlot/AIFailure/PaymentFailure/Overtime), description, resolved_by (staff/manager user_id), resolved_at, status (Open/Resolved)

**User**
- id, email, phone, full_name, role (Manager/Staff/Driver/Admin), facility_id (for Manager/Staff)

---

## Business Workflows

### 1. Entry Flow (Check-In)

#### Scenario A: With Booking
1. Driver books slot online beforehand (selects slot manually from available options)
2. Driver arrives at entry barrier
3. AI Camera scans license plate (Staff can manually type if AI fails)
4. System recognizes booking and validates
5. Pricing countdown starts from entry time
6. Barrier opens (10-second timeout)
7. Driver navigates to pre-assigned slot (must park at booked slot)
8. Smart Pole at slot detects car after idle time
9. System marks slot as Occupied
10. **Exception:** If driver parks at wrong slot, Smart Pole alerts "Wrong Slot" sound

#### Scenario B: Walk-In (No Booking)
1. Driver arrives at entry barrier
2. AI Camera scans license plate (Staff can manually type if AI fails)
3. System creates new parking session
4. Pricing countdown starts from entry time
5. Barrier opens (10-second timeout)
6. LED signs show which Zones have available slots
7. Driver self-selects any available slot
8. Smart Pole at slot detects car after idle time
9. System marks slot as Occupied

### 2. Exit Flow (Check-Out)
1. Car leaves slot
2. Smart Pole detects movement
3. System marks slot status as "Moved" (transitioning to Available)
4. Car arrives at exit barrier
5. AI Camera scans license plate
6. System retrieves parking session and calculates total price
7. System displays amount due
8. Driver pays via Cash, QR code, or car's windshield QR
9. Payment confirmed
10. Barrier opens (10-second timeout)
11. System marks session as Completed
12. Slot becomes Available

### 3. Booking Flow (Manager/Driver)
1. User logs in (Manager or Driver in Phase 2)
2. Selects "Book Slot"
3. Filters available slots by:
   - Date and time range
   - Duration (hours)
   - Floor preference
   - Zone preference
4. System shows available slots matching criteria
5. User manually selects desired slot from list/map
6. User enters vehicle information (license plate)
7. System calculates booking price (10,000 VND/hour × duration)
8. User confirms and pays (pre-payment)
9. System generates booking confirmation
10. Slot status changes to Reserved
11. **Timeout:** If driver doesn't arrive within booking start time window, booking auto-cancels and slot returns to Available

### 4. Exception Handling

**Staff Can Handle:**
- Manual license plate entry (AI Camera failure)
- Payment retry/manual cash collection
- Wrong slot reassignment (coordinate with driver)
- Session lookup and verification

**Manager Can Handle:**
- All Staff exceptions above, plus:
- Cancel/modify bookings
- Mark slots as Maintenance
- Override pricing/payment
- Resolve fraud/dispute cases

**Exception Types:**
- **Wrong Slot:** Smart Pole detects car at wrong location
- **AI Camera Failure:** Cannot read license plate (staff manual entry)
- **Payment Failure:** Payment gateway error or insufficient funds
- **Overtime:** Driver exceeds booked duration (extra hourly charges apply)

---

## Pricing Model

**Base Rate:** 10,000 VND/hour

**Booking Payment:**
- Pre-pay for reserved hours when booking
- Example: Book 3 hours = 30,000 VND paid upfront

**Overtime Charges:**
- If driver stays longer than booked duration, charge extra at 10,000 VND/hour
- Calculated and collected at exit

**Walk-In Payment:**
- Pay full amount at exit based on actual duration
- Rounded up to nearest hour

---

## Hardware Integration (Simulated for MVP)

### AI Camera
- **Location:** Entry barrier, exit barrier, each Smart Pole
- **Function:** License plate recognition
- **Simulation:** Mock API returns license plate string with 95-99% success rate
- **Fallback:** Staff manual entry interface

### Smart Pole
- **Location:** Each parking slot
- **Function:** Detect car presence and movement
- **Simulation:** Mock events for "Car Parked" (after 5s idle) and "Car Moved"
- **Alert:** "Wrong Slot" audio alert if license plate doesn't match booking

### Barrier
- **Location:** Entry and exit gates
- **Function:** Open/close with 10-second timeout
- **Simulation:** Mock API for open/close commands

### LED Display
- **Location:** Throughout facility
- **Function:** Show available zones and slot counts
- **Simulation:** Real-time data from slot status aggregation

### Paper Ticket (Optional)
- Purpose: Helps driver remember parking location
- Not used for exit (AI Camera handles checkout)
- Can be printed at Smart Pole upon request

---

## Phase 1 Features (Manager/Staff Screens)

### Manager Dashboard
1. **Real-time Slot Map**
   - Visual floor plan showing all slots color-coded by status
   - Available (green), Occupied (red), Reserved (yellow), Maintenance (gray)
   - Click slot for details
   - Auto-refresh every 5-10 seconds

2. **Occupancy Stats**
   - Total slots, available, occupied, reserved, maintenance
   - Occupancy rate percentage
   - Current revenue (today)

3. **Active Sessions**
   - List of all cars currently parked
   - License plate, slot, entry time, current duration, estimated price
   - Search and filter

4. **Booking Management**
   - Create new booking (Manager only)
   - View upcoming bookings
   - Cancel/modify bookings
   - Filter by date, status, vehicle

5. **Slot Management**
   - Mark slots as Maintenance/Available
   - View slot history (past sessions)
   - Bulk operations (mark multiple slots)

6. **Exception Log**
   - View all exceptions (open and resolved)
   - Filter by type, date, status
   - Assign to staff or resolve

7. **Reports**
   - Daily revenue report
   - Occupancy rate over time
   - Peak hours analysis
   - Session history export

8. **Facility Settings**
   - Edit pricing (10,000 VND/hour)
   - Operating hours
   - Floor/zone configuration

### Staff Dashboard
1. **Manual Entry Form**
   - Quick form to create session when AI Camera fails
   - Input: license plate, slot selection
   - Submit to start session

2. **Active Sessions Monitor**
   - Same as Manager view but read-only for bookings
   - Can view session details
   - Can assist with payment/checkout

3. **Exception Handling**
   - View assigned exceptions
   - Mark as resolved with notes
   - Cannot cancel bookings or mark maintenance

4. **Quick Actions**
   - Search session by license plate
   - View slot availability by zone
   - Print paper ticket (optional feature)

---

## Non-Functional Requirements

### Performance
- Dashboard loads within 2 seconds
- Real-time updates with 5-10 second polling interval
- Support 100+ concurrent sessions

### Usability
- Intuitive UI for non-technical staff
- Mobile-responsive for tablet use by staff on-site
- Vietnamese language throughout

### Reliability
- Graceful degradation when mock API simulates failures
- Clear error messages for staff
- Session data persistence (mock localStorage for MVP)

### Security
- JWT authentication with role-based access
- Secure password storage (hashed)
- Session timeout after 30 minutes inactivity

---

## Out of Scope (Phase 2+)

- Driver mobile app / web portal
- Admin user management screens
- AI slot allocation algorithm
- Real hardware integration
- Multi-facility management
- Advanced analytics and ML insights
- Email/SMS notifications
- Integration with external payment gateways (real VNPay API)
- Multi-language support (English, etc.)

---

## Open Questions / Future Decisions

- State management library choice: Zustand + react query
- API client preference (Fetch vs Axios)
- Mock API implementation approach: MSW
- Deployment platform for demo: Vercel
- Design system customization level for shadcn/ui components
