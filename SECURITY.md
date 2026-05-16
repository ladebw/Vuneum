# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Vuneum, please report it responsibly.

**Do NOT open a public issue.** Instead, email:
- **Primary**: security@vuneum.dev (create this alias or use your own)
- **Alternative**: Open a private security advisory on GitHub

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information for follow-up

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Triage**: Within 5 business days
- **Resolution**: We aim to fix critical issues within 14 days

### Scope

The following are in scope for security reports on Vuneum itself:
- Authentication bypass / privilege escalation
- Data exposure / information leakage
- Injection vulnerabilities (SQL, XSS, etc.)
- API abuse / rate limiting bypass
- Business logic flaws

### Out of Scope

- Issues in third-party dependencies (report to the dependency maintainer)
- Theoretical exploits without a working PoC
- Social engineering attacks
- Physical security
- Denial of Service attacks

### Safe Harbor

We will not pursue legal action against researchers who:
- Report vulnerabilities in good faith
- Follow responsible disclosure practices
- Do not access, modify, or delete data that does not belong to them
- Do not degrade the service for other users

## Supported Versions

| Version | Supported |
|---|---|
| 0.1.x (latest) | ✅ |
| < 0.1.0 | ❌ |

## Security Best Practices for Deployers

1. Change `AUTH_SECRET` to a strong random value
2. Use PostgreSQL instead of SQLite in production
3. Set proper CORS headers
4. Enable rate limiting on auth endpoints
5. Run behind a reverse proxy (nginx, Caddy) with HTTPS
6. Regularly update dependencies: `npm audit && npm update`
