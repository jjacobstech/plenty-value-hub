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

- [x] Migration + model `partner_affiliates`.
- [x] Serializer `toApi()` per model returning the openapi shape (unix seconds, public ids only).
- [x] Cursor pagination helper (`limit`, `starting_after`, `has_more`).
- [x] `POST/GET /v1/affiliates`, `GET/PATCH /v1/affiliates/:id`. Create-or-get via `INSERT ... ON CONFLICT DO NOTHING` then select.
- [x] Tests: create vs existing (201/200), 20 concurrent creates → 1 row, isolation across partners and modes, metadata limits, status update.

Notes:
- `partnerIdempotency` (M1 leftover) is built here, on `POST /v1/affiliates`. Thrown 4xx errors are not stored, so a retry runs again. Only completed responses and 5xx-free results are replayed.
- Unknown body fields are rejected by `rejectUnknownFields`, because VineJS silently drops them by default.
- Shield matches route patterns, not URLs. `/v1/affiliates`, `/v1/affiliates/:id` and `/r/:code` are listed in `config/shield.ts` (add each new `/v1` POST, PATCH or DELETE route there).
- `affiliate.created` emission is not wired yet (M6).
- Run the partner tests with `node ace test functional --files tests/functional/partner_api/auth.spec.ts --files tests/functional/partner_api/affiliates.spec.ts`. `--files <directory>` runs nothing.


## M3 — Links, redirect, clicks

- [x] Migrations + models `partner_links`, `partner_clicks`.
- [x] `POST/GET /v1/links`, `GET /v1/links/:id`, `POST /v1/links/:id/disable`.
- [x] Destination allowlist validation (host or subdomain match, https required in live mode).
- [x] Public `GET /r/:code` controller: visitor hash with daily salt, unique-click logic, bot filter, UTM passthrough, append click id param, never 500.
- [x] Env `PUBLIC_REDIRECT_BASE_URL` added to `start/env.ts`.
- [x] Tests: create-or-get, `update_destination`, disallowed domain, redirect Location header correct, raw vs unique counting, bot not counted, disabled link, suspended affiliate still redirects.

Notes:
- Redirect base is `PUBLIC_REDIRECT_BASE_URL`, falling back to `APP_URL`. Added to `.env.example`.
- Visitor hash: sha256(ip | user agent | daily salt). The salt comes from APP_KEY and the UTC date, so it is not stored and hashes cannot be linked across days.
- Clicks are written after the redirect is sent. A crash in that gap loses the click; the redirect still works. A queue (BullMQ) can take over if loss matters.
- Not built: the 60-second in-memory link cache (the redirect is one indexed lookup). Add it if redirect latency shows up in load tests.
- A suspended partner gets 404 on the redirect. The spec does not say; this is the conservative choice. A suspended affiliate still redirects, as the spec requires.
- Bot and visitor-limit checks run after the redirect, so a bot still gets its 302.

## M4 — Events and attribution

- [x] Migration + model `partner_events`.
- [x] `app/services/partner/attribution_service.ts` implementing SPEC §8 Events steps 1–4 in one transaction. Steps 5 (commission) and 6 (webhooks) follow in M5 and M6.
- [x] Hook fraud heuristics (reuse from `FraudDetectionService` where possible, otherwise small partner-local checks: >N events per affiliate per hour, same visitor_hash converting > N times per day).
- [x] `POST/GET /v1/events`, `GET /v1/events/:id`, `POST /v1/events/:id/reverse`.
- [x] Tests: dedupe by event_id (200 with original), each reason code, window boundary (exactly N days in, N days + 1s out), first_click vs last_click, type not allowed → 400.

Notes:
- Fraud limits are partner-local constants: 50 attributed events per affiliate per hour, and 5 attributed events per visitor hash per day. Both are constants, not per-program settings yet.
- Event `commission` is null until M5.
- First-click uses the earliest attributed event for the referred customer, so the click is the one that first brought them in.
- Redirect and event tests share a visitor hash limit (60/min) through the same user agent. Keep test user agents distinct if the suite starts to flake.

