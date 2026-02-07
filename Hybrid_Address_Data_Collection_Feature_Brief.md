# Hybrid Address Data Collection — Feature Brief

## Stack
- **Frontend:** Next.js (App Router), React, TypeScript
- **Backend:** Node.js (Server Actions / API Routes)
- **Database:** PostgreSQL
- **ORM:** Prisma 7.x
- **Auth / Identity:** JWT + DB-backed users
- **Infra:** VPS / Docker-ready, CI/CD enabled

---

## Feature Overview
**Hybrid Address Data Collection**

We are implementing a hybrid approach to address handling that combines low-friction user input with future-ready structured data. The system initially accepts a single free-form address string, while supporting optional structured fields for later parsing, enrichment, and automation.

---

## Goals
- Minimize user friction during data entry (especially on mobile)
- Preserve raw address input without data loss
- Enable future automation (routing, geocoding, service areas)
- Support international address formats
- Avoid premature validation or rigid schemas
- Allow gradual evolution without breaking migrations

---

## Milestones & Completion Criteria

### Milestone 1: Raw Address Capture
**Description:**  
Accept and store a single-line address input from forms.

**Completion Criteria:**
- Form accepts a free-text address field
- Address is trimmed and whitespace-normalized
- Stored as `addressRaw` (nullable) in the database
- No strict address validation enforced

---

### Milestone 2: Hybrid Schema Support
**Description:**  
Extend the data model to support structured address fields alongside raw input.

**Completion Criteria:**
- Prisma schema includes nullable fields:
  - `street1`, `street2`, `city`, `region`, `postalCode`, `country`
- Existing records remain valid
- No required structured fields at write time

---

### Milestone 3: Normalization & Safety
**Description:**  
Harden input handling without increasing user friction.

**Completion Criteria:**
- Control characters rejected
- Max-length constraints enforced
- Whitespace normalization applied consistently
- Errors returned in structured, user-safe format

---

### Milestone 4: Future Enrichment Readiness
**Description:**  
Prepare the system for address parsing and geocoding integrations.

**Completion Criteria:**
- Schema supports latitude/longitude (nullable)
- Raw address preserved for reprocessing
- No coupling to a specific provider (Google, Mapbox, etc.)
- Clear extension points in code for enrichment jobs

---

## Non-Goals (for now)
- Real-time address verification
- Mandatory structured address entry
- Country-specific validation rules
- External API dependency at form submission time

---

**Principle:**  
> Optimize for human input today, machine intelligence tomorrow.
