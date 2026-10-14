# Plenty Value Partner API — Quickstart

Run a referral program on your platform with Plenty Value tracking clicks, attributing conversions and recording commissions. You keep your users and checkout, and you pay your affiliates yourself.

## 1. Get your keys

In the Plenty Value developer portal go to **API keys**. You get a test key (`pv_test_sk_...`) and a live key (`pv_live_sk_...`). Keep them on your server only. Never put them in browser code, mobile apps or links.

Also set **Allowed redirect domains** (for example `brickfortresearch.com`) in **Program settings**, and choose your attribution window, conversion event types and commission rules.

## 2. Create an affiliate for your user

Call this when your user turns on referrals (or at sign-up if everyone is enrolled). It is safe to call repeatedly: the same `external_user_id` always returns the same affiliate.

```bash
curl https://api.plentyvalue.com/v1/affiliates \
  -H "Authorization: Bearer $PV_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"external_user_id":"user_10293","display_name":"Ada O."}'
```

Store the returned `id` (`aff_...`) against your user.

## 3. Get a referral link for a product

When the user clicks "Refer a Friend" on a product page, your backend calls:

```bash
curl https://api.plentyvalue.com/v1/links \
  -H "Authorization: Bearer $PV_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "affiliate":"aff_3kP9...",
    "product_ref":"prod_42",
    "destination_url":"https://brickfortresearch.com/products/42"
  }'
```

Show the returned `url` as is. Its host comes from Plenty Value's settings, so don't hardcode it. The same affiliate and product always get the same link.

## 4. Capture the click ID

When a friend opens the link, Plenty Value records the click and sends them to your `destination_url` with `?pv_click_id=clk_...` added. Read that parameter on your landing page and keep it (cookie or session) until the friend signs up or buys.

## 5. Report the conversion from your server

After the qualifying action is complete and verified (for example registration succeeded):

```bash
curl https://api.plentyvalue.com/v1/events \
  -H "Authorization: Bearer $PV_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: reg_88121" \
  -d '{
    "event_id":"reg_88121",
    "type":"registration",
    "click_id":"clk_Q9vT...",
    "referred_external_user_id":"user_88121"
  }'
```

`event_id` must be unique on your side. Sending it again is safe and returns the original event. The response `status` tells you if it was `attributed`, `unattributed` or `rejected`, with a `reason`.

If the action is later cancelled or refunded, call `POST /v1/events/{id}/reverse`.

## 6. Receive webhooks and record commissions

Add an endpoint under **Webhooks** in the portal and subscribe to `commission.approved` and `commission.reversed`. Verify every request:

```js
import crypto from 'node:crypto'

export function verifyPlentySignature(rawBody, header, secret, toleranceSec = 300) {
  let t = 0
  const signatures = []
  for (const part of header.split(',')) {
    const [key, value] = part.trim().split('=')
    if (key === 't') t = Number(value)
    if (key === 'v1') signatures.push(value)
  }
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')
  return signatures.some((sig) =>
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  )
}
```

Then record each commission **once per commission id** in your own system:

- `commission.approved` → if you have not already recorded `data.object.id`, record `amount` for your user `data.object.affiliate_external_user_id`. That is your own user id, so no extra lookup is needed. Pay the affiliate through your own payment process.
- `commission.reversed` → if you already paid it, handle the reversal in your own process.

Webhooks can arrive more than once and out of order. Use the event `id` and the commission `id` to stay safe. Optionally tell Plenty Value you paid it with `POST /v1/commissions/{id}/mark_paid`.

## 7. Show affiliates their performance

Either:

- **Hosted dashboard:** `POST /v1/affiliates/{id}/dashboard_sessions` and redirect the user to the returned `url` (single use, valid 5 minutes), or
- **Your own UI:** read `GET /v1/affiliates/{id}/stats?group_by=day` and `GET /v1/commissions?affiliate=...`.

## Errors and limits

Errors use `{ "error": { "type", "code", "message", "param", "request_id" } }`. Send `Idempotency-Key` on POST requests and retry on network errors or 5xx with backoff. Rate limits are per key; on 429 wait for `Retry-After`.

Full reference: `openapi.yaml`.
