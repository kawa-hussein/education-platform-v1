# Cloudflare Deployment — Do This Later

The project is prepared for Cloudflare Workers + Static Assets + D1.

Do not worry about this now. When deployment time comes, the required tasks will be:

1. Install dependencies.
2. Log in to Cloudflare.
3. Create the D1 database.
4. Put the D1 database ID in `wrangler.jsonc`.
5. Run remote migrations.
6. Deploy.
7. Create the first Platform Owner.
8. Create a trial customer and first branch.
9. Run production smoke tests.

The project deliberately keeps the database ID as a zero UUID so it cannot accidentally be deployed against an unknown database.
