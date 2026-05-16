# Vuneum

<div align="center">

**Researcher-First Bounty Management Platform**

*Fair triage. Transparent decisions. Proven results.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-darkblue?logo=prisma)](https://www.prisma.io/)

</div>

---

## What Vuneum Is

Vuneum is a **bounty management platform** — not a security scanner, not an AI pentesting tool. It manages the full lifecycle of a bug bounty program: submissions, triage, duplicate detection with mandatory proof, disputes, payouts, and transparency metrics.

### Vuneum is NOT:
- ❌ A vulnerability scanner
- ❌ An AI penetration testing tool
- ❌ A recon automation framework
- ❌ An exploit development platform

### Vuneum IS:
- ✅ A program management dashboard for companies
- ✅ A report submission and tracking tool for researchers
- ✅ A structured triage workflow with immutable timeline events
- ✅ A transparent duplicate-claim system requiring proof
- ✅ A dispute resolution center
- ✅ A payout tracking system
- ✅ A public transparency metrics dashboard
- ✅ A meaningful reputation system (no fake gamified points)

---

## Core Principles

| Principle | Implementation |
|---|---|
| **Fair Triage** | Every report is reviewed. No silent closes. |
| **Fast Response** | Average first response time is tracked publicly. |
| **No Ignored Reports** | Low and informational reports get triaged, not deleted. |
| **Proof-Based Decisions** | Every status change creates an immutable timeline event. |
| **Duplicate Proof Required** | Duplicate claims must provide root cause, asset comparison, impact overlap, and triager reasoning. |
| **Public Accountability** | Transparency metrics are visible for every program. |
| **Aligned Incentives** | Platform fee applies ONLY when a valid bounty is paid. If the researcher doesn't eat, Vuneum doesn't eat. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database | [SQLite](https://sqlite.org/) via [Prisma](https://www.prisma.io/) |
| Authentication | [NextAuth.js v5](https://authjs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Validation | [Zod](https://zod.dev/) |

> For production, swap SQLite with PostgreSQL by changing the `DATABASE_URL` in your `.env`.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone git@github.com:ladebw/Vuneum.git
cd Vuneum

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
# AUTH_SECRET — generate with: openssl rand -base64 32

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@vuneum.io | password123 |
| Triager | triager@vuneum.io | password123 |
| Researcher | researcher@vuneum.io | password123 |
| Company | security@acmecorp.com | password123 |

> ⚠️ These are **demo credentials only**. Change them immediately in production.

---

## Project Structure

```
vuneum/
├── prisma/
│   ├── schema.prisma      # Data models (User, Program, Report, etc.)
│   └── seed.ts            # Demo data seeder
├── src/
│   ├── lib/
│   │   ├── auth.ts        # NextAuth v5 configuration
│   │   ├── prisma.ts      # Prisma client singleton
│   │   ├── api-utils.ts   # Auth helpers & RBAC middleware
│   │   └── validations.ts # Zod validation schemas
│   ├── app/
│   │   ├── api/           # REST API (18 endpoints)
│   │   ├── (auth)/        # Login & Register pages
│   │   └── (dashboard)/   # Dashboard, Programs, Reports, etc.
│   └── components/
│       ├── ui/            # Reusable UI primitives
│       └── layout/        # Sidebar navigation
├── public/                # Static assets
├── .env.example           # Environment template
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Features

### 🔐 Role-Based Access Control
Four roles with distinct permissions: Researcher, Company, Triager, Admin.

### 📋 Program Management
Create bounty programs with scope assets, reward tiers, severity definitions, and disclosure policies. Support for draft, private, public, paused, and closed states.

### 📝 Structured Report Submission
Title, vulnerability type, claimed severity, impact assessment, reproduction steps, PoC evidence, suggested fix, and disclosure preferences.

### 🔄 Triage Workflow
13 report states with validated transitions. Every state change creates an immutable timeline event.

### 🔁 Duplicate Proof System
Duplicate claims require 5 mandatory fields:
- Root cause similarity explanation
- Affected asset/function comparison
- Impact overlap comparison
- First-submission timestamp comparison
- Triager reasoning

### ⚖️ Dispute Resolution
Researchers can dispute duplicate decisions, severity downgrades, invalid rejections, and payout issues. Each dispute requires researcher argument, triager response, and final decision.

### 💰 Payout Tracking
Track reward amount, platform fee percentage, researcher net payout, payment status, and payment proof. Platform fee applies only to paid valid bugs.

### 📊 Transparency Metrics
Public metrics for every program: average first response time, triage time, duplicate rate, rejection rate, dispute reopen rate, average payout time, total paid, and valid report count.

### 🏆 Reputation System
Meaningful reputation based on valid reports, PoC quality, severity accuracy, and signal quality. No fake gamified points.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| GET/POST | `/api/auth/[...nextauth]` | No | NextAuth handler |
| GET/POST | `/api/programs` | Varies | List / Create programs |
| GET/PATCH/DELETE | `/api/programs/[id]` | Owner/Admin | Manage program |
| POST/DELETE | `/api/programs/[id]/scope` | Owner/Admin | Manage scope assets |
| POST/DELETE | `/api/programs/[id]/tiers` | Owner/Admin | Manage reward tiers |
| GET/POST | `/api/reports` | Auth | List / Submit reports |
| GET/PATCH | `/api/reports/[id]` | Auth | View / Triage report |
| GET/POST | `/api/reports/[id]/comments` | Auth | Report comments |
| POST | `/api/reports/duplicate` | Triager/Admin | Mark as duplicate |
| GET/POST | `/api/disputes` | Auth | List / File disputes |
| PATCH | `/api/disputes/[id]` | Triager/Admin | Resolve dispute |
| GET/POST | `/api/payouts` | Auth | List / Create payouts |
| PATCH | `/api/payouts/[id]` | Company/Admin | Mark payout paid |
| GET | `/api/transparency` | No | Program transparency metrics |
| GET | `/api/reputation` | Auth | Reputation profiles |
| GET | `/api/admin` | Admin | Admin overview |

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Required variables:

- `DATABASE_URL` — Prisma database connection string
- `AUTH_SECRET` — NextAuth secret (generate with `openssl rand -base64 32`)

---

## License

MIT — see [LICENSE](LICENSE).

Copyright (c) 2026 Walid Ladeb

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

<div align="center">

**Vuneum — Aligned incentives, fair outcomes.**

</div>
