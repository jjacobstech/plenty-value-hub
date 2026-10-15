# Organisation API: M0 recon

Date: 2026-10-13. Scope: read-only review of the repo against SPEC.md, openapi.yaml and TASKS.md. No application code changed. The docs bundle was copied from `plenty-organisation-api/docs/organisation-api/` to `docs/organisation-api/`. The original folder is untouched and can be deleted once you confirm.

## 1. Reuse: what to use and what to leave alone

| Existing code | Decision |
|---|---|
| `AffiliateLinkService.generateSlug`, `generateClickId` (`app/services/affiliate_link_service.ts`, static) | Reuse the logic. Extract into a shared helper only if the call site needs a different alphabet or length. SPEC needs an 8-char code with look-alike characters removed, so `generateSlug` probably cannot be reused as is. Write `organisation/public_id.ts` with `nanoid` for the `/r/:code` code and prefixed public IDs. |
| `AffiliateLinkService.recordClick`, `recordConversion`, `findClickInAttributionWindow`, `approveConversion` | Do not reuse. They write marketplace tables (`clicks`, `conversions`, `affiliate_links`) keyed on marketplace IDs and campaigns. The organisation attribution logic is new in `organisation/attribution_service.ts`, with the same window and reason codes. |
| `VendorConversionsController` (`reportConversion`, `calculateCommission`, `approve`, etc.) and `VendorConversion.isHoldExpired` / `canBeApproved` | Do not call. Their commission rule is per campaign. Copy the hold-period idea into the organisation state machine. |
| `CommissionService` | Do not reuse for organisation commissions. Commissions go in `organisation_commissions`. |
| `FraudDetectionService.analyzeConversion(conversionId)` | Do not call. It takes a marketplace conversion ID and reads marketplace tables. Write small organisation-local checks (velocity per affiliate per hour, repeated conversions per visitor hash per day). |
| `encryption_service` (`encrypt`, `decrypt`) | Reuse for webhook secrets. `ENCRYPTION_KEY` is set in `.env` but missing from `.env.example`. Add it to the example file in M1. |
| `json_logger` (`logJsonEvent`) | Reuse for `Request-Id` logging. Never log keys, secrets, `Authorization` headers or raw IPs. |
| `mobile_csrf_exemption` | Pattern only. Add `/v1/*` and `/r/*` to `csrf.exceptRoutes` in `config/shield.ts` (the existing list uses `/api/...` paths). |
| `role_middleware` | Do not change it. It checks `user.role`, but organisation roles live in `organisation_members`. Add a separate `organisationMembership` middleware for `/organisation`. This keeps marketplace routes untouched. |
| `start/limiter.ts` | Reuse the pattern. Add `organisationKeyThrottle` (per API key, live 100 / test 50 per 10s). The existing `trackingThrottle` is per IP, so it does not fit. M1 needs to confirm how `@adonisjs/limiter` keys a limit on a custom value. |
| `purchase_destinations_controller.handleRedirect` and `AffiliateRedirect.tsx` | Read only, not reused. The organisation redirect is `GET /r/:code` and must never return a 500. The existing `/ref/:link_code` route is separate and does not clash. |
| `affiliate_attribution_middleware` | Runs on every router route, including `/r/*` and `/v1/*`. It only acts on a `ref` or `aff` query value that matches a marketplace link code. Accepted risk, noted below. |

## 2. Wiring