## M5 — Commissions

- [x] Migration + model `partner_commissions`.
- [x] Commission creation inside attribution (flat and percent, `decimal.js`, round half-up to minor units).
- [x] `GET /v1/commissions`, `GET /v1/commissions/:id`, `POST approve|reject|mark_paid`.
- [x] State machine helper enforcing allowed transitions.
- [x] Ace command `partner:approve-commissions`.
- [x] Tests: maths, transitions, reversal of approved, command approves only due + auto-approve programs.

Notes:
- The recurring approval is a BullMQ job scheduler (`approve-commissions`, every 10 minutes) on queue `partner-jobs`. It runs in `node ace partner:worker`, which needs Redis at `QUEUE_REDIS_HOST:QUEUE_REDIS_PORT`. These are now in `start/env.ts`.
- `ioredis` is installed as BullMQ's Redis client. It is pinned to 5.11.1, the version BullMQ 6 tests against.
- Percent commissions: `decimal.js`, basis points, round half-up. 1235 at 1000 bps gives 124.
- Commission currency: flat uses the program's commission_currency (or the event currency if it is unset). Percent uses the event currency.
- Reversing an event reverses its commission in any state, in one transaction.
- Commission webhooks (commission.created, approved, reversed) are wired in M6.

## M6 — Webhooks

- [x] Migrations + models `partner_webhook_endpoints`, `partner_webhook_events`, `partner_webhook_deliveries`.
- [x] `webhook_emitter.ts`: `emit(trx, partner, livemode, type, object)` writes outbox + deliveries within the caller's transaction. Wire into M2–M5 at every state change listed in SPEC §9.
- [x] `webhook_signer.ts` and a `verifySignature` helper (exported for docs and tests).
- [x] Ace command `partner:deliver-webhooks` with retry schedule, 10s timeout, response excerpt, endpoint auto-disable after 3 days of failures + email owners.
- [x] Secret rotation with dual signing for 24h.
- [x] Ace command `partner:prune` (idempotency keys >24h, webhook deliveries >30 days).
- [x] Tests: signature round-trip, rollback writes no outbox, retry timing, event type filtering per endpoint.

Notes:
- Emission is wired into affiliate.created and affiliate.updated, link.created, the three conversion.* events, commission.created, commission.approved (manual and auto), commission.rejected, commission.reversed, commission.paid and conversion.reversed. Each write runs in the transaction of the change.
- Retries: one first attempt, then retries after 1m, 5m, 30m, 2h, 5h, 10h, 24h and 24h. That is 9 attempts in total. The endpoint is disabled after 3 days of continuous failure, and its owners are emailed.
- Delivery runs as a BullMQ job every minute, not right after commit. Latency is up to a minute.
- Endpoint management (create, rotate, enable) is a service API for now. The portal in M8 is the UI for it.
- Not built: the "trigger right after commit" optimisation.
- Prune runs as a daily BullMQ job.

## M7 — Stats

- [x] `stats_service.ts` with SQL aggregates for summary and per-affiliate, `group_by` support.
- [x] `GET /v1/stats/summary`, `GET /v1/affiliates/:id/stats`.
- [x] Indexes checked with `EXPLAIN` on a seeded 100k-click dataset; note timings in RECON.md.
- [x] Tests on a fixed seeded dataset with hand-computed expected numbers.

Notes:
- EXPLAIN ANALYZE on 100,000 seeded clicks (71,679 in a 42-day window), on the dev database, then removed:
  - Summary totals, whole window: 55 ms, using the existing (partner_id, livemode, affiliate_id, clicked_at) index.
  - Summary grouped by day: 56 ms, a sequential scan. The planner prefers it at this selectivity.
  - One affiliate's totals: 0.03 ms, index-only scan.
  - An extra (partner_id, livemode, clicked_at) index was tested and not kept. It gave no clear gain and the planner ignored it.
- The SPEC threshold for a daily rollup is 300 ms at 1M clicks. Extrapolated, the whole-window query is near that at 1M, so re-measure at scale before adding a rollup.
- Commission amounts: a bucket in mixed currencies returns amount null and currency null. Amounts are not converted, so they are never summed across currencies. Follow-up if the portal needs totals in one currency.
- Money is never summed across currencies. Group totals follow the same rule.

