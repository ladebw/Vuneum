# API Reference

Vuneum exposes a REST API for all core workflows. All endpoints return JSON.

## Authentication

Most endpoints require authentication via NextAuth.js session cookies. Include the session cookie from a logged-in browser session, or authenticate via the credential provider:

```
POST /api/auth/register
POST /api/auth/[...nextauth]
```

## Role-Based Access

| Role | Permissions |
|---|---|
| `RESEARCHER` | Submit reports, view own reports, file disputes, view own payouts |
| `COMPANY` | Manage own programs, triage reports on own programs, create payouts |
| `TRIAGER` | Triage any report, mark duplicates, resolve disputes |
| `ADMIN` | Full access to all resources |

---

## Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `GET/POST` | `/api/auth/[...nextauth]` | No | NextAuth handler (sign in, sign out, session) |

### Programs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/programs` | No* | List programs. Query: `?status=PUBLIC&visibility=PUBLIC` |
| `POST` | `/api/programs` | Company, Admin | Create a new program |
| `GET` | `/api/programs/[id]` | No* | Get program details. Private programs require auth. |
| `PATCH` | `/api/programs/[id]` | Owner, Admin | Update program settings |
| `DELETE` | `/api/programs/[id]` | Owner, Admin | Delete a program |
| `POST` | `/api/programs/[id]/scope` | Owner, Admin | Add a scope asset |
| `DELETE` | `/api/programs/[id]/scope` | Owner, Admin | Remove a scope asset |
| `POST` | `/api/programs/[id]/tiers` | Owner, Admin | Add a reward tier |
| `DELETE` | `/api/programs/[id]/tiers` | Owner, Admin | Remove a reward tier |

### Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reports` | Auth | List reports (scoped to user role) |
| `POST` | `/api/reports` | Researcher | Submit a new report |
| `GET` | `/api/reports/[id]` | Auth | Get report detail with timeline, comments, evidence |
| `PATCH` | `/api/reports/[id]` | Triager, Admin | Update report status (triage action) |
| `GET` | `/api/reports/[id]/comments` | Auth | Get report comments |
| `POST` | `/api/reports/[id]/comments` | Auth | Add a comment |
| `POST` | `/api/reports/duplicate` | Triager, Admin | Mark a report as duplicate (requires proof) |

### Report Status Transitions

Valid transitions are enforced server-side:

```
SUBMITTED → VIEWED, UNDER_REVIEW, NEEDS_MORE_INFO, CLOSED
VIEWED → UNDER_REVIEW, NEEDS_MORE_INFO, CLOSED
UNDER_REVIEW → NEEDS_MORE_INFO, VALIDATED, DUPLICATE_CLAIMED, REJECTED, CLOSED
NEEDS_MORE_INFO → UNDER_REVIEW, VALIDATED, REJECTED, CLOSED
VALIDATED → ACCEPTED, REJECTED, DISPUTED, CLOSED
DUPLICATE_CLAIMED → CLOSED, DISPUTED
DISPUTED → ACCEPTED, REJECTED, VALIDATED, CLOSED
ACCEPTED → PAID, DISCLOSED, CLOSED
REJECTED → CLOSED, DISPUTED
PAID → DISCLOSED, CLOSED
DISCLOSED → CLOSED
CLOSED → (terminal)
```

### Duplicate Claims

`POST /api/reports/duplicate`

All five fields are **required**. The request will be rejected if any is missing:

```json
{
  "originalReportId": "uuid",
  "duplicateReportId": "uuid",
  "rootCauseExplanation": "...",
  "assetComparison": "...",
  "impactOverlapComparison": "...",
  "firstSubmissionComparison": "...",
  "triagerReasoning": "..."
}
```

### Disputes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/disputes` | Auth | List disputes (scoped to user) |
| `POST` | `/api/disputes` | Researcher | File a new dispute |
| `PATCH` | `/api/disputes/[id]` | Triager, Admin | Respond to and resolve a dispute |

### Payouts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/payouts` | Auth | List payouts (researchers see own only) |
| `POST` | `/api/payouts` | Company, Admin | Create a payout for an accepted report |
| `PATCH` | `/api/payouts/[id]` | Company, Admin | Mark payout as paid, add payment reference |

Platform fee is calculated at payout creation: `platformFee = rewardAmount × (feePct / 100)`, `researcherNet = rewardAmount - platformFee`.

### Transparency

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/transparency` | No | Get transparency metrics for all programs |

### Reputation

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reputation` | Auth | Get reputation profiles |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin` | Admin | Get platform overview (users, programs, reports, payouts) |

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

Common HTTP status codes:

| Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate resource) |
| 500 | Internal server error |
