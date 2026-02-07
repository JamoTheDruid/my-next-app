# Option 4 – Server‑Side Sessions (Implementation Outline)

## Goal
Use a **server‑side session store** (Postgres or Redis) as the source of truth for authentication and authorization. The browser stores **only a session identifier cookie**. Every request resolves:

```
cookie → session → user → roles
```

This avoids stale JWT claims, enables immediate revocation, and supports enterprise‑grade controls.

---

## Keywords
- **AuthN (Authentication):** Who the user is (is the session valid?)
- **AuthZ (Authorization):** What the user can do (roles / permissions)
- **Session ID:** Random identifier stored in an HTTP‑only cookie
- **Session store:** Database table (or Redis) holding active sessions
- **Revocation:** Invalidating a session immediately
- **Rotation:** Issuing a new session ID periodically
- **TTL / Expiry:** Maximum session lifetime
- **Last seen:** Timestamp updated on activity
- **Device metadata:** IP address, user agent, device label (optional)
- **Role resolution:** Loading roles via `UserRole → Role.key`

---

## Core Code Objects You’ll Work With

### Prisma Models
- `User`
- `Role`
- `UserRole`
- `Customer`
- `CustomerUser`
- **`Session` (new)**
- *(Optional later)* `AuditLog`

### Libraries / Framework APIs
- `@prisma/client` (`PrismaClient`)
- `cookies()` from `next/headers`
- `redirect()` from `next/navigation`
- Next.js **App Router** layouts & route handlers

### Internal Modules (suggested)
- `lib/session.ts` – create / read / revoke sessions
- `lib/user.ts` – resolve current user context
- `lib/authz.ts` – `requireRole`, `requireAnyRole`

> **Note:** JWT is **not required** in this option. If used at all, it should only sign a session ID—not user roles.

---

## High‑Level Flow (End‑to‑End)

### A) Login / Signup
1. Validate credentials (password or OAuth callback)
2. Find or create `User`
3. (If applicable) Find or create `Customer`, link via `CustomerUser`
4. Create a **Session record**:
   - `id`
   - `userId`
   - `createdAt`
   - `expiresAt`
   - optional: `ip`, `userAgent`, `lastSeenAt`
5. Set cookie:
   - name: `session`
   - value: `session.id`
   - `httpOnly`, `secure`, `sameSite`, `maxAge`

Result: the browser stores **only a session ID**.

---

### B) Authenticated Requests
1. Read `session` cookie
2. If missing → unauthenticated
3. Lookup session in DB:
   - must exist
   - must not be revoked
   - must not be expired
4. Load user + roles from DB
5. Return a **user context** object:
   - `userId`
   - `email`
   - `roleKeys[]`
   - `sessionId`

---

### C) Role‑Based UI (Navbar)
- Implement in **server layouts** (recommended)
- Call `getCurrentUserContext()`
- Render nav based on `roleKeys`

No JWT role claims, no staleness.

---

### D) Authorization Enforcement
- Use helpers:
  - `requireUser()`
  - `requireRole("ADMIN")`
  - `requireAnyRole(["ADMIN", "EMPLOYEE"])`
- Helpers resolve session → user → roles
- Redirect or return `403` if unauthorized

---

### E) Logout
1. Delete `session` cookie
2. Revoke session in DB (`revokedAt = now()`)
3. Redirect to `/`

---

### F) Role Changes & Revocation
When an admin changes roles:

**Recommended policies:**
- For sensitive changes (ADMIN removal): revoke all sessions for that user
- For normal changes: roles update naturally on next request

This guarantees immediate correctness.

---

## Implementation Steps (Suggested Order)

### 1) Add the `Session` Model
Fields:
- `id`
- `userId`
- `createdAt`
- `expiresAt`
- `revokedAt`
- optional: `ip`, `userAgent`, `lastSeenAt`

Indexes:
- `userId`
- `expiresAt`
- `revokedAt`

---

### 2) Build Session Helpers (`lib/session.ts`)
Functions:
- `createSession(userId, meta)`
- `getSession(sessionId)`
- `revokeSession(sessionId)`
- `revokeAllSessionsForUser(userId)`
- `touchSession(sessionId)` (optional throttled update)

---

### 3) Update Auth Handlers
- Replace JWT issuance with `createSession()`
- Set session cookie

---

### 4) Resolve Current User via Session
- Replace JWT‑based `getCurrentUser()`
- New flow: cookie → session → user → roles

---

### 5) Implement Auth Guards
- `requireUser()`
- `requireRole(roleKey)`
- `requireAnyRole(roleKeys)`

---

### 6) Implement Role‑Based Layouts
- Use server layouts (`app/admin/layout.tsx`, etc.)
- Switch nav based on resolved roles

---

### 7) Admin Session Management (Production‑Grade)
- List active sessions per user
- Revoke individual sessions
- “Log out all devices” action

---

### 8) Cleanup & Maintenance
- Periodic cleanup of expired sessions
- Optional audit logging

---

## Early Decisions to Lock In
- Session lifetime (e.g., 7 vs 30 days)
- Sliding expiration vs fixed
- Rotation strategy (on login, on privilege change, periodically)
- Metadata storage (IP / UA)
- Revocation policy on role change
- Whether to cache roleKeys on session or always resolve live

---

## Non‑Negotiable Rules
- Cookie stores **only** session ID
- DB is the source of truth
- UI never grants access
- Server always enforces authorization

---

## Summary
Option 4 trades simplicity for **correctness, control, and long‑term scalability**. At low scale it costs almost nothing extra; at high scale it enables features JWT‑only systems cannot safely support.

This is the right backbone for a serious, long‑lived platform.

