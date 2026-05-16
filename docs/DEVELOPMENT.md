# Development Setup

This guide covers how to set up and run Vuneum locally for development.

## Prerequisites

- Node.js 18+
- npm 9+

## Quick Start

```bash
# Clone the repository
git clone git@github.com:ladebw/Vuneum.git
cd Vuneum

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate a secure AUTH_SECRET (required)
# On macOS/Linux:
openssl rand -base64 32
# Paste the output as AUTH_SECRET in .env

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# (Optional) Seed demo data for development
npx tsx prisma/seed.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Credentials (Development Only)

These accounts are created by the seed script for local testing. **Do not use in production.**

| Role | Email | Password |
|---|---|---|
| Admin | admin@vuneum.io | password123 |
| Triager | triager@vuneum.io | password123 |
| Researcher | researcher@vuneum.io | password123 |
| Company | security@acmecorp.com | password123 |

## Environment Variables

See [`.env.example`](../.env.example) for the full template.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma connection string. SQLite for dev: `file:./prisma/vuneum.db`. PostgreSQL for production. |
| `AUTH_SECRET` | Yes | NextAuth secret key. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | Yes | Base URL of the application (e.g. `http://localhost:3000`). |
| `NEXT_PUBLIC_APP_URL` | No | Public URL used in client-side code. |
| `NEXT_PUBLIC_APP_NAME` | No | Display name for the application. |

## Project Structure

```
vuneum/
├── prisma/
│   ├── schema.prisma      # Data models (15 tables)
│   └── seed.ts            # Demo data seeder
├── src/
│   ├── lib/
│   │   ├── auth.ts        # NextAuth v5 configuration
│   │   ├── prisma.ts      # Prisma client singleton
│   │   ├── api-utils.ts   # Auth helpers & RBAC middleware
│   │   └── validations.ts # Zod validation schemas
│   ├── app/
│   │   ├── api/           # REST API routes (18 endpoints)
│   │   ├── (auth)/        # Login & Register pages
│   │   └── (dashboard)/   # All authenticated pages
│   └── components/
│       ├── ui/            # Reusable UI primitives (Button, Input, Card, etc.)
│       └── layout/        # Sidebar navigation
├── public/                # Static assets
├── docs/                  # Documentation
│   ├── DEVELOPMENT.md     # This file
│   └── API.md             # API reference
├── .env.example           # Environment variable template
└── package.json
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed demo data |

## Database

Vuneum uses [Prisma](https://www.prisma.io/) as the ORM. The default database is SQLite for ease of development.

### Switching to PostgreSQL

1. Update `DATABASE_URL` in your `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/vuneum"
   ```

2. Update the `datasource` provider in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Push the schema:
   ```bash
   npx prisma db push
   ```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database | SQLite / PostgreSQL via [Prisma](https://www.prisma.io/) |
| Authentication | [NextAuth.js v5](https://authjs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Validation | [Zod](https://zod.dev/) |
