# Partner API — Build Plan

Work top to bottom. Each milestone ends with: backend typecheck clean, new frontend files typecheck clean, `node ace test` green, one commit `feat(partner-api): M<n> <title>`. Tick boxes as you go and add notes under the milestone if you deviate from SPEC.md.

---

## M0 — Recon (no code changes)

- [x] Read SPEC.md and openapi.yaml fully.
- [x] Read: `start/routes.ts`, `start/kernel.ts`, `start/limiter.ts`, `config/shield.ts`, `config/auth.ts`, `app/middleware/role_middleware.ts`, `app/middleware/mobile_csrf_exemption.ts`, `app/middleware/affiliate_attribution_middleware.ts`.
- [x] Read: `app/services/affiliate_link_service.ts`, `app/controllers/vendor_conversions_controller.ts`, `app/models/vendor_conversion.ts`, `app/services/commission_service.ts`, `app/services/fraud_detection_service.ts`, `app/services/encryption_service.ts`, `app/services/json_logger.ts`, `app/controllers/purchase_destinations_controller.ts`, `inertia/pages/AffiliateRedirect.tsx`.
- [x] Check how scheduled jobs run today (look for ace commands, `report_schedule`, any cron/scheduler). Pick the mechanism for the three recurring commands.
- [x] Check the test setup (`tests/bootstrap.ts`, `.env.test`, DB used in tests).
- [x] Write `docs/partner-api/RECON.md`:
  - which helpers to reuse (slug/code generation, click id, attribution window, fraud checks) and whether to extract them into shared functions without changing marketplace behaviour
  - how CSRF exemption, rate limiting and role checks will be wired
  - scheduler choice
  - any conflict with SPEC.md and your proposed resolution
- [ ] **Stop and show RECON.md to the user before M1.**

## M1 — Foundations: partners, keys, auth

- [x] Migrations + models: `partners`, `partner_members`, `partner_api_keys`, `partner_programs`, `partner_idempotency_keys`.
- [x] `app/services/partner/public_id.ts` (prefixed nanoid), `api_key_service.ts` (generate, hash, verify, revoke).
- [x] Middleware `partnerApiAuth` (named), sets `ctx.partner`, `ctx.livemode`, `ctx.apiKey`; `Request-Id` header.
- [x] Error formatter for `/v1` (exception handler branch or `PartnerApiException`) producing the SPEC error shape, including VineJS validation errors mapped to `parameter_invalid` / `parameter_missing` / `parameter_unknown`.
- [ ] `partnerIdempotency` middleware. (deferred to M2, the first milestone with POST routes)
- [x] Per-key rate limiting.
- [x] CSRF exemption for `/v1/*` and `/r/*`.
- [x] Route group `/v1` with `GET /v1/ping`.
- [x] Ace command `partner:create --name --owner-email [--domains]` → creates partner, owner membership, programs for test and live, prints both secret keys once.
- [x] Tests: auth cases, ping, error shape, per-key limit (`tests/functional/partner_api/auth.spec.ts`, 11 passing). Idempotency tests moved to M2.

Notes:
- Ids are `increments` (integer) to match the existing `users` FK type. Public ids are prefixed as SPEC §2 says.
- `last4` is stored as `last4` (not Lucid default `last_4`).
- Tests run on `plenty_value_hub` as approved. Each test removes the partner it created.
- Global router middleware (session, auth) still runs on `/v1` (see RECON §2).


## M2 — Affiliates

- [ ] Migration + model `partner_affiliates`.
- [ ] Serializer `toApi()` per model returning the openapi shape (unix seconds, public ids only).
- [ ] Cursor pagination helper (`limit`, `starting_after`, `has_more`).
- [ ] `POST/GET /v1/affiliates`, `GET/PATCH /v1/affiliates/:id`. Create-or-get via `INSERT ... ON CONFLICT DO NOTHING` then select.
- [ ] Tests: create vs existing (201/200), 20 concurrent creates → 1 row, isolation across partners and modes, metadata limits, status update.

## M3 — Links, redirect, clicks

- [ ] Migrations + models `partner_links`, `partner_clicks`.
- [ ] `POST/GET /v1/links`, `GET /v1/links/:id`, `POST /v1/links/:id/disable`.
- [ ] Destination allowlist validation (host or subdomain match, https required in live mode).
- [ ] Public `GET /r/:code` controller: visitor hash with daily salt, unique-click logic, bot filter, UTM passthrough, append click id param, never 500.
- [ ] Env `PUBLIC_REDIRECT_BASE_URL` added to `start/env.ts`.
- [ ] Tests: create-or-get, `update_destination`, disallowed domain, redirect Location header correct, raw vs unique counting, bot not counted, disabled link, suspended affiliate still redirects.

