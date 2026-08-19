# P29 Provider Team & Access

Implemented from Master Architecture V6 P29/P30 baseline.

- Separate provider accounts for owners, partners and employees.
- Provider role templates with segregation of duties.
- Per-user permission overrides.
- Direct account creation with temporary password.
- Private invitation links with recipient-chosen password and 7-day expiry.
- Invitation revoke, user suspend/reactivate and role changes.
- Last active Provider Owner protection and self-demotion/self-suspension protection.
- Provider team changes are written to the audit log.
- Provider navigation is filtered by effective provider permissions.

This is the first operational P29 access-management layer. MFA, email delivery, periodic access certification, temporary elevation and break-glass workflows remain later security phases.
