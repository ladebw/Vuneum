# Contributing to Vuneum

Thank you for your interest in contributing to Vuneum — the researcher-first bounty management platform.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Open an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, browser)

### Suggesting Features

Open an issue with:
- A clear description of the feature
- The problem it solves
- How it aligns with Vuneum's core principles (fair triage, transparency, aligned incentives)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Ensure the build passes: `npm run build`
5. Write or update tests if applicable
6. Commit with a clear message: `git commit -m "feat: add cool feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

### Pull Request Guidelines

- Keep PRs focused on a single change
- Follow the existing code style
- Use TypeScript types properly
- Do not commit `.env` files or database files
- Ensure `npm run build` succeeds

### Development Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

## Project Principles

When contributing, keep these principles in mind:

1. **Researcher-first** — Vuneum earns only when researchers get paid
2. **Fair triage** — Every report gets reviewed, no silent closes
3. **Transparency** — Decisions must be documented and traceable
4. **Proof required** — Duplicate claims and decisions need evidence
5. **No gamification** — Reputation must be meaningful, not fake points

## Scope

Vuneum is a bounty *management* platform. It is NOT:
- A vulnerability scanner
- An AI pentesting tool
- A recon automation framework
- An exploit development platform

Contributions adding scanner/AI-pentest features will not be accepted. Keep it focused on management, triage, disputes, and payouts.

## Questions?

Open an issue or start a discussion.
