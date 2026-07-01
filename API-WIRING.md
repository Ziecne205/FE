# parking-fe — Nối API (Phase 4)

> App **nội bộ** (Admin / Manager / Staff). Hiện chạy **mock MSW 100%**.
> Nối API = (1) bật chế độ gọi server, (2) ở mỗi **hook** đổi path/param + map DTO, (3) tắt mock theo màn.
> Đã làm sẵn (Phase 0): **`apiFetch` tự unwrap `{success,message,data}` + gắn `Authorization: Bearer`**, đăng nhập bằng **username**.
> **Nguyên tắc:** chỉ sửa **hook** (+ type nếu cần) — **không đụng UI**. Component đọc dữ liệu đã-map nên không phải sửa.

---

## 0. Bật chế độ gọi server (làm trước)

1. **Env:** đặt `NEXT_PUBLIC_API_BASE=http://localhost:8080/api`. `apiFetch` prefix base này thay cho `/api`.
2. **Tắt MSW khi đã trỏ server** — `src/components/providers.tsx`:
   ```ts
   // trước: bật mock mọi lúc trong development
   if (process.env.NODE_ENV === 'development') { ... initMocks() }
   // sau: chỉ bật mock khi CHƯA set base
   if (!process.env.NEXT_PUBLIC_API_BASE) { ... initMocks() }
   ```
   → không set env = chạy mock; set env = gọi server thật. 1 công tắc.
3. **Auth:** đăng nhập trả `{token, username, roleName}` (không có `userId`/`fullName`). Store đã lưu `fullName = username` tạm — đủ để chạy.

---

## 1. Sửa theo từng hook

> Phần lớn chỉ **đổi path** (+ đổi tên param / map field). Map DTO làm **ngay trong hook**.
> `path mới` = path sau khi prefix `NEXT_PUBLIC_API_BASE`.

| Màn / Hook | File | Path hiện tại → **path mới** | Sửa thêm ở hook |
|---|---|---|---|
| **Login** | `store/auth.ts` | `/auth/login`, `/auth/register` | đã khớp; register map `email→username` tạm + `phoneNumber` |
| **Dashboard / Capacity** | `useAvailability.ts` | `/availability` → `/manager/availability` | response `{byVehicleType:[{capacity,inside,outstanding,walkInHeadroom,…}]}` |
| **Loại xe** | `useAvailability.ts` (`useVehicleTypes`) | `/vehicle-types` → `/manager/vehicle-types` | map `{vehicleTypeId,typeName}` → `{id:String(...),name}` |
| **Slot Map** | `useAvailability.ts` (`useLotSlots`) | `/slots-map` → `/manager/slots` | map slot `{slotId,slotCode,floor:{},vehicleType:{},status}` → `{id,slotCode,floor:number,zone,vehicleTypeId,status}` |
| **Slot Map – bảo trì** | `useAvailability.ts` (`useSetMaintenance`) | `/admin/slots/maintenance` (batch) → `/manager/slots/{id}/maintenance?maintenance=` (PATCH) | FE gửi `slotCodes[]` → **loop từng slot** gọi PATCH; gom kết quả |
| **Phiên đang mở** | `useSessions.ts` (`useOpenSessions`) | `/sessions?open=true` → `/staff/sessions/active` | map `ActiveSessionDto` → `ParkingSession` |
| **Tìm xe** | `useSessions.ts` (`useFindCar`) | `/sessions/find?plate=` → `/staff/sessions/search?licensePlate=` | đổi param `plate→licensePlate`; map DTO |
| **Nhập tay (check-in)** | `useSessions.ts` (`useCreateSession`) | `/sessions` → `/staff/sessions/check-in` (POST) | body `{licensePlate,vehicleTypeId,entryGateId}` (bỏ `slot_id`, thêm cổng) |
| **Sự cố** | `useIncidents.ts` | `/incidents?status=` → `/staff/incidents` | map `IncidentReport`; lọc status client-side nếu cần |
| **Sự cố – resolve** | `useIncidents.ts` (`useResolveIncident`) | `PUT /incidents/{id}/resolve` → `PATCH /staff/incidents/{id}/resolve` | đổi verb; body gửi **chuỗi** (raw string), không JSON object |
| **Đặt chỗ – list** | `useReservations.ts` | `/reservations?status=` → `/manager/reservations` | map `Reservation`; lọc status client nếu cần |
| **Đặt chỗ – tạo** | `useReservations.ts` (`useCreateReservation`) | `/reservations` → `/driver/reservations` (POST) | body `ReservationRequest{vehicleTypeId,licensePlate,expectedEntryTime,expectedExitTime[,override]}` |
| **Đặt chỗ – huỷ** | `useReservations.ts` (`useCancelReservation`) | `POST /reservations/{id}/cancel` → `PATCH /driver/reservations/{id}/cancel` | đổi verb POST→PATCH |
| **Hạn mức** | `useQuotas.ts` | `/admin/quotas` → `/manager/booking-quotas` (GET/POST/PUT/DELETE) | đổi field `windowStart/windowEnd` → `startTime/endTime` |
| **Quản lý giá** | `usePricing.ts` (`usePricingPolicies`/`useUpdatePricing`) | `/manager/pricing-policies` | map field giá trong response → `hourlyRate` |
| **Chính sách phí** | `usePricing.ts` (`useFeeConfig`/`useUpdateFeeConfig`) | `/manager/fee-config` | GET/PUT `{depositPercent,overstayRatePerHour,noShowGraceMinutes,blacklistThreshold}` |
| **Báo cáo** | `useReports.ts` | `/admin/reports?from=&to=` → `/manager/reports/revenue?fromDate=&toDate=` **+** `/manager/reports/traffic` | đổi param `from/to→fromDate/toDate`; gọi 2 endpoint rồi gộp thành `{revenue,occupancy}` |
| **Thanh toán cổng ra** | `usePayParking.ts` | `/payments` | bind theo luồng thanh toán đã chốt (tiền mặt khi check-out / PayOS) |
| **Mô phỏng cổng/camera** | `useGateSim.ts` | `/gate/*`, `/camera/*`, `/gate/force-checkin` | tool demo Staff — map sang check-in/check-out/park; ưu tiên thấp |

