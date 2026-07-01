# API Integration Status

FE-side view of every React Query hook in `src/hooks/`, the backend endpoint(s) it calls, and whether it's wired to the real API or still mocked. All requests go through `src/lib/api.ts` (`api.get/post/put/patch`), which prefixes `NEXT_PUBLIC_API_BASE` (falls back to `/api`, served by MSW when unset), unwraps the Spring Boot `{success, message, data}` envelope, and attaches the JWT bearer token automatically.

Status legend: **Integrated** = calls a real backend endpoint. **Mocked** = intentionally still backed by MSW/local demo data (no such backend endpoint exists, or it's a demo/simulator by design).

| Hook file | Hooks | Endpoint(s) | Status |
|---|---|---|---|
| `useAdmin.ts` | `useAdminUsers`, `useSetUserStatus`, `useResetUserPassword`, `useAdminRoles`, `useAdminPermissions`, `useRolePermissions`, `useToggleRolePermission`, `useSystemConfigs`, `useSaveSystemConfig`, `useDeleteSystemConfig`, `useAuditLogs` | `GET/PATCH /admin/users`, `GET /admin/rbac/roles`, `GET /admin/rbac/permissions`, `GET/POST /admin/rbac/roles/{id}/permissions`, `GET/POST/PUT/DELETE /admin/system-configs`, `GET /admin/audit-logs` | Integrated |
| `useAdminDashboard.ts` | `useAdminDashboard` | `GET /admin/dashboard` | Integrated |
| `useAvailability.ts` | `useVehicleTypes`, `useAvailability`, `useLotSlots`, `useSetMaintenance` | `GET /manager/vehicle-types`, `GET /manager/availability`, `GET /manager/slots`, `PATCH /manager/slots/{id}/maintenance` | Integrated |
| `useCapacityDashboard.ts` | `useCapacityDashboard` | Composes `useAvailability` + `useOpenIncidentCount` (no direct API call) | Integrated |
| `useFeedback.ts` | `useSubmitFeedback` | `POST /driver/feedbacks` | Integrated |
| `useGateSim.ts` | `useEntryScan`, `useExitScan`, `useForceCheckin`, `useSlotOccupied`, `useSlotVacated` | `POST /gate/entry/scan`, `/gate/exit/scan`, `/gate/force-checkin`, `/camera/slot-occupied`, `/camera/slot-vacated` | Integrated (gate/camera simulator backend endpoints exist and are wired; UI is an intentional demo/simulator by design — see `src/components/gate-camera-simulator/mockData.ts`, untouched) |
| `useGates.ts` | `useGates`, `resolveGateId` | `GET /gates` (optionally `?type=`) | Integrated |
| `useIncidents.ts` | `useIncidents`, `useOpenIncidentCount`, `useResolveIncident` | `GET /staff/incidents`, `PATCH /staff/incidents/{id}/resolve` | Integrated |
| `useNow.ts` | `useNow` | No API call — client-only ticking clock (avoids calling `Date.now()` during render) used by components that display elapsed time | N/A (utility hook) |
| `useParkingInfo.ts` | `useParkingInfo` | `GET /driver/parking-info` (public) | Integrated |
| `usePayParking.ts` | `usePayParking` | `POST /staff/sessions/check-out` | Integrated |
| `usePricing.ts` | `usePricingPolicies`, `useUpdatePricing`, `useFeeConfig`, `useUpdateFeeConfig` | `GET /manager/pricing-policies`, `PUT /manager/pricing-policies/{id}`, `GET/PUT /manager/fee-config` | Integrated |
| `useProfile.ts` | `useProfile`, `useUpdateProfile` | `GET /driver/profile`, `PUT /driver/profile` | Integrated (standalone `/profile` route, outside role-gating — see notes) |
| `useQuotas.ts` | `useQuotas`, `useSaveQuota`, `useToggleQuota` | `GET/POST/PUT /manager/booking-quotas`, `PATCH /manager/booking-quotas/{id}/toggle` | Integrated |
| `useReports.ts` | `useReports` | `GET /manager/reports/revenue-daily`, `GET /manager/reports/occupancy-hourly` | Integrated |
| `useReservations.ts` | `useReservations`, `useCreateReservation`, `useCancelReservation` | `GET /manager/reservations`, `POST /driver/reservations`, `PATCH /driver/reservations/{id}/cancel` | Integrated |
| `useSessions.ts` | `useCreateSession`, `useOpenSessions`, `useFindCar` | `POST /staff/sessions/check-in`, `GET /staff/sessions/active`, `GET /staff/sessions/search?licensePlate=` | Integrated |
| `useSlotMap.ts` | `useSlotMap` | Composes `useAvailability` hooks (no direct API call) | Integrated |

## Notes / gaps

- **Driver-facing hooks** (`useProfile`, `useFeedback`, `useParkingInfo`) call real backend endpoints per the `khoi` branch contract. This app is internal-only (Admin/Manager/Staff) — the dedicated `driver/*` pages that previously lived here were deliberately removed (see git history) because Driver has its own separate app and is redirected to `/login` from `ProtectedLayout` (`src/lib/roles.ts`). To keep `useProfile`/`useUpdateProfile` usable without contradicting that decision, `/profile` (`src/app/profile/page.tsx` + `src/components/driver-profile/DriverProfileForm.tsx`) is a small **standalone** route outside `ProtectedLayout`/role-gating — it only requires an authenticated session (any role with a valid JWT can view/edit their own `/driver/profile` record); it does not appear in the internal sidebar/nav. `useSubmitFeedback` is wired into the exit-payment success screen (`src/components/exit-payment/FeedbackForm.tsx`), where Staff can capture a quick rating on the driver's behalf right after checkout, since that is the one place in this app with a concrete `sessionId` and an operator present.
- **Gate/camera simulator** (`useGateSim.ts`) is wired to real backend simulator endpoints, but its UI is intentionally a demo tool for Staff (`src/components/gate-camera-simulator/`) — this is by design, not a stopgap.
- **`src/components/exit-payment/mockData.ts`** remains as intentional demo/fallback data for the exit-payment screen when no `sessionId` is passed via query params — this is deliberate, not a leftover mock.
- No endpoints are currently un-integrated; all hooks call real backend routes or intentionally compose other real-data hooks.
