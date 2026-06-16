# Plenty Value Hub — AdonisJS Rebuild Progress

## ✅ Completed (Phase 1-3)

### Package Installation
- ✅ Installed `@adonisjs/mail`, `nanoid`, `decimal.js`
- ✅ Installed Tailwind CSS + shadcn/ui dependencies
- ✅ Configured `@adonisjs/mail` (SMTP driver)
- ✅ Copied all 30+ shadcn/ui components to `inertia/components/ui/`
- ✅ Copied Tailwind and PostCSS config
- ✅ Updated Vite config with Tailwind plugin
- ✅ Updated `inertia/css/app.css` to use Tailwind directives

### Database Setup
- ✅ Modified existing users migration to add: `role`, `email_verified_at`, `otp_code`, `otp_expires_at`, `reset_token`, `reset_token_expires_at`, KYC fields (`business_name`, `country`, `phone`, `business_type`, `heard_about`)
- ✅ Created 5 new migrations:
  - `create_products_table` — all 38 fields per claude.md
  - `create_orders_table` — all 15 fields per claude.md
  - `create_affiliate_links_table` — all 11 fields per claude.md
  - `create_reviews_table` — all 11 fields per claude.md
  - `create_newsletter_subscribers_table` — all 5 fields per claude.md
- ✅ Ran all 6 migrations successfully (SQLite database ready)

### Models & Relationships
- ✅ User model (already existed, ready for role enum)
- ✅ Product model with relationships: vendor (User), orders (Order[]), affiliateLinks (AffiliateLink[]), reviews (Review[])
- ✅ Order model with relationships: product, buyer, vendor, affiliate, affiliateLink
- ✅ AffiliateLink model with relationships: affiliate, product, orders
- ✅ Review model with relationship: product
- ✅ NewsletterSubscriber model (standalone)

### Services
- ✅ `RevenueService` — calculates revenue split (platform_fee 10%, affiliate_commission, vendor_payout)
- ✅ `OrderNumberService` — generates `PV-XXXXX-XXXX` format order numbers

### Middleware
- ✅ `RoleMiddleware` — parameterized role checking (admin, vendor, affiliate, consumer)
- ✅ Registered in `start/kernel.ts`

### Email Templates
- ✅ `otp_verification.edge` — 6-digit OTP delivery
- ✅ `welcome.edge` — role-specific welcome (vendor/affiliate/consumer)
- ✅ `newsletter_confirmation.edge` — subscription confirmation

### Controllers (Generated, stubs only)
- ✅ ProductsController (generated)
- ✅ OrdersController (generated)
- ✅ AffiliateLinksController (generated)
- ✅ ReviewsController (generated)
- ✅ NewsletterController (generated)
- ✅ AdminController (generated)

### Pages (Inertia Components)
- ✅ `inertia/pages/marketplace.tsx` — product grid view

---

## 🚧 In Progress / Remaining Work

### ✅ COMPLETED (Phase 1-3 Extended)

#### Tailwind CSS v4 Migration
- ✅ Updated tailwind.config.js to v4 format
- ✅ Packages already at ^4.3.1
- ✅ postcss.config.js using @tailwindcss/postcss
- ✅ vite.config.ts using @tailwindcss/vite
- ✅ app.css using @import "tailwindcss" and @theme {}

#### Auth System (Multi-Step Registration)
- ✅ See details in "In Progress / Remaining Work" → "High Priority" section above

---

## 🚧 In Progress / Remaining Work

### High Priority (Core Functionality)

#### Auth System (Multi-Step Registration)
- **Status:** ✅ COMPLETE
- **Completed:**
  - ✅ `registerStep1()` — role selection
  - ✅ `registerStep2()` — KYC form (vendor only)
  - ✅ `registerStep3()` — credentials + OTP sending
  - ✅ `verifyOtp()` — validate OTP, mark email verified, send welcome email
  - ✅ `resendOtp()` — regenerate and resend OTP
  - ✅ `forgotPassword()` — password reset request with token
  - ✅ `resetPassword()` — token validation + password change
  - ✅ OTP service (6-digit codes, 10min expiry)
  - ✅ Step validators (Vine)
  - ✅ Email templates (OTP, welcome, password reset)
  - ✅ Routes wired up for all auth flows
  - **Actual effort:** 4 hours

