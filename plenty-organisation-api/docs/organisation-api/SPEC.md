# Plenty Value Organisation API — Technical Spec (v1)

Status: approved for build · Owner: Plenty Value · Last updated: 2026-10-13

## 1. What this is

Plenty Value exposes its affiliate tracking engine as a public, key-authenticated API, the same way Stripe or Paystack expose payments. Any platform (a "organisation") can sign up, get API keys, and run its own referral or affiliate program on top of Plenty Value without using the Plenty Value marketplace.

Brickfort Research is the first organisation. Nothing in the code may be Brickfort-specific. Brickfort is one row in `organisations`.

### Plenty Value does

- Organisation accounts, API keys (test and live), program settings.
- Affiliates scoped to an organisation, mapped to the organisation's own user ID.
- Referral links and the public redirect that records clicks.
- Conversion attribution (attribution window, dedupe, reversals, basic fraud checks).
- Commission records (optional per program) with a hold period and approval.
- Signed outbound webhooks.
- Stats, and a hosted read-only affiliate dashboard reachable by a short-lived login link.
- A developer portal for organisation admins.

### Plenty Value does NOT do (for organisations)

- Payments, checkout, payouts or wallets. The organisation pays its affiliates. Plenty Value only reports approved amounts.
- List organisation products in the marketplace or show organisation affiliates in marketplace campaign discovery.
- Organisation end-user auth. The organisation authenticates its users and calls the API server-to-server.

## 2. Hard rules

1. **Isolation.** Every organisation-owned row has `organisation_id` and `livemode`. Every query in the organisation API is scoped by both. A key from organisation A can never read or change organisation B's data, and test keys never see live data.
2. **Marketplace untouched.** Existing marketplace tables, routes and pages keep working unchanged. Organisation data lives in `organisation_*` tables and never shows up in marketplace queries or admin marketplace reports.
3. **Secrets.** API keys are shown once at creation and stored as SHA-256 hashes plus a display prefix and last 4. Webhook signing secrets are stored encrypted (use the existing `encryption_service`). Never log keys, secrets or full request bodies containing them.
4. **Idempotency.** Every `POST` honours an `Idempotency-Key` header. Events are additionally deduplicated by the organisation's own `event_id`.
5. **Money** is integer minor units (`amount: 1500` = 15.00) plus ISO-4217 `currency`. Use `decimal.js` for any rate maths.
6. **Public IDs.** Never expose numeric DB ids. Each resource has a prefixed `public_id` generated with `nanoid` (alphabet `0-9a-zA-Z`, length 20):

| Resource | Prefix |
|---|---|
| Organisation | `ptn_` |
| API key | `key_` |
| Affiliate | `aff_` |
| Link | `lnk_` |
| Click | `clk_` |
| Event (conversion) | `evt_` |
| Commission | `com_` |
| Webhook endpoint | `we_` |
| Webhook event | `whevt_` |
| Dashboard session | `dss_` |

## 3. Stack conventions (match the existing repo)

AdonisJS 6, Lucid ORM on PostgreSQL, VineJS validators, Japa tests, Inertia + React for UI, `@adonisjs/limiter`, Luxon dates, `nanoid`, `decimal.js`. Follow the existing folder layout:

- `app/controllers/organisation_api/*_controller.ts` for `/v1`
- `app/controllers/organisation_portal/*_controller.ts` for the portal UI
- `app/services/organisation/*.ts`
- `app/models/organisation_*.ts`
- `app/validators/organisation_api.ts`
- `app/middleware/organisation_api_auth_middleware.ts`
- `database/migrations/<timestamp>_create_organisation_*.ts`
- `inertia/pages/organisation/*.tsx`
- `commands/organisation_*.ts` (ace commands)
- `tests/functional/organisation_api/*.spec.ts`

## 4. Data model

All tables: `id` bigint PK, `public_id` varchar unique (where listed), `created_at`, `updated_at` timestamptz. Organisation-owned tables also have `organisation_id` FK and `livemode boolean not null`.

### organisations
| Column | Type | Notes |
|---|---|---|
| public_id | varchar(32) unique | `ptn_` |
| name | varchar | |
| status | enum `active`, `suspended` | suspended → all keys rejected with 403 |
| contact_email | varchar | |
| allowed_redirect_domains | jsonb string[] | destination URLs must match one (exact host or subdomain) |
| click_id_param | varchar default `pv_click_id` | query param appended on redirect |