## M4 — Events and attribution

- [ ] Migration + model `partner_events`.
- [ ] `app/services/partner/attribution_service.ts` implementing SPEC §8 Events steps 1–6 in one transaction.
- [ ] Hook fraud heuristics (reuse from `FraudDetectionService` where possible, otherwise small partner-local checks: >N events per affiliate per hour, same visitor_hash converting > N times per day).
- [ ] `POST/GET /v1/events`, `GET /v1/events/:id`, `POST /v1/events/:id/reverse`.
- [ ] Tests: dedupe by event_id (200 with original), each reason code, window boundary (exactly N days in, N days + 1s out), first_click vs last_click, type not allowed → 400.

## M5 — Commissions

- [ ] Migration + model `partner_commissions`.
- [ ] Commission creation inside attribution (flat and percent, `decimal.js`, round half-up to minor units).
- [ ] `GET /v1/commissions`, `GET /v1/commissions/:id`, `POST approve|reject|mark_paid`.
- [ ] State machine helper enforcing allowed transitions.
- [ ] Ace command `partner:approve-commissions`.
- [ ] Tests: maths, transitions, reversal of approved, command approves only due + auto-approve programs.

## M6 — Webhooks

- [ ] Migrations + models `partner_webhook_endpoints`, `partner_webhook_events`, `partner_webhook_deliveries`.
- [ ] `webhook_emitter.ts`: `emit(trx, partner, livemode, type, object)` writes outbox + deliveries within the caller's transaction. Wire into M2–M5 at every state change listed in SPEC §9.
- [ ] `webhook_signer.ts` and a `verifySignature` helper (exported for docs and tests).
- [ ] Ace command `partner:deliver-webhooks` with retry schedule, 10s timeout, response excerpt, endpoint auto-disable after 3 days of failures + email owners.
- [ ] Secret rotation with dual signing for 24h.
- [ ] Ace command `partner:prune` (idempotency keys >24h, webhook deliveries >30 days).
- [ ] Tests: signature round-trip, rollback writes no outbox, retry timing, event type filtering per endpoint.

## M7 — Stats

- [ ] `stats_service.ts` with SQL aggregates for summary and per-affiliate, `group_by` support.
- [ ] `GET /v1/stats/summary`, `GET /v1/affiliates/:id/stats`.
- [ ] Indexes checked with `EXPLAIN` on a seeded 100k-click dataset; note timings in RECON.md.
- [ ] Tests on a fixed seeded dataset with hand-computed expected numbers.

## M8 — Developer portal and admin

- [ ] Role handling for partner members; `/partner` route group behind auth + partner membership.
- [ ] Inertia pages (SPEC §10): overview, API keys, webhooks + delivery log + resend + test event, program settings, affiliates, events & commissions, team.
- [ ] Test/live toggle stored in session.
- [ ] Admin: partners list/create/suspend in existing admin area.
- [ ] Reuse existing shadcn components; do not modify shared components in a way that changes marketplace pages.
- [ ] Functional tests for portal controllers (authorization: viewer cannot create keys, non-member gets 404).

## M9 — Hosted affiliate dashboard

- [ ] Migration + model `partner_dashboard_sessions`.
- [ ] `POST /v1/affiliates/:id/dashboard_sessions`.
- [ ] `/a/session/:token` redeem → signed cookie → `/a` read-only dashboard page (stats, links with copy, commissions, chart via existing recharts).
- [ ] Tests: single use, expiry, cookie scoping, affiliate can see only their own data.

## M10 — Docs and hardening

- [ ] Update `openapi.yaml` to match what was actually built (it is the source of truth for partners).
- [ ] Serve rendered docs at `/docs/api` (static page using the OpenAPI file) and `QUICKSTART.md` content.
- [ ] Security pass: no secrets in logs, all `/v1` queries scoped (grep every Lucid query in `partner_api` controllers/services for `partner_id` and `livemode`), body size limit, CORS denies browser calls to `/v1`.
- [ ] Final report in `docs/partner-api/RECON.md` → "Build notes": what was built, deviations, follow-ups.