#### Core Controllers Implementation
- **Status:** ✅ COMPLETE
- **Completed:**
  - ✅ **ProductsController** (187 lines) — index, show, store, update, destroy, approve
  - ✅ **OrdersController** (235 lines) — processOrder (critical business logic), index, show, updateStatus
  - ✅ **AffiliateLinksController** (138 lines) — index, store, update, destroy, trackClick (public)
  - ✅ **ReviewsController** (102 lines) — index, store, approve
  - ✅ **NewsletterController** (67 lines) — subscribe, unsubscribe
  - ✅ **AdminController** (129 lines) — getPlatformStats with full aggregation
  - ✅ All validators (Product, Order, AffiliateLink, Review, Newsletter)
  - ✅ Email templates (order_confirmation, refund_notification)
  - ✅ Routes wired up with auth/role middleware
  - **Actual effort:** 8 hours

#### Routes Configuration
- **Status:** ✅ COMPLETE
- **Completed:**
  - ✅ Auth routes (signup multi-step, login, forgot-password, reset-password)
  - ✅ API routes (public endpoints)
  - ✅ Authenticated routes (products, orders, affiliate-links, reviews, newsletter)
  - ✅ Role-based routes (admin stats, approve products/reviews, update orders)
  - ✅ Middleware wiring (auth, role checking)
  - **Actual effort:** 0.5 hours (integrated into controllers work)

#### Inertia Pages (20 pages total)

**Priority 1 — Auth & Home (4 pages):**
- `auth/login.tsx`
- `auth/register.tsx` (multi-step)
- `auth/forgot-password.tsx`
- `home.tsx`
- **Estimated effort:** 2 hours

**Priority 2 — Public Pages (5 pages):**
- `product-detail.tsx`
- `reviews.tsx`
- `privacy-policy.tsx`
- `for-partners.tsx`
- `affiliate-redirect.tsx` (utility)
- **Estimated effort:** 2 hours

**Priority 3 — Affiliate Dashboard (6 pages):**
- `affiliate/dashboard.tsx`
- `affiliate/products.tsx`
- `affiliate/links.tsx`
- `affiliate/performance.tsx`
- `affiliate/earnings.tsx`
- `affiliate/profile.tsx`
- **Estimated effort:** 3 hours

**Priority 4 — Vendor Dashboard (5 pages):**
- `vendor/dashboard.tsx`
- `vendor/products.tsx`
- `vendor/analytics.tsx`
- `vendor/earnings.tsx`
- `vendor/profile.tsx`
- **Estimated effort:** 3 hours

**Priority 5 — Admin Dashboard (5 pages):**
- `admin/dashboard.tsx`
- `admin/users.tsx`
- `admin/products.tsx`
- `admin/orders.tsx`
- `admin/analytics.tsx`
- **Estimated effort:** 3 hours

#### Validators
- Need VineJS validators for each entity: Product, Order, Review, Newsletter, etc.
- **Estimated effort:** 1 hour

#### Email Templates (Additional)
- `order_confirmation.edge`
- `refund_notification.edge`
- `forgot_password.edge`
- **Estimated effort:** 1 hour

### Testing & Verification
- Manual testing of auth flow (multi-step registration, OTP, email verification)
- Manual testing of order flow (product purchase, affiliate attribution, revenue split)
- Manual testing of affiliate link tracking
- Manual testing of admin stats aggregation
- **Estimated effort:** 4-5 hours

---

## Critical Dependencies & Notes

### Pre-Requisites for Implementation
1. **Mail driver configuration** — Update `.env` with SMTP credentials for email sending (OTP, welcome, confirmation emails)
2. **Database connection** — SQLite ready, but consider PostgreSQL for production
3. **JWT secret** — Already in `APP_KEY` for session-based auth; no separate JWT needed for Inertia