- **Auth**: `organisationApiAuth` is a new named middleware. It runs on `/v1/*` only. It parses the mode from the key prefix, hashes the key, and loads the organisation. It always runs the hash, even for malformed keys.
- **Session and Inertia**: all router middleware (`session`, `shield`, `auth`) runs for every route. Adonis cannot drop global middleware for one group. `/v1` will not read or write session data, but the session middleware still runs. This is a deviation from SPEC §5, which says "never use session". It is not a security issue, because `/v1` ignores the session. Confirm you accept it.
- **CSRF**: add `/v1/*` and `/r/*` to `csrf.exceptRoutes` in `config/shield.ts`.
- **Rate limit**: per key via the new limiter. Redirect is limited per visitor hash (60/min) and only stops counting clicks, it never blocks.
- **Body size**: 64 KB limit on `/v1`. Enforce it in the bodyparser config for that route group, or in `organisationApiAuth`.
- **CORS**: `@adonisjs/cors` is in the server stack. Set `/v1` to reject browser origins in M10. Do not expose CORS headers on `/v1`.
- **Errors**: add a `PartnerApiException` branch to `app/exceptions/handler.ts` for `/v1` paths. The SPEC §6 shape is produced there. VineJS errors map to `parameter_invalid` / `parameter_missing` / `parameter_unknown`.

## 3. Scheduler

There is no in-app scheduler. `ReportSchedule` stores a `cronExpression` but nothing runs it. Proposal: run the three recurring commands from OS cron (or pm2 cron, since `bin/test.ts` references pm2):

- `node ace organisation:approve-commissions` every 10 minutes
- `node ace organisation:deliver-webhooks` every minute
- `node ace organisation:prune` daily

Each command is idempotent, so overlapping runs are safe. Confirm the host you deploy to before M5.

## 4. Test setup

- `adonisrc.ts` defines a `functional` suite at `tests/functional/**`, 30s timeout. Create `tests/functional/organisation_api/`.
- `tests/bootstrap.ts` starts the HTTP server for `functional` suites.
- **Problem**: `.env.test` only sets `SESSION_DRIVER=memory`. `DB_DATABASE` comes from `.env`, which is `plenty_value_hub`, the same database the marketplace uses. A test run must not touch that database. Local Postgres has `plenty_value_hub` and `plenty_value_dev` but no test database.
- **Proposal**: add `DB_DATABASE=plenty_value_test` to `.env.test`, create that database, and run `node ace migration:run --force` against it only. Do not run migrations against `plenty_value_hub` until you approve.

## 5. Env

- Add `PUBLIC_REDIRECT_BASE_URL` to `start/env.ts` (`Env.schema.string({ format: 'url', tld: false })`), default to `APP_URL` when unset. Decision 1 from your last message.
- Add `ENCRYPTION_KEY` to `.env.example`.

## 6. Conflicts with SPEC and resolutions

| # | Conflict | Resolution |
|---|---|---|
| 1 | Redirect host in openapi and QUICKSTART was a hardcoded domain. | Built from `PUBLIC_REDIRECT_BASE_URL`. Done in docs. |
| 2 | Organisation wallet wording in docs. | Removed. Organizations only have affiliates. Done in docs. |
| 3 | `/a/session/` dashboard host is not stated. | Resolved: the dashboard is served from `APP_URL`. No new env var (your decision 1). |
| 4 | SPEC §5 says `/v1` never uses session, but global middleware runs. | Accepted deviation (see §2). |
| 5 | SPEC §8 says the role middleware gets a `organisation` role. | Changed. Use a separate organisation membership middleware, so marketplace roles are untouched. |
| 6 | `/r/*` and `/v1/*` run `affiliate_attribution_middleware`. | Accepted. A `ref` query value only matters if it matches a marketplace link code. |
| 7 | Tests would use the marketplace database. | Resolved: tests run on `plenty_value_hub` as you approved. Each test removes the organisation it creates. |

## 7. Milestone plan

- **M1**: migrations for `organisations`, `organisation_members`, `organisation_api_keys`, `organisation_programs`, `organisation_idempotency_keys`. Add `public_id.ts`, `api_key_service.ts`, `organisationApiAuth`, the error branch, `organisationIdempotency`, rate limit, CSRF exemption, `GET /v1/ping`, and `organisation:create`. Tests: auth cases, error shape, ping, idempotency.
- **M2 to M10**: as in TASKS.md. Each adds its own migrations, models, services, controllers, routes and tests. No changes to marketplace tables or routes beyond `config/shield.ts`, `start/env.ts`, `start/routes.ts` (new group only) and `app/exceptions/handler.ts`.

