# Prisma Schema Context — Druidic Platform Ledger System

## Purpose

This document provides the structural and architectural context required for an autonomous coding agent to safely generate code that interacts with the current `schema.prisma`.

The agent must treat this document as authoritative when:

* Writing Prisma queries
* Creating migrations
* Designing API routes
* Building UI around accounting data
* Posting financial transactions
* Generating reports or dashboards

This is **schema-only context**, not business logic implementation.

---

# Technology Stack

## Core Stack

* **Next.js App Router**
* **Node.js**
* **PostgreSQL**
* **Prisma ORM (latest version)**
* **Prisma Config-based connection (NO datasource url)**

```prisma
datasource db {
  provider = "postgresql"
}
```

Connection configuration is handled externally via:

```
prisma.config.ts
```

The agent must **never reintroduce `url = env()` into schema.prisma**.

---

## Application Architecture

This system is a unified platform combining:

* Authentication
* CRM
* Property / Project management
* Finance tracking
* Double-entry accounting ledger
* Lead ingestion (Angi)

All modules share a single database.

The accounting system is integrated with operational entities but must remain **ledger-authoritative**.

---

# Accounting Architecture (Critical)

## Model Type

The accounting system follows:

### Append-Only Double Entry Ledger

NOT balance mutation.

Balances are derived from journal lines.

---

## Core Accounting Models

### Organization

Tenant boundary for accounting data.

```
Organization
 ├─ Account
 ├─ JournalEntry
 └─ AccountBalance
```

All accounting records are scoped by:

```
orgId
```

Agents must always include org scoping in queries.

---

### Account

Represents Chart of Accounts entries.

Key properties:

* Hierarchical (parent/child)
* Typed (ASSET, LIABILITY, etc)
* Soft-deactivatable (`isActive`)
* May have snapshot balance

Used by:

```
JournalLine.accountId
```

Agents must NOT delete accounts referenced by lines.

---

### JournalEntry

Represents business events.

Examples:

* Invoice posted
* Payment received
* Expense recorded
* Asset purchased

Optional links:

* User
* Customer
* Project
* Property
* Finance

This allows unified reporting across system domains.

---

### JournalLine

Represents postings.

This is the **authoritative financial data layer**.

### Signed Integer Convention

```
amountCents BigInt
```

Rules:

* Debit  → Positive
* Credit → Negative

Ledger invariants:

```
SUM(lines.amountCents) == 0
```

Agents generating write logic must enforce this.

---

### AccountBalance (Snapshot Cache)

Performance optimization only.

```
Derived State
```

Maintained transactionally alongside posting.

Used for:

* Dashboards
* Instant balance sheet
* Financial status checks

Agents must treat ledger as source of truth.

Never reconstruct history from snapshots.

---

# Integration Relationships

Journal entries may reference:

* Customer
* Project
* Property
* Finance
* User

This allows cross-domain analytics.

Agents should leverage these links when building:

* Cost per project reports
* Customer profitability
* Property lifecycle finance
* Operational ROI dashboards

---

# Operational Finance Model

The `Finance` model:

* Tracks operational money events
* May optionally link to JournalEntry

Agents may build posting pipelines:

```
Finance → JournalEntry
```

But must NOT assume automatic posting exists.

---

# Account Hierarchy Behavior

Accounts support nesting.

Agents should assume:

* Parent accounts aggregate children
* Queries may need recursive traversal
* Rollups are expected in reports

---

# Numeric Standards

Agents must adhere to:

| Context             | Type         |
| ------------------- | ------------ |
| Ledger Posting      | BigInt cents |
| Snapshots           | BigInt cents |
| Operational Finance | Float        |

No float arithmetic in accounting logic.

---

# Agent Safety Rules

### DO

* Use transactions when posting
* Validate balanced entries
* Scope by orgId
* Preserve append-only history
* Use AccountBalance only for reads

### DO NOT

* Mutate balances directly
* Delete referenced accounts
* Store floats in ledger
* Assume single-tenant context
* Reintroduce datasource URL

---

# Expected Agent Tasks

This schema is designed to support generation of:

* Posting engines
* Chart of accounts UI
* Balance sheets
* Profit/Loss
* Cash flow statements
* Ledger explorers
* Audit trails
* Reconciliation tooling
* Financial dashboards
* Automated accounting bridges

---

# Structural Summary (Mental Model)

```
Auth
 └─ User
    └─ Session
    └─ Roles

CRM
 └─ Customer
    └─ Property
    └─ Project
    └─ Finance

Accounting
 └─ Organization
    └─ Account
    └─ JournalEntry
        └─ JournalLine
    └─ AccountBalance

External Data
 └─ AngiLead
```

---

# Final Directive

This schema represents:

### A production-grade financial backbone

within a multi-domain operational platform.

Agents must optimize for:

1. Data integrity
2. Auditability
3. Performance
4. Extensibility

Over simplicity.

---

END OF CONTEXT
