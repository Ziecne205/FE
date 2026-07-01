# Admin APIs

Endpoints for user access control and system audit trails.

**Envelope Convention:** Responses are wrapped in `{ success, message, data, errorCode }`. Structures below represent the `data` payload.

---

## `GET /admin/users`
- **Request:** None
- **Response:** Array of users (with roles).

## `PATCH /admin/users/{id}/status`
- **Request:** 
  ```json
  { "status": "Inactive" }
  ```
- **Response:** Updated user.

## `PATCH /admin/users/{id}/reset-password`
- **Request:** Raw string body containing the new password. (Not a JSON object).
- **Response:** `void`

## `GET /admin/rbac/roles`
- **Request:** None
- **Response:** Array of Roles.

## `GET /admin/rbac/permissions`
- **Request:** None
- **Response:** Array of Permissions.

## `POST /admin/rbac/roles/{roleId}/permissions/{permissionId}`
- **Request:** None
- **Response:** `void`

## `DELETE /admin/rbac/roles/{roleId}/permissions/{permissionId}`
- **Request:** None
- **Response:** `void`

## `GET /admin/system-configs`
- **Request:** None
- **Response:** Array of `configKey`/`configValue` pairs.

## `POST /admin/system-configs`
- **Request:**
  ```json
  {
    "configKey": "MAX_SLOTS",
    "configValue": "500",
    "description": "Max slots"
  }
  ```
- **Response:** The created config.

## `PUT /admin/system-configs/{key}`
- **Request:** Same as POST.
- **Response:** The updated config.

## `DELETE /admin/system-configs/{key}`
- **Request:** None
- **Response:** `void`

## `GET /admin/audit-logs`
- **Query Params:** `action`, `entityName`, `from`, `to`
- **Response:** Array of Audit Logs.
