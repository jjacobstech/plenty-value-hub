# Prompt for Claude Code

Copy the `docs/organisation-api/` folder from this bundle into the root of the plenty-value-hub repo, then paste everything below the line into Claude Code from the repo root.

---

You are working in the **plenty-value-hub** repository (AdonisJS 6, Lucid ORM on PostgreSQL, VineJS, Japa, Inertia + React, shadcn/ui). Your job is to build the **Plenty Value Organisation API**: a public, key-authenticated API that lets any external platform run its own affiliate or referral program on Plenty Value's tracking engine, in the same way Stripe or Paystack expose payments to other platforms.

## Context

- Plenty Value is today a multi-role affiliate and vendor marketplace. That marketplace must keep working exactly as it does now.
- The new product is infrastructure only. An organisation (the first one is Brickfort Research) keeps its own users, products and checkout. Plenty Value provides: organisation accounts and API keys, affiliates mapped to the organisation's user IDs, referral links and a public redirect that records clicks, conversion attribution, optional commission records with a hold period, signed outbound webhooks, stats, a hosted read-only affiliate dashboard, and a developer portal.
- Plenty Value never moves money for organisations and holds no organisation wallets or balances. Organizations only have affiliates. The organisation pays its affiliates on its own side when it receives a `commission.approved` webhook.
- Nothing may be Brickfort-specific. Brickfort is just one row in `organisations`.

## Source of truth

Read these before doing anything else. They are already in the repo:

1. `docs/organisation-api/SPEC.md`: data model, rules, behaviour, webhooks, portal, tests.
2. `docs/organisation-api/openapi.yaml`: the exact request and response contract for `/v1`.
3. `docs/organisation-api/TASKS.md`: the milestone plan (M0 to M10) with checkboxes.
4. `docs/organisation-api/QUICKSTART.md`: what organisations will be told; your build must make every step in it work.
5. `docs/organisation-api/diagrams/`: the referral sequence and platform overview.

If the spec and the existing code disagree, the spec wins for new code, and existing marketplace behaviour wins for old code. If the spec is ambiguous or wrong, write the issue and your proposed resolution in `docs/organisation-api/RECON.md` and continue with the most conservative option. Do not silently change the API contract; if you must, update `openapi.yaml` in the same commit and note why.

## What already exists that you should reuse (verify each)

A code graph of the repo shows these. Read them in M0 and reuse their logic rather than rewriting it. Extract shared pure functions where needed, without changing marketplace behaviour:

- `app/services/affiliate_link_service.ts`: `generateSlug`, `generateClickId`, `recordClick`, `findClickInAttributionWindow`, `recordConversion`, `approveConversion`, `rejectConversion`, `reverseConversion`, `getLinkMetrics`.
- `app/controllers/vendor_conversions_controller.ts`: `reportConversion`, `performFraudDetection`, `calculateCommission`, `approve`, `reject`, `reverse`; `app/models/vendor_conversion.ts` (hold period: `isHoldExpired`, `canBeApproved`).
- `app/services/commission_service.ts`, `app/services/fraud_detection_service.ts` (`analyzeConversion`), `app/services/encryption_service.ts`, `app/services/json_logger.ts`.
- `app/middleware/mobile_csrf_exemption.ts` (pattern for CSRF exemption), `app/middleware/role_middleware.ts`, `start/limiter.ts`.
- `app/controllers/purchase_destinations_controller.ts` and `inertia/pages/AffiliateRedirect.tsx` (existing redirect handling).

Organisation data goes in **new `organisation_*` tables** (see SPEC §4). Do not add organisation rows to the marketplace tables `affiliate_links`, `clicks`, `conversions`, `vendor_conversions` or `commission_ledger`, and do not create hub `users` for organisation affiliates.

## How to work

1. **Start with M0 (recon) from TASKS.md.** Read the files listed there, write `docs/organisation-api/RECON.md`, then **stop and show me a short summary of RECON.md and your plan for M1**. Wait for my go-ahead.
2. After approval, do the milestones in order (M1 to M10). For each one:
   - Implement it with migrations, models, services, validators, controllers, routes and tests as described.
   - Run `node ace migration:run` against the dev DB, `node ace test`, and the backend typecheck. New frontend files must also typecheck. The existing frontend has about 987 type errors: do not try to fix them, and do not add new ones.
   - Tick the boxes in TASKS.md and add short notes on any deviations.
   - Commit with `feat(organisation-api): M<n> <title>`. Do not push.
   - Give me a 3 to 5 line progress note, then continue to the next milestone without waiting unless something needs my decision.
3. Stop and ask me only when you hit one of these:
   - a change that would alter marketplace behaviour
   - a destructive migration on existing tables
   - a new dependency (prefer what is already in `package.json`: `nanoid`, `decimal.js`, `luxon`, `@adonisjs/limiter`, `@vinejs/vine`)
   - a contract change to `openapi.yaml` that organisations would notice

## Non-negotiable rules

- **Isolation.** Every organisation-owned query is scoped by `organisation_id` and `livemode`. Another organisation's resource returns 404, never 403. Write a test for this on every resource.
- **Secrets.** Store API keys only as SHA-256 hashes plus prefix and last 4, and show them once. Encrypt webhook secrets with the existing encryption service. Never log keys, secrets, `Authorization` headers or raw IPs.
- **Idempotency.** Use the `Idempotency-Key` middleware on every POST, plus dedupe on the organisation's own `event_id`. Write create-or-get endpoints so they produce no duplicates under concurrency (use DB unique constraints with `ON CONFLICT`).
- **Outbox.** Write webhook events in the same DB transaction as the state change that caused them.
- **Money** is integer minor units. Calculate percent commissions with `decimal.js`, rounding half-up.
- **IDs.** The API only exposes prefixed public IDs (`aff_`, `lnk_`, `clk_`, `evt_`, `com_` and so on), never numeric IDs.
- **Redirect.** `/r/:code` must never return a 500, must add no noticeable latency, and must only redirect to the organisation's allowed domains.
- **No session or Inertia.** `/v1` is JSON only, CSRF-exempt, and rejects browser CORS.
- **Errors.** Every error uses the SPEC §6 error shape, including validation errors.
- **Tests.** Write Japa functional tests against a real Postgres test DB, covering the cases listed in SPEC §11 and in each milestone.

## Definition of done

- Every endpoint in `openapi.yaml` is implemented, matches the schema, and is covered by tests.
- Following QUICKSTART.md end to end with a test key works in a local run: create organisation → create affiliate → create link → hit `/r/:code` → post event with the click id → commission pending → approve command → signed `commission.approved` delivered to a local webhook receiver → hosted dashboard link shows the numbers.
- The developer portal and admin organisation pages work for owner, admin, developer and viewer roles.
- Backend typecheck is clean, new frontend files are clean, and all tests pass.
- `docs/organisation-api/RECON.md` ends with a "Build notes" section listing what was built, deviations from the spec and follow-ups.

Begin with M0 now.
