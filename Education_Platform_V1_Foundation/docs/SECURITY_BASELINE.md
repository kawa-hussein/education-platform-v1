# Security Baseline

Implemented now:
- Provider Platform Owner is a distinct provider-side role.
- Tenant users operate through scoped role assignments.
- Branch managers cannot access other branches unless their assignment allows it.
- Delegated administrators cannot assign equal/higher roles than their current delegated authority.
- Session token is never stored in plaintext in D1.
- Passwords are never stored in plaintext.
- All state-changing browser calls are protected by same-origin checks + SameSite cookie.
- Audit events include actor, tenant, branch, entity and request correlation.

Required before commercial production:
- Cloudflare WAF and rate limits
- MFA
- email verification / password reset
- support access approval workflow
- dedicated sensitive-module permissions
- R2 private document storage
- background queues
- formal backup/restore testing
- monitoring/alerting
- penetration test
- privacy and retention configuration per country