### organisation_members
Hub users who can use the developer portal for an organisation.
`organisation_id`, `user_id` FK users, `role` enum `owner`, `admin`, `developer`, `viewer`. Unique (`organisation_id`, `user_id`).

### organisation_api_keys
| Column | Type | Notes |
|---|---|---|
| public_id | `key_` | |
| organisation_id, livemode | | |
| name | varchar | label shown in portal |
| key_hash | char(64) unique | sha256 of full secret |
| prefix | varchar | e.g. `pv_live_sk_AbC1` (first 4 random chars) |
| last4 | char(4) | |
| last_used_at | timestamptz null | update at most once a minute |
| revoked_at | timestamptz null | |

Key format: `pv_test_sk_<32 random>` / `pv_live_sk_<32 random>`. Prefix tells the middleware the mode before hashing.

### organisation_programs
One row per (`organisation_id`, `livemode`). Holds the settings that the PRD left as open questions; each organisation chooses its own.

| Column | Type | Default |
|---|---|---|
| attribution_window_days | int | 30 |
| attribution_model | enum `last_click`, `first_click` | `last_click` |
| allowed_event_types | jsonb string[] | `["registration"]` |
| commission_mode | enum `none`, `flat`, `percent` | `none` |
| commission_flat_amount | int null | minor units |
| commission_percent_bps | int null | basis points, 1000 = 10% |
| commission_currency | char(3) null | |
| commission_hold_days | int | 14 |
| auto_approve_after_hold | bool | true |
| self_referral_blocked | bool | true |
| dedupe_unique_click_minutes | int | 30 (same visitor + link within N min = not unique) |

### organisation_affiliates
| Column | Type | Notes |
|---|---|---|
| public_id | `aff_` | |
| organisation_id, livemode | | |
| external_user_id | varchar(191) | organisation's user id |
| status | enum `active`, `suspended`, `closed` | |
| email | varchar null | optional, only if organisation sends it |
| display_name | varchar null | |
| metadata | jsonb default `{}` | max 20 keys, 500 chars per value |
Unique (`organisation_id`, `livemode`, `external_user_id`).

### organisation_links
| Column | Type | Notes |
|---|---|---|
| public_id | `lnk_` | |
| organisation_id, livemode | | |
| affiliate_id | FK organisation_affiliates | |
| code | varchar(16) unique | used in `/r/:code`, globally unique, opaque |
| product_ref | varchar null | organisation's product id |
| campaign_ref | varchar null | organisation's campaign id |
| destination_url | text | validated against `allowed_redirect_domains` |
| status | enum `active`, `disabled` | |
| metadata | jsonb | |
Unique (`organisation_id`, `livemode`, `affiliate_id`, `product_ref`, `campaign_ref`) using `COALESCE(...,'')` in a unique index so create-or-get reuses links.

### organisation_clicks
`public_id` (`clk_`), `organisation_id`, `livemode`, `link_id`, `affiliate_id`, `product_ref`, `campaign_ref`, `visitor_hash` (sha256 of ip + user-agent + daily salt, never raw IP), `is_unique bool`, `referrer` text null, `utm` jsonb, `user_agent_family` varchar null, `clicked_at`.
Index (`organisation_id`, `livemode`, `affiliate_id`, `clicked_at`).

### organisation_events
| Column | Type | Notes |
|---|---|---|
| public_id | `evt_` | |
| organisation_id, livemode | | |
| external_event_id | varchar(191) | organisation's id; unique (`organisation_id`, `livemode`, `external_event_id`) |
| type | varchar | must be in program `allowed_event_types` |
| click_id | FK organisation_clicks null | |
| affiliate_id | FK null | resolved by attribution |
| link_id | FK null | |
| referred_external_user_id | varchar null | the new customer on the organisation side |
| amount, currency | int null, char(3) null | for percent commissions |
| status | enum `attributed`, `unattributed`, `rejected`, `reversed` | |
| reason | varchar null | e.g. `no_click`, `outside_window`, `self_referral`, `affiliate_suspended`, `fraud_suspected`, `link_disabled`, `reversed_by_organisation` (a disallowed `type` is a 400, not a stored reason) |
| occurred_at | timestamptz | |
| metadata | jsonb | |

