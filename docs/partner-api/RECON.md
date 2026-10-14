# Partner API: M0 recon

Date: 2026-10-13. Scope: read-only review of the repo against SPEC.md, openapi.yaml and TASKS.md. No application code changed. The docs bundle was copied from `plenty-partner-api/docs/partner-api/` to `docs/partner-api/`. The original folder is untouched and can be deleted once you confirm.

## 1. Reuse: what to use and what to leave alone

| Existing code | Decision |
|---|---|
| `AffiliateLinkService.generateSlug`, `generateClickId` (`app/services/affiliate_link_service.ts`, static) | Reuse the logic. Extract into a shared helper only if the call site needs a different alphabet or length. SPEC needs an 8-char code with look-alike characters removed, so `generateSlug` probably cannot be reused as is. Write `partner/public_id.ts` with `nanoid` for the `/r/:code` code and prefixed public IDs. |
| `AffiliateLinkService.recordClick`, `recordConversion`, `findClickInAttributionWindow`, `approveConversion` | Do not reuse. They write marketplace tables (`clicks`, `conversions`, `affiliate_links`) keyed on marketplace IDs and campaigns. The partner attribution logic is new in `partner/attribution_service.ts`, with the same window and reason codes. |
| `VendorConversionsController` (`reportConversion`, `calculateCommission`, `approve`, etc.) and `VendorConversion.isHoldExpired` / `canBeApproved` | Do not call. Their commission rule is per campaign. Copy the hold-period idea into the partner state machine. |
| `CommissionService` | Do not reuse for partner commissions. Commissions go in `partner_commissions`. |
| `FraudDetectionService.analyzeConversion(conversionId)` | Do not call. It takes a marketplace conversion ID and reads marketplace tables. Write small partner-local checks (velocity per affiliate per hour, repeated conversions per visitor hash per day). |
| `encryption_service` (`encrypt`, `decrypt`) | Reuse for webhook secrets. `ENCRYPTION_KEY` is set in `.env` but missing from `.env.example`. Add it to the example file in M1. |
| `json_logger` (`logJsonEvent`) | Reuse for `Request-Id` logging. Never log keys, secrets, `Authorization` headers or raw IPs. |
| `mobile_csrf_exemption` | Pattern only. Add `/v1/*` and `/r/*` to `csrf.exceptRoutes` in `config/shield.ts` (the existing list uses `/api/...` paths). |
| `role_middleware` | Do not change it. It checks `user.role`, but partner roles live in `partner_members`. Add a separate `partnerMembership` middleware for `/partner`. This keeps marketplace routes untouched. |
| `start/limiter.ts` | Reuse the pattern. Add `partnerKeyThrottle` (per API key, live 100 / test 50 per 10s). The existing `trackingThrottle` is per IP, so it does not fit. M1 needs to confirm how `@adonisjs/limiter` keys a limit on a custom value. |
| `purchase_destinations_controller.handleRedirect` and `AffiliateRedirect.tsx` | Read only, not reused. The partner redirect is `GET /r/:code` and must never return a 500. The existing `/ref/:link_code` route is separate and does not clash. |
| `affiliate_attribution_middleware` | Runs on every router route, including `/r/*` and `/v1/*`. It only acts on a `ref` or `aff` query value that matches a marketplace link code. Accepted risk, noted below. |

## 2. Wiring

- **Auth**: `partnerApiAuth` is a new named middleware. It runs on `/v1/*` only. It parses the mode from the key prefix, hashes the key, and loads the partner. It always runs the hash, even for malformed keys.
- **Session and Inertia**: all router middleware (`session`, `shield`, `auth`) runs for every route. Adonis cannot drop global middleware for one group. `/v1` will not read or write session data, but the session middleware still runs. This is a deviation from SPEC §5, which says "never use session". It is not a security issue, because `/v1` ignores the session. Confirm you accept it.
- **CSRF**: add `/v1/*` and `/r/*` to `csrf.exceptRoutes` in `config/shield.ts`.
- **Rate limit**: per key via the new limiter. Redirect is limited per visitor hash (60/min) and only stops counting clicks, it never blocks.
- **Body size**: 64 KB limit on `/v1`. Enforce it in the bodyparser config for that route group, or in `partnerApiAuth`.
- **CORS**: `@adonisjs/cors` is in the server stack. Set `/v1` to reject browser origins in M10. Do not expose CORS headers on `/v1`.
- **Errors**: add a `PartnerApiException` branch to `app/exceptions/handler.ts` for `/v1` paths. The SPEC §6 shape is produced there. VineJS errors map to `parameter_invalid` / `parameter_missing` / `parameter_unknown`.

## 3. Scheduler

There is no in-app scheduler. `ReportSchedule` stores a `cronExpression` but nothing runs it. Proposal: run the three recurring commands from OS cron (or pm2 cron, since `bin/test.ts` references pm2):

- `node ace partner:approve-commissions` every 10 minutes
- `node ace partner:deliver-webhooks` every minute
- `node ace partner:prune` daily

Each command is idempotent, so overlapping runs are safe. Confirm the host you deploy to before M5.

## 4. Test setup

- `adonisrc.ts` defines a `functional` suite at `tests/functional/**`, 30s timeout. Create `tests/functional/partner_api/`.
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
| 2 | Partner wallet wording in docs. | Removed. Organizations only have affiliates. Done in docs. |
| 3 | `/a/session/` dashboard host is not stated. openapi uses `api.plentyvalue.com`. | Open. Proposal: `PUBLIC_DASHBOARD_BASE_URL` env var, same pattern. Needs your decision before M9. |
| 4 | SPEC §5 says `/v1` never uses session, but global middleware runs. | Accepted deviation (see §2). |
| 5 | SPEC §8 says the role middleware gets a `partner` role. | Changed. Use a separate partner membership middleware, so marketplace roles are untouched. |
| 6 | `/r/*` and `/v1/*` run `affiliate_attribution_middleware`. | Accepted. A `ref` query value only matters if it matches a marketplace link code. |
| 7 | Tests would use the marketplace database. | Fixed in M1 via `.env.test` (see §4). Needs approval. |

## 7. Milestone plan

- **M1**: migrations for `partners`, `partner_members`, `partner_api_keys`, `partner_programs`, `partner_idempotency_keys`. Add `public_id.ts`, `api_key_service.ts`, `partnerApiAuth`, the error branch, `partnerIdempotency`, rate limit, CSRF exemption, `GET /v1/ping`, and `partner:create`. Tests: auth cases, error shape, ping, idempotency.
- **M2 to M10**: as in TASKS.md. Each adds its own migrations, models, services, controllers, routes and tests. No changes to marketplace tables or routes beyond `config/shield.ts`, `start/env.ts`, `start/routes.ts` (new group only) and `app/exceptions/handler.ts`.

## 8. Open items for you

1. Dashboard host (conflict 3).
2. Approve creating the `plenty_value_test` database and running migrations against it (conflict 7).
3. Confirm the scheduler choice (§3).
4. Confirm you accept the session middleware deviation (conflict 4).

## Build notes

M0 only. Nothing built yet.