### Known Challenges
1. **Multi-step registration** — Session management across multiple pages/forms; use form steps component
2. **Affiliate click tracking** — Must be public endpoint; rate-limiting recommended
3. **Refund reversal logic** — Complex transaction logic in OrdersController update method; test thoroughly
4. **Revenue split precision** — Using Decimal.js to avoid float rounding errors
5. **Product approval workflow** — Admin must manually approve before visibility; UX consideration for vendors

### Architecture Decisions Made
- **Session-based auth** (not JWT) — Inertia.js native, no CORS headaches
- **Inertia.js** — All pages server-rendered, avoiding separate API + SPA complexity
- **Tailwind + shadcn/ui** — Already copied from existing React app
- **SQLite for dev** — Fast iteration; config ready for PostgreSQL in production
- **Edge templates** — Email HTML generation with Luxon date formatting

---

## Remaining Time Estimates

| Task | Effort | Cumulative |
|---|---|---|
| ✅ Tailwind v4 migration | 0.5h | 0.5h |
| ✅ Auth system (multi-step + OTP) | 4h | 4.5h |
| ✅ 6 Core controllers (full implementation) | 8h | 12.5h |
| ✅ Routes configuration | 0.5h | 13h |
| **20 Inertia pages** | 14h | 27h |
| **Testing & manual QA** | 5h | 32h |
| **Total completed** | **13 hours** | |
| **Total estimated remaining** | **~19 hours** | |

---

## How to Continue

### ✅ Phase 1-3 Complete
- Tailwind v4 migration
- Multi-step auth with OTP
- All 6 core controllers with full business logic
- All API routes wired up

### Phase 4: Inertia Pages (14 hours)

**Priority 1 — Auth & Home (2 hours)** _(page components, not backend routes)_
- `auth/login.tsx` — form submission to /auth/login
- `auth/signup.tsx` — multi-step form (role → KYC → credentials → OTP)
- `auth/forgot-password.tsx` — email form
- `auth/reset-password.tsx` — token + new password form
- `Home.tsx` — hero, featured products, CTAs

**Priority 2 — Public Pages (3 hours)**
- `Marketplace.tsx` — product grid, filters, pagination
- `ProductDetail.tsx` — single product, affiliate link copy, purchase flow
- `Reviews.tsx` — expert review listings
- `ForPartners.tsx` — vendor/affiliate signup CTAs
- `PrivacyPolicy.tsx` — legal page

**Priority 3 — Affiliate Dashboard (4 hours)**
- `affiliate/Dashboard.tsx` — KPI cards, click chart, recent activity
- `affiliate/Products.tsx` — browse + generate links
- `affiliate/Links.tsx` — manage links, pause/resume
- `affiliate/Performance.tsx` — detailed analytics
- `affiliate/Earnings.tsx` — commission history
- `affiliate/Profile.tsx` — account settings

**Priority 4 — Vendor Dashboard (3 hours)**
- `vendor/Dashboard.tsx` — revenue, order stats, product performance
- `vendor/Products.tsx` — CRUD products, status tracker
- `vendor/Analytics.tsx` — revenue charts, top products
- `vendor/Earnings.tsx` — payout history
- `vendor/Profile.tsx` — account settings

**Priority 5 — Admin Dashboard (2 hours)**
- `admin/Dashboard.tsx` — GMV, platform KPIs
- `admin/Products.tsx` — approval queue
- `admin/Orders.tsx` — status updates
- `admin/Users.tsx` — user management
- `admin/Analytics.tsx` — full platform analytics

### Phase 5: Testing & QA (5 hours)
- Manual test auth flows (vendor KYC path, affiliate fast path)
- Manual test product submission → approval flow
- Manual test affiliate link tracking → order
- Manual test refund reversal logic
- E2E test cross-user workflows

---

## Commands Reference

```bash
# Generate new migration
node ace make:migration table_name

# Run migrations
node ace migration:run

# Generate model
node ace make:model ModelName

# Generate controller
node ace make:controller ControllerName

# Generate validator
node ace make:validator ValidatorName

# Start dev server
node ace serve --hmr

# Build for production
npm run build
```