### organisation_commissions
`public_id` (`com_`), `organisation_id`, `livemode`, `event_id` unique, `affiliate_id`, `affiliate_external_user_id` (copied from the affiliate at creation, so the organisation can match the commission to its user without another call), `amount`, `currency`, `status` enum `pending`, `approved`, `rejected`, `reversed`, `hold_until`, `approved_at`, `rejected_at`, `reversed_at`, `paid_at` null, `payout_reference` varchar null, `reason`.
Plenty Value never marks a commission "paid". The organisation pays the affiliate on its own side, optionally sending back `POST /v1/commissions/:id/mark_paid` with its own `payout_reference` (stored, informational).

### organisation_idempotency_keys
`organisation_id`, `livemode`, `key` varchar(255), `request_method`, `request_path`, `request_hash` (sha256 of body), `response_status`, `response_body` jsonb, `locked_at`, `expires_at` (24h). Unique (`organisation_id`, `livemode`, `key`).

### organisation_webhook_endpoints
`public_id` (`we_`), `organisation_id`, `livemode`, `url` (https only in live mode), `secret_encrypted`, `enabled_events` jsonb string[] (`["*"]` allowed), `status` enum `enabled`, `disabled`, `description`.

### organisation_webhook_events (outbox)
`public_id` (`whevt_`), `organisation_id`, `livemode`, `type`, `payload` jsonb (full event envelope), `created_at`.

### organisation_webhook_deliveries
`webhook_event_id`, `endpoint_id`, `attempt` int, `status` enum `pending`, `succeeded`, `failed`, `next_attempt_at`, `response_status` int null, `response_body_excerpt` varchar(1000) null, `duration_ms`, `delivered_at`.

### organisation_dashboard_sessions
`public_id` (`dss_`), `organisation_id`, `livemode`, `affiliate_id`, `token_hash`, `expires_at` (5 minutes to redeem), `redeemed_at`, `return_url`.

## 5. Authentication and request handling

- Header: `Authorization: Bearer pv_live_sk_...`. Basic auth with key as username also accepted.
- Middleware `organisationApiAuth`: parse mode from prefix, hash, look up non-revoked key, load organisation, reject suspended organisation, attach `ctx.organisation`, `ctx.livemode`, `ctx.apiKey`. Constant-time compare not needed since lookup is by hash, but always run the hash even on malformed keys.
- `/v1/*` and `/r/*` are excluded from CSRF (see how `mobile_csrf_exemption` does it) and never use session or Inertia.
- Every response includes `Request-Id: req_<nanoid>`; log it with the json logger.
- Only `application/json` bodies. Max body 64 KB.
- Rate limit per API key with `@adonisjs/limiter`: live 100 req/10s, test 50 req/10s. Return 429 with `Retry-After` and `RateLimit-*` headers. The public redirect is limited per visitor hash (60/min) and never blocks the redirect, it just stops counting clicks.