## 8. Decisions taken

1. Dashboard host: `APP_URL` (conflict 3).
2. Tests: `plenty_value_hub` (conflict 7).
3. Scheduler: BullMQ job scheduler on queue `organisation-jobs`, run by `node ace organisation:worker` (§3).
4. Session middleware: accepted (conflict 4).

## Build notes

Built M1 to M10 on `main`, one commit per milestone, none pushed:
`5f376ce` M1 · `405337b` M2 · `9d19109` M3 · `c9b87e1` M4 · `3c90cb5` M5 · `c5bbbac` M6 · `2cbd1a0` M7 · `6237ec0` M8 · `e05d639` M9 · M10 (this commit).

**Built**
- Organisation tables (12 migrations), models, prefixed public ids, SHA-256 hashed keys, `organisationApiAuth`, `/v1` error shape, per-key rate limits.
- Affiliates (create-or-get in one statement), links (expression unique index, destination allowlist), `/r/:code` redirect (never 500, click after response).
- Events and attribution (SPEC §8 steps 1 to 6), commissions (decimal.js, half-up, hold, state machine).
- Webhooks: outbox in the same transaction, HMAC-SHA256 signing, retries, 3-day disable with owner email, 24-hour rotation.
- Stats (grouped SQL), developer portal (`/organisation`), admin organisations (`/admin/organisations`), hosted affiliate dashboard (`/a`).
- BullMQ jobs: approve-commissions (10 min), deliver-webhooks (1 min), prune (daily). Run with `node ace organisation:worker`.
- Docs served at `/docs/api`, `/docs/api/openapi.yaml`, `/docs/quickstart`.
- Hardening: `/v1` CORS denied, 64 KB and JSON-only bodies, Request-Id on every response.

**Verification**
- 100 organisation and portal tests pass on two consecutive runs (`tests/functional/organisation_api/*`, `tests/functional/organisation_portal/*`). Among them, `quickstart.spec.ts` runs the QUICKSTART flow end to end: portal setup, API, signed webhook, reversal and dashboard.
- Backend typecheck is clean. New frontend files typecheck clean. The frontend project total is 992 errors. Five are in `AdminAnalytics.tsx`, which had an uncommitted change before this work.
- `node ace test functional` covers these suites. The old root `tests/*.spec.ts` files (run with `node --test`) fail with or without these changes. The `browser` and `unit` suites were not run.

**Deviations from the spec**
- Commission and stats money: mixed-currency buckets return a null amount rather than a converted total.
- Idempotency: thrown 4xx errors are not stored, so a retry runs again. Only completed responses are replayed.
- `ids` are integer `increments` to match `users`. Public ids are prefixed.
- Visitor hash salt is derived from APP_KEY and the UTC date, not stored.
- Dashboard chart is CSS bars, not recharts.
- Clicks are written after the redirect. A crash in that gap loses the click.
- Delivery runs every minute, not right after commit.
- Global router middleware (session, auth) still runs on `/v1`. Accepted.
- `/v1` body limit is enforced before the body parser for `/v1` only. Chunked requests without a content-length are still bounded by the global 20 MB limit.

**Follow-ups**
- Portal not clicked through in a browser. The tests check its HTML data and redirects over HTTP.
- Team invites add an existing account only. No invitation email yet.
- Reveal-once secrets are shown in the creating response only. Nothing is stored in the session.
- Re-measure stats at 1M clicks before deciding on a daily rollup (SPEC threshold 300 ms).
- Remove the stale `plenty-organisation-api/` folder once the repo copy is confirmed.
- `ioredis` is pinned to 5.11.1. Review it when bullmq moves.
- Stripe/payout money movement: out of scope, as the spec says.