---

## 2. Checklist cuốn chiếu (xong màn nào QA màn đó)

> **Đã nối server (2026-06).** Mọi DTO map gom ở `src/lib/beApi.ts`; mỗi hook chỉ đổi
> path + gọi mapper. `[x]` = đã sửa hook & type-check pass; còn lại cần QA chạy thật với BE.

- [x] **B0** — `.env.local` (`NEXT_PUBLIC_API_BASE`) + `providers.tsx` tắt MSW khi đã set base
- [x] Login (`store/auth.ts` — đã khớp `/auth/login`, `/auth/register`)
- [x] Loại xe — `/manager/vehicle-types`
- [x] Dashboard / Capacity — dựng từ `/driver/parking-info` (public)
- [x] Slot Map (+ bảo trì) — `/manager/slots`; bảo trì loop `PATCH /manager/slots/{id}/maintenance`
- [x] Phiên / Tìm xe — `/staff/sessions/active`, `/staff/sessions/search`, check-in `/staff/sessions/check-in`
- [x] Quản lý giá + Chính sách phí — `/manager/pricing-policies`, `/manager/fee-config`
- [x] Hạn mức — `/manager/booking-quotas` (CRUD)
- [x] Sự cố — `/staff/incidents`; resolve `PATCH /staff/incidents/{id}/resolve` (body chuỗi thô)
- [x] Đặt chỗ — list `/driver/reservations/my`, tạo `/driver/reservations`, huỷ `PATCH .../cancel`
- [x] Báo cáo — gộp `/manager/reports/revenue` + `/manager/reports/traffic`
- [x] Thanh toán cổng ra — đã nối check-out thật (`POST /staff/sessions/check-out`)
- [ ] Mô phỏng cổng/camera — **vẫn mock** (BE không có `/gate/*`, `/camera/*`)

---

## 4. Khoảng trống BE — đã bổ sung (2026-07-01)

BE đã thêm các endpoint/cột để FE chạy thật:

| Việc | Endpoint / thay đổi BE | Ghi chú |
|---|---|---|
| **Danh sách cổng** | `GET /api/gates` (+ `?type=Entry\|Exit`) | `useGates` + `resolveGateId`; check-in dùng cổng Entry, check-out dùng Exit |
| **Đặt chỗ — list Manager** | `GET /api/manager/reservations` | `useReservations` đã trỏ sang đây |
| **Sự cố — createdAt** | Thêm cột `IncidentReports.CreatedAt` | ⚠️ Phải chạy `BE/sql/2026-07-01_add_incident_createdat.sql` trước khi start BE (ddl-auto=validate) |
| **Reservation JSON** | Thêm getter phẳng `userId/vehicleTypeId/vehicleTypeName` | Trước đây bị `@JsonIgnore` nên thiếu loại xe trên bảng |