## M8 — Developer portal and admin

- [x] Role handling for partner members; `/partner` route group behind auth + partner membership.
- [x] Inertia pages (SPEC §10): overview, API keys, webhooks + delivery log + resend + test event, program settings, affiliates, events & commissions, team.
- [x] Test/live toggle stored in session.
- [x] Admin: partners list/create/suspend in existing admin area.
- [x] Reuse existing shadcn components; do not modify shared components in a way that changes marketplace pages. (The portal uses plain Tailwind and shadcn-free markup, so no shared component was touched.)
- [x] Functional tests for portal controllers (authorization: viewer cannot create keys, non-member gets 404). `tests/functional/partner_portal/portal.spec.ts`, 11 passing, signing in through the real `/auth/login` form.

Notes:
- Roles: viewers read only. Developers manage keys and webhooks. Owners and admins also manage the program, affiliates, commissions and team. Non-members get 404 on /partner.
- The portal is server-rendered Inertia pages. New frontend files typecheck clean. The frontend project has 992 errors overall. Five are in `AdminAnalytics.tsx`, which had an uncommitted change before this work.
- The one-time secrets (keys, webhook signing secrets) come back in the response that creates them. They are not stored in the session.
- Team invites add an existing account only. There is no invitation email yet.
- The portal has no browser-level test. The tests check the HTML data and the redirects over HTTP. Please click through /partner once in a browser.
- Sign-in attempts are throttled (10 per 15 minutes per IP). The portal test clears the limiter store before each test.
- Delivery rows use their numeric id in the portal. They are not part of the API, so this does not break the no-numeric-ids rule.
- Admin partner creation makes the partner and its programs, but no keys. The owner creates keys in the portal.

## M9 — Hosted affiliate dashboard

- [x] Migration + model `partner_dashboard_sessions`.
- [x] `POST /v1/affiliates/:id/dashboard_sessions`.
- [x] `/a/session/:token` redeem → signed cookie → `/a` read-only dashboard page (stats, links with copy, commissions, chart via existing recharts).
- [x] Tests: single use, expiry, cookie scoping, affiliate can see only their own data. `tests/functional/partner_api/dashboard.spec.ts`, 6 passing.

Notes:
- The dashboard is served from APP_URL (`/a`, `/a/session/:token`). No separate dashboard host env var is needed.
- The redeemed session is kept in an encrypted cookie for 12 hours, scoped to `/a`, HttpOnly, SameSite=Lax. A session link works once and expires after 5 minutes.
- return_url must be on the partner's allowed domains. A suspended partner's dashboard returns 404.
- The chart is CSS bars, not recharts. This keeps the page free of extra type errors. Swap in recharts if the chart needs more.

## M10 — Docs and hardening

- [x] Update `openapi.yaml` to match what was actually built (it is the source of truth for partners).
- [x] Serve rendered docs at `/docs/api` (static page using the OpenAPI file) and `QUICKSTART.md` content.
- [x] Security pass: no secrets in logs, all `/v1` queries scoped (grep every Lucid query in `partner_api` controllers/services for `partner_id` and `livemode`), body size limit, CORS denies browser calls to `/v1`.
- [x] Final report in `docs/partner-api/RECON.md` → "Build notes": what was built, deviations, follow-ups.

Notes:
- openapi: the dashboard session response now returns the `id` it documents. Info describes JSON-only, the 64 KB limit, the CORS denial, Request-Id and rate limits.
- Security pass: no console output and no secret-bearing log fields in the partner code. Every /v1 query is scoped by partner and mode, except three intended cases: the public `/r/:code` lookup, the background approval and webhook jobs, and the dashboard token lookup (by hash).
- The body limit and CORS denial are in `partner_body_limit_middleware` (server stack) and `config/cors.ts`.
- The QUICKSTART end-to-end test is `tests/functional/partner_api/quickstart.spec.ts`.
