# Use Cases & Edge Cases — Plenty Value Hub

## Table of Contents
1. [Authentication & Accounts](#1-authentication--accounts)
2. [Vendor — Products](#2-vendor--products)
3. [Marketplace & Product Detail](#3-marketplace--product-detail)
4. [Checkout & Payments](#4-checkout--payments)
5. [Orders](#5-orders)
6. [Affiliate System](#6-affiliate-system)
7. [Wallet & Payouts](#7-wallet--payouts)
8. [File Uploads](#8-file-uploads)
9. [Notifications](#9-notifications)
10. [Admin](#10-admin)
11. [Webhooks](#11-webhooks)

---

## 1. Authentication & Accounts

### Use Cases
- User registers with email + password and verifies their email before logging in
- User logs in with Google OAuth and is assigned the correct role
- User requests a password reset link and sets a new password
- Vendor completes KYC before their products are listed publicly
- Admin logs in through a separate `/admin/login` route

### Edge Cases
- **Duplicate email** — user tries to register with an email already in use (OAuth or local)
- **Unverified email** — user attempts to purchase or create a product before verifying
- **Expired reset link** — user clicks a password reset link after it has expired
- **OAuth new user** — Google account email not yet registered; system must auto-create the user record with the correct default role
- **Role mismatch** — a vendor-role user tries to access `/affiliate/*` routes or vice versa; role middleware returns 403
- **Admin single-instance** — `single_admin_middleware` blocks creating a second admin account

---

## 2. Vendor — Products

### Use Cases
- Vendor creates a new product (digital, physical, or service) and it enters `pending` status awaiting admin approval
- Vendor uploads a main product image and up to 5 gallery images
- Vendor uploads a digital asset file (PDF, ZIP, MP4, etc.) that buyers receive after purchase
- Vendor edits an existing product (name, price, stock, images)
- Vendor archives a product (soft delete — preserves order history)
- Admin approves or rejects a pending product

### Edge Cases
- **JSON column not serialized** — `galleryUrls` / `tags` / `affiliateResources` passed as a raw array to Postgres without `JSON.stringify` → `invalid input syntax for type json` (fixed via `prepare`/`consume` hooks on the model)
- **Editing a rejected product** — vendor re-submits; status should return to `pending`, not stay `rejected`
- **Zero-price product** — validator requires `price >= 0.01`; free products are not supported
- **Commission > 100%** — validator caps `commissionRate` at 100
- **Gallery over limit** — UI caps at 5 gallery images; additional uploads beyond the slot count are sliced off
- **Broken gallery image URL** — `onError` hides the `<img>` rather than showing a broken icon
- **Product deleted while orders exist** — hard delete blocked; archive (`status: archived`) is used instead
- **`unitCount` reaching 0** — stock is decremented on each completed order; if it hits 0 further purchases are blocked with "Only 0 units available"
- **Sale price higher than regular price** — system uses the lower of `price` and `salePrice` as the effective price

---

## 3. Marketplace & Product Detail

### Use Cases
- Buyer browses the marketplace with category, product type, search, and sort filters
- Buyer views a product detail page showing the main image, gallery thumbnails, price, description, and reviews
- Buyer clicks a gallery thumbnail to switch the main image
- Buyer clicks the main image to open the full-screen lightbox
- Buyer navigates the lightbox with prev/next buttons or arrow keys; closes with Escape or ✕

### Edge Cases
- **No images** — product detail falls back to a large initial letter placeholder; gallery strip and lightbox are not rendered
- **Only one image** — thumbnail strip and prev/next lightbox controls are hidden; counter is not shown
- **`galleryUrls` not in server payload** — `product.galleryUrls ?? []` defaults to empty array; no crash
- **Broken image in gallery** — `onError` hides the broken `<img>` in both the thumbnail strip and the lightbox
- **`galleryUrls` stored as raw JSON string** — `consume` hook on the model parses it back to an array before it reaches the frontend
- **Product not approved** — direct URL to an unapproved product returns 404
- **Concurrent lightbox keyboard events** — `keydown` listener is cleaned up when the lightbox closes to prevent stale handlers

---

## 4. Checkout & Payments

### Use Cases
- Logged-in buyer purchases a product with a payment gateway (Paystack, Stripe, Flutterwave, PayPal)
- Guest buyer enters their email at checkout and completes payment
- Buyer selects a quantity for a physical product
- Vendor manually marks an order as paid (manual payment provider)
- Buyer fills in a shipping address for physical products

### Edge Cases
- **Out-of-stock** — `unitCount` checked before order creation; returns 400 if requested quantity exceeds stock
- **Unapproved product** — payment initialization blocked with 400
- **No payment provider configured** — `checkoutAvailable: false` shown in UI; buy button disabled
- **Self-referral** — affiliate tries to buy using their own link code; commission is silently skipped
- **Invalid affiliate code** — `affiliateCode` not found or link status is not `active`; purchase continues without commission
- **Affiliate cookie + payload both present** — HTTP-only cookie `pv_aff_attr` takes priority over the JS `affiliateLinkCode` payload field
- **Payment gateway initialization fails** — order is immediately set to `cancelled` and 500 returned
- **Guest email invalid format** — frontend validates with regex before submitting; backend also validates
- **Physical product missing shipping details** — frontend blocks submission; backend does not re-validate shipping fields (trust frontend)
- **Duplicate payment (race condition)** — webhook and verify endpoint both check `order.status`; if already `completed` or `processing`, they return early without double-crediting

---

## 5. Orders

### Use Cases
- Digital product order completes immediately after payment → asset download link emailed to buyer
- Physical product order enters `processing` after payment → vendor notified to fulfil
- Admin or vendor manually moves an order from `processing` → `completed`
- Buyer tracks their order by order number + email (no login required)
- Admin issues a refund by setting status to `refunded`

### Edge Cases
- **Order not found on tracking** — both `orderNumber` and `email` must match (case-insensitive)
- **Digital asset download on non-completed order** — 403 returned; download only available for `completed` orders
- **Missing product on order** — if product record deleted after order placed, order can still be completed via fallback path (status set directly)
- **Status unchanged** — updating an order to its current status returns early with "No change needed"
- **Refund of a `completed` order** — `WalletService.handleOrderRefunded` reverses the wallet credit; affiliate stats are also decremented
- **Cancelling a `processing` order** — only `pending` cancellations trigger `WalletService.handleOrderCancelled`; `processing` cancellations need separate handling
- **Notification failure on order completion** — wrapped in try/catch; failure is logged but does not roll back the order status

---

## 6. Affiliate System

### Use Cases
- Affiliate generates a unique link for an approved product
- Buyer visits site via affiliate link; link code is stored in `sessionStorage` and `localStorage`
- Affiliate earns commission when a buyer they referred completes a purchase
- Affiliate views click, conversion, and revenue stats per link

### Edge Cases
- **Affiliate link already exists** — creating a duplicate link for the same product returns the existing link (200 not 201)
- **Inactive link clicked** — `trackClick` returns 400; `AffiliateRedirect` page handles the error
- **Product not approved** — affiliate cannot create a link for a non-approved product (400)
- **Self-referral blocked** — buyer is detected as the affiliate owner; commission is not recorded
- **Link code in URL vs cookie** — cookie takes priority to prevent cookie-stuffing via URL manipulation
- **`sessionStorage` cleared between sessions** — `localStorage` is used as fallback so attribution survives browser restarts

---

## 7. Wallet & Payouts

### Use Cases
- Vendor's available balance is credited when a digital order completes
- Vendor's pending balance is set when a physical order enters `processing`
- Vendor requests a payout once their available balance exceeds the minimum ($10)
- Admin approves a payout; Paystack transfer is initiated automatically
- Failed or reversed Paystack transfer refunds the amount back to the vendor's wallet

### Edge Cases
- **Wallet does not exist yet** — `getOrCreateWallet` creates one with zero balances on first access
- **Backfill on empty ledger** — on first wallet load, historical completed orders are replayed to populate the transaction ledger
- **Payout below minimum** — `MIN_PAYOUT_AMOUNT = 10`; requests below this threshold are rejected
- **Payout while balance is insufficient** — should be caught at request time; admin-side approval without a balance check could over-pay
- **Transfer success/failed/reversed webhooks** — handled in `handlePaystackTransferEvent`; failed and reversed transfers call `WalletService.updatePayoutStatus` to refund
- **Double wallet credit** — `handleOrderCompleted` called twice (e.g. webhook + manual completion); second call must be idempotent — currently no deduplication guard; potential double-credit risk

---

## 8. File Uploads

### Use Cases
- Vendor uploads a product image (JPG, PNG, WebP, GIF up to 10 MB)
- Vendor drops multiple gallery images at once onto the gallery drop zone
- Vendor uploads a digital asset file (PDF, ZIP, MP4, etc. up to 200 MB)
- Admin uploads a profile or hero banner image

### Edge Cases
- **Unsupported file type** — rejected client-side first; server also validates via `extnames`
- **File exceeds size limit** — 413 response from server; toast message shown
- **Unauthenticated upload** — 401 returned; only vendors and admins may upload product images
- **Gallery drop zone slot overflow** — `toUpload = files.slice(0, remaining)` silently drops extra files beyond the 5-image cap
- **Partial gallery upload failure** — successful URLs are still appended; per-file errors are shown inline without blocking the others
- **Storage disk not configured** — `DRIVE` env var missing; uploads would fail silently at the drive layer

---

## 9. Notifications

### Use Cases
- Buyer receives a purchase confirmation email with a download link (digital) or shipping notice (physical)
- Vendor receives a new order notification
- Admin receives a new order notification
- Affiliate receives a commission earned notification
- User views and marks in-app notifications as read

### Edge Cases
- **Notification service throws** — wrapped in try/catch in all callers; order status is not rolled back on notification failure
- **Vendor email missing** — notification skipped if vendor has no email address on record
- **Duplicate notifications** — order completion triggered from both webhook and manual status update; `notifyOrderCompleted` called twice sends duplicate emails (no deduplication)

---

## 10. Admin

### Use Cases
- Admin approves or rejects a vendor's product submission
- Admin manages users (view, role changes)
- Admin configures payment gateways and sets the active provider
- Admin processes payout requests
- Admin views platform-wide analytics and conversion data

### Edge Cases
- **Admin approves already-approved product** — `status` field accepts the same value; no-op but not blocked
- **Payment gateway keys saved without validation** — keys are stored encrypted but not tested against the provider API at save time; invalid keys only fail at checkout
- **Switching active payment provider mid-transaction** — in-flight orders with the old provider's reference may fail verification if the new provider is now active
- **Admin deletes a user with active orders** — no cascade guard; orphaned orders would reference a non-existent `vendorId`

---

## 11. Webhooks

### Use Cases
- Payment provider posts a `charge.success` / `CHECKOUT.ORDER.COMPLETED` event; order is settled automatically
- Paystack posts a `transfer.success` event; payout request is marked paid
- Paystack posts a `transfer.failed` / `transfer.reversed` event; payout is rejected and wallet refunded

### Edge Cases
- **Webhook arrives before order is created** — `Order.findBy('orderNumber', reference)` returns null; event is silently ignored
- **Webhook replayed (already settled order)** — early-return guard (`status === 'completed' || 'processing'`) prevents double processing
- **Invalid webhook signature** — `validateWebhookSignature` throws; 200 is still returned to prevent provider retries from filling logs
- **Unknown provider** — `handleWebhook` receives an unregistered provider name; should return a structured error rather than crashing
- **Paystack transfer webhook missing `reference`** — logged as a warning and skipped; no crash
