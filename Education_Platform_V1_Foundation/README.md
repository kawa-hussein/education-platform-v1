# Education Platform V1 Foundation

A Cloudflare-first SaaS foundation generated from the approved **Education Platform Master Architecture V6.0**.

## Target stack
- React SPA + TypeScript
- Cloudflare Workers backend API
- Cloudflare D1 database
- Cloudflare Vite plugin
- XLSX browser parsing for Excel/CSV imports

Cloudflare currently recommends the React + Vite + Workers pattern for a full-stack SPA, with bindings configured in `wrangler.jsonc`.

## Local developer flow
1. `npm install`
2. Apply local D1 migrations: `npm run db:migrate:local`
3. Run: `npm run dev`
4. Open the local URL and create the first Platform Owner.

## Cloudflare deployment later
The D1 database binding is now configured for the deployment database.
For Git-connected Cloudflare Workers Builds use:
- Build command: `npm run build`
- Deploy command: `npm run deploy`

The deploy script applies remote D1 migrations before deploying the Worker. See `DEPLOY_NOW_FA.md`.

## Security foundation
- PBKDF2-SHA256 password derivation (210k iterations)
- Random 32-byte session token; only SHA-256 token hash stored in DB
- HttpOnly, SameSite=Strict cookie
- Origin check for browser mutations
- Tenant/branch authorization on API routes
- Delegation ceiling for scoped role creation
- Provider Platform Owner separated from tenant roles
- Audit log for create/import/auth actions
- Security headers and restrictive CSP

## Architecture source
See `docs/ARCHITECTURE_SOURCE_V6.txt`.

## Current implementation scope
See `docs/IMPLEMENTATION_STATUS.md`.
