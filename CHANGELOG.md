# Changelog

All notable changes to Vuneum will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-05-16

### Added — Initial Public Release

- 🔐 **Authentication** — Researcher, Company, Triager, and Admin roles with NextAuth v5 (credentials provider)
- 📋 **Program Management** — Create bounty programs with scope assets, reward tiers, severity definitions, and disclosure policies
- 📝 **Report Submission** — Structured reports with vulnerability type, severity claim, impact, reproduction steps, evidence, and suggested fixes
- 🔄 **Triage Workflow** — 13 report statuses with validated state transitions and immutable timeline events
- 🔁 **Duplicate Proof System** — Duplicate claims require root cause explanation, asset comparison, impact overlap, first-submission comparison, and triager reasoning
- ⚖️ **Dispute Resolution** — Researchers can dispute duplicate decisions, severity downgrades, invalid rejections, and payout issues
- 💰 **Payout Tracking** — Reward amount, platform fee calculation, researcher net payout, payment status tracking
- 📊 **Transparency Metrics** — Public metrics per program: response time, triage time, duplicate rate, rejection rate, total paid
- 🏆 **Reputation System** — Meaningful reputation based on valid reports, PoC quality, severity accuracy, and signal quality
- 🎨 **UI** — Dark/light mode, glass-morphism design, responsive layout, Lucide icons
- 🗄️ **Database** — SQLite via Prisma with 15 data models
- 📡 **API** — 18 REST endpoints covering all core workflows
- 🌱 **Seed Data** — Demo users, programs, reports, and metrics for development