## 5. Cross-check UI ↔ API (2026-07-01) — đã sửa

Rà soát toàn bộ màn đã nối, sửa các lỗi shape do giai đoạn vibecode:

| Màn | Lỗi | Sửa |
|---|---|---|
| **Hạn mức** (tạo/sửa) | Dialog hardcode `vt-car`/`vt-moto` → gửi `NaN` cho BE, lưu luôn fail | Dùng `useVehicleTypes` + `useAvailability` thật cho dropdown/preview/group |
| **Sự cố** | BE trả `LostCard`… nhưng FE chỉ có nhãn enum cũ → cột "Loại sự cố" trống | `INCIDENT_TYPE_LABELS` + union `IncidentType` đổi theo IssueType của BE |
| **Quản lý giá** | Liệt kê cả bảng giá `Expired` | Lọc `Active` trong `usePricingPolicies` |
| **Staff dashboard** | Chia cho 0 slot → `NaN%` | Guard mẫu số |

## 6. Phân hệ Admin (2026-07-01) — đã build

4 màn quản trị mới (route `/admin/*`, chỉ Admin, gắn vào sidebar), hook ở `hooks/useAdmin.ts`:

| Màn | Route | Endpoint BE |
|---|---|---|
| Quản lý tài khoản | `/admin/users` | `/admin/users` (list, đổi status, reset mật khẩu) |
| Phân quyền (RBAC) | `/admin/rbac` | `/admin/rbac/*` (roles, permissions, gán/gỡ) |
| Cấu hình hệ thống | `/admin/system-config` | `/admin/system-configs` (CRUD) |
| Nhật ký | `/admin/audit-logs` | `/admin/audit-logs/*` (lọc action/entity/date) |

## 7. Nối nốt các gap (2026-07-01) — đã xong

Tất cả các gap còn lại đã có endpoint BE thật + FE trỏ sang:

| Gap | Endpoint BE mới | FE |
|---|---|---|
| **Capacity** outstanding + zone | `GET /manager/availability` (headroom + byZone thật) | `useAvailability` trỏ thẳng (bỏ compose từ parking-info) |
| **Admin dashboard** | `GET /admin/dashboard` (floors + totals + usageCurve) | `useAdminDashboard` + `SystemOverview` dùng data thật |
| **Báo cáo** chuỗi thời gian | `GET /manager/reports/revenue-daily`, `/occupancy-hourly` | `useReports` gọi 2 endpoint chuỗi |
| **Bật/tắt hạn mức** | `PATCH /manager/booking-quotas/{id}/toggle` (+ cột `IsActive`) | `useToggleQuota` gọi thật; `mapQuota` đọc `isActive` |
| **Mô phỏng cổng/camera** | `/gate/entry/scan`, `/gate/exit/scan`, `/gate/force-checkin`, `/camera/slot-occupied`, `/camera/slot-vacated` | `useGateSim` đã khớp path sẵn — chạy được ngay |

> ⚠️ **2 migration BẮT BUỘC chạy trước khi start BE** (ddl-auto=validate):
> `BE/sql/2026-07-01_add_incident_createdat.sql` và `BE/sql/2026-07-01_add_bookingquota_isactive.sql`.

### Còn hạn chế (chấp nhận được, không phải mock)
- **IncidentList** trong admin overview vẫn là danh sách tĩnh trang trí (chưa nối `useIncidents`).
- Báo cáo `occupancyRate`/ngày là ước lượng thô; usage curve dựng từ phiên trong ngày.
- Per-floor `revenueToday`/`openIncidents` = 0 (schema không gắn tài chính/sự cố theo tầng); totals thì thật.

---

## 3. Mẫu sửa 1 hook

```ts
// useVehicleTypes — trước (mock):
queryFn: () => api.get<VehicleType[]>('/vehicle-types')

// sau (server): đổi path + map DTO ngay trong hook
queryFn: async () => {
  const list = await api.get<{ vehicleTypeId: number; typeName: string }[]>('/manager/vehicle-types')
  return list.map((v) => ({ id: String(v.vehicleTypeId), name: v.typeName }))
}
```
Chỗ nào shape lệch nhiều → viết 1 hàm `map...()` nhỏ trong hook. UI giữ nguyên.