## 6. Errors

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "parameter_invalid",
    "message": "destination_url host is not in allowed_redirect_domains",
    "param": "destination_url",
    "request_id": "req_..."
  }
}
```

| HTTP | type | Example codes |
|---|---|---|
| 400 | `invalid_request_error` | `parameter_missing`, `parameter_invalid`, `event_type_not_allowed` |
| 401 | `authentication_error` | `api_key_missing`, `api_key_invalid`, `api_key_revoked` |
| 403 | `permission_error` | `organisation_suspended`, `livemode_mismatch` |
| 404 | `invalid_request_error` | `resource_missing` |
| 409 | `idempotency_error` | `idempotency_key_reused` (same key, different body), `idempotency_key_in_use` |
| 422 | `invalid_request_error` | `affiliate_not_active`, `link_disabled`, `invalid_state_transition` |
| 429 | `rate_limit_error` | `rate_limited` |
| 500 | `api_error` | `internal_error` |

Unknown body fields → 400 `parameter_unknown`.

## 7. Idempotency

- Optional `Idempotency-Key` header (max 255 chars) on every POST.
- First request: insert row with `locked_at`. Run handler. Store status and body. Return.
- Same key, same body hash, completed → replay stored response with header `Idempotent-Replayed: true`.
- Same key, same body hash, still locked → 409 `idempotency_key_in_use`.
- Same key, different body hash → 409 `idempotency_key_reused`.
- 5xx responses are not stored (client may retry).
- Rows expire after 24h; an ace command prunes them.
- Implement as a route middleware `organisationIdempotency` so controllers stay clean.

## 8. Resources and behaviour

The full contract is in `openapi.yaml`. Behaviour that the contract cannot express:

### Affiliates
- `POST /v1/affiliates` is create-or-get by `external_user_id`. Returns 201 when created, 200 when it existed (body identical in shape). Emits `affiliate.created` only on create.
- Suspending an affiliate: existing links still redirect (do not break shared links) but clicks are recorded with no attribution credit and new events resolve to `rejected/affiliate_suspended`.

### Links
- `POST /v1/links` is create-or-get on (affiliate, product_ref, campaign_ref). If it exists and is active, return it (200). If destination differs, update destination only when `update_destination: true`.
- `url` returned = `${PUBLIC_REDIRECT_BASE_URL}/r/${code}`. `PUBLIC_REDIRECT_BASE_URL` is an env var (added to `start/env.ts`), default the app URL. Never hardcode the host.
- `code`: 8 chars from `nanoid` custom alphabet without look-alike characters. Retry on collision.

### Redirect `GET /r/:code`
1. Find link by code (cache 60s in memory is fine). Unknown or disabled → 302 to organisation fallback URL if set, else a plain 404 page. Never a 500.
2. Record click asynchronously after responding if possible; at minimum must not add >50 ms.
3. Compute `visitor_hash`. `is_unique` = no click from same hash on same link within `dedupe_unique_click_minutes`.
4. 302 to `destination_url` with `click_id_param=<clk_...>` appended (preserve existing query string, preserve UTM params from the incoming request).
5. Bots (known crawler UAs, link-preview fetchers) are redirected but not counted.

### Events (conversions)
`POST /v1/events` body: `event_id`, `type`, and one of `click_id` | `link_id` | `affiliate_id` (attribution hint), optional `referred_external_user_id`, `amount`, `currency`, `occurred_at` (default now), `metadata`.

Processing (in a DB transaction):
1. Dedupe on `event_id`. If exists, return the existing event with 200 (not an error).
2. Validate `type` ∈ program `allowed_event_types` → else 400.
3. Resolve affiliate:
   - `click_id`: click must belong to this organisation + mode; `occurred_at - clicked_at ≤ attribution_window_days` else `unattributed/outside_window`.
   - `link_id` / `affiliate_id`: direct attribution (for referral-code flows without a click).
   - none: `unattributed/no_click`.
   - If `first_click` model and `referred_external_user_id` is given, use the earliest attributed click recorded for that referred user (store `referred_external_user_id` on first event).
4. Reject cases: affiliate suspended → `rejected/affiliate_suspended`; `self_referral_blocked` and `referred_external_user_id === affiliate.external_user_id` → `rejected/self_referral`; reuse the existing `FraudDetectionService` heuristics where they apply (velocity per affiliate, same visitor_hash converting repeatedly) → `rejected/fraud_suspected`.
5. If `attributed` and `commission_mode ≠ none`: create commission `pending` with `hold_until = occurred_at + hold_days`. Percent mode requires `amount` and `currency` → else 400.
6. Emit `conversion.attributed` (or `conversion.unattributed` / `conversion.rejected`) and `commission.created`.

Response 201 with event object including `status` and `reason`.

`POST /v1/events/:id/reverse` with `reason`: event → `reversed`; its commission → `reversed` whatever its state (even `approved`). Emits `conversion.reversed`, `commission.reversed`.

### Commissions
- Ace command `organisation:approve-commissions` (run every 10 min): pending with `hold_until ≤ now` and `auto_approve_after_hold` → `approved`, emit `commission.approved`.
- `POST /v1/commissions/:id/approve` and `/reject` let the organisation act before the hold ends.
- `POST /v1/commissions/:id/mark_paid` with `payout_reference` → stores reference, status stays `approved`, sets `paid_at`. Informational only.
- Allowed transitions: pending→approved|rejected|reversed, approved→reversed. Anything else → 422 `invalid_state_transition`.

### Stats
- `GET /v1/stats/summary?from&to` → clicks, unique_clicks, conversions (attributed), conversion_rate, commissions by status (amount + count), active_affiliates.
- `GET /v1/affiliates/:id/stats?from&to&group_by=day|product|campaign`.
- Max range 366 days. Compute with SQL aggregates; add a daily rollup table only if queries exceed 300 ms at 1M clicks.

### Hosted affiliate dashboard
- `POST /v1/affiliates/:id/dashboard_sessions` with optional `return_url` → `{ url, expires_at }`. URL is `/a/session/<token>`, single use, valid 5 minutes.
- Redeeming sets a signed cookie scoped to `/a` for 12h and shows a read-only page: clicks, conversions, conversion rate, commissions by status, links with copy buttons, chart over time. No marketplace navigation, organisation name shown, "Back" goes to `return_url`.
- This is the default dashboard option. Organisations who want their own UI use the stats endpoints.

## 9. Webhooks

Event envelope:
```json
{
  "id": "whevt_...",
  "type": "commission.approved",
  "livemode": true,
  "created": 1792000000,
  "api_version": "2026-10-01",
  "data": { "object": { "...": "full resource as returned by the API" } }
}
```

Event types: `affiliate.created`, `affiliate.updated`, `link.created`, `conversion.attributed`, `conversion.unattributed`, `conversion.rejected`, `conversion.reversed`, `commission.created`, `commission.approved`, `commission.rejected`, `commission.reversed`, `commission.paid`.

Signing header:
```
PV-Signature: t=1792000000,v1=<hex hmac_sha256(secret, `${t}.${rawBody}`)>
```
Secret format `whsec_<32 random>`, shown once, rotatable (during rotation sign with both, sending two `v1=` values for 24h).

Delivery:
- Writes go to `organisation_webhook_events` in the same transaction as the state change (outbox). One `organisation_webhook_deliveries` row per matching endpoint.
- Ace command `organisation:deliver-webhooks` (run every minute; also triggered right after commit when cheap) POSTs with 10s timeout. 2xx = success.
- Retry schedule after failure: 1m, 5m, 30m, 2h, 5h, 10h, 24h, 24h (8 attempts ≈ 3 days). After final failure mark `failed`; after 3 days of continuous failure on an endpoint, disable it and email organisation owners.
- Order is not guaranteed; organisations must use `id` to dedupe. Document this.
- Portal shows deliveries with request/response excerpt and a "resend" button.

## 10. Developer portal (Inertia, `/organisation`)

For users in `organisation_members`. Add role `organisation` handling to existing role middleware without changing other roles.

Pages:
1. Overview: summary stats, test/live toggle (stored in session), quick links.
2. API keys: list (prefix…last4, name, created, last used), create (show once with copy), revoke.
3. Webhooks: endpoints CRUD, signing secret reveal-once and rotate, event type picker, "send test event", delivery log with filters and resend.
4. Program settings: all `organisation_programs` fields with validation, plus allowed redirect domains and click id param.
5. Affiliates: searchable list, detail with links, events, commissions; suspend/reactivate.
6. Events & commissions: tables with filters; approve/reject/reverse actions.
7. Team: invite members by email, roles.

Platform admin (existing admin area): Organisations list, create organisation (name, owner email), suspend/reactivate. Also ace command `organisation:create --name --owner-email` that prints test and live keys once.

New UI files must typecheck cleanly even though the wider frontend currently has type errors.

## 11. Testing (Japa functional tests, real Postgres test DB)

Must cover at minimum:
- Auth: missing, malformed, revoked, wrong mode, suspended organisation.
- Isolation: organisation A key cannot read, list or mutate organisation B resources (404, never 403, to avoid leaking existence); test key cannot see live rows.
- Idempotency: replay, reuse with different body, concurrent in-use.
- Affiliates create-or-get, no duplicates under 20 concurrent requests.
- Links create-or-get, destination allowlist, redirect 302 with click id, unique vs raw clicks, bot filtering, disabled link behaviour.
- Events: dedupe by event_id, window in/out, self-referral, suspended affiliate, type not allowed, percent commission maths, reversal of approved commission.
- Commission auto-approval command and state transitions.
- Webhooks: signature verifiable with documented algorithm, retries schedule, outbox written in same transaction (rollback = no event).
- Stats correctness on a seeded dataset.

## 12. Out of scope for v1

Payouts on behalf of organisations, multi-level/tiered organisation commissions, client-side JS SDK, organisation-facing GraphQL, embedding the dashboard via iframe (hosted link only), per-affiliate custom commission overrides (add in v1.1 via `commission_override` on affiliate).
