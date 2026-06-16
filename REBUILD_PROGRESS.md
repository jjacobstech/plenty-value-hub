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

### High Priority (Core Functionality)

#### Auth System (Multi-Step Registration)
- **Status:** Planning phase
- **Work needed:**
  - Update `NewAccountController` or create `AuthController` with:
    - `registerStep1()` — role selection form
    - `registerStep2()` — KYC form (vendor only)
    - `registerStep3()` — credentials + OTP sending
    - `verifyOtp()` — validate OTP, create user, send welcome email
    - `resendOtp()` — regenerate and resend OTP
    - `forgotPassword()` — password reset request
    - `resetPassword()` — token validation + password change
  - **Estimated effort:** 3-4 hours

#### Core Controllers Implementation
- **ProductsController**
  - `index()` — list approved products (public) or vendor's products
  - `show()` — single product detail
  - `store()` — create product (vendor only, status='pending')
  - `update()` — update product (vendor owner or admin)
  - `destroy()` — delete product (vendor owner or admin)
  - `approve()` — admin action to change status to 'approved'
  - **Estimated effort:** 2 hours

- **OrdersController**
  - `processOrder()` — **CRITICAL** business logic from claude.md §7.1
    - Validate product exists and approved
    - Calculate revenue split using `RevenueService`
    - Generate order number using `OrderNumberService`
    - Create Order record
    - Update AffiliateLink stats (if affiliate_link_id provided)
    - Update Product counters (total_sales, total_revenue, gravity_score)
    - Send order confirmation email
  - `index()` — list orders (vendor sees own, affiliate sees attributed, admin sees all)
  - `show()` — single order detail
  - **Estimated effort:** 2 hours

- **AffiliateLinksController**
  - `index()` — list current user's links
  - `store()` — create link for product (generates `link_code` with nanoid)
  - `update()` — pause/resume link
  - `destroy()` — delete link
  - `trackClick()` — **PUBLIC** endpoint, increment clicks, return product_id for redirect
  - **Estimated effort:** 1.5 hours

- **ReviewsController**
  - `index()` — list approved reviews for product
  - `store()` — submit review (authenticated)
  - `approve()` — admin approve/reject review
  - **Estimated effort:** 1 hour

- **NewsletterController**
  - `subscribe()` — **PUBLIC** endpoint, handle duplicate/reactivation, send confirmation email
  - `unsubscribe()` — set status to unsubscribed
  - **Estimated effort:** 1 hour

- **AdminController**
  - `getPlatformStats()` — aggregate KPIs (gmv, revenue, stats by category, top products, etc.)
  - `updateOrder()` — change order status with refund reversal logic
  - **Estimated effort:** 2 hours

#### Routes Configuration
- **Status:** Not started
- **Work:** Replace `start/routes.ts` with full tree per plan:
  - Public routes (home, marketplace, product/:id, reviews, /ref/:code, newsletter)
  - Auth routes (signup multi-step, login, forgot-password, reset-password)
  - Authenticated routes (orders, emails/welcome)
  - Affiliate routes (dashboard, products, links, performance, earnings, profile)
  - Vendor routes (dashboard, products CRUD, analytics, earnings, profile)
  - Admin routes (dashboard, users, products approve, orders, analytics)
  - **Estimated effort:** 1.5 hours

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
| Auth system (multi-step + OTP) | 4h | 4h |
| 6 Core controllers (full implementation) | 10h | 14h |
| Routes configuration | 1.5h | 15.5h |
| 20 Inertia pages | 14h | 29.5h |
| Validators | 1h | 30.5h |
| Email templates (3 more) | 1h | 31.5h |
| Testing & manual QA | 5h | 36.5h |
| **Total estimated remaining** | **~37 hours** | |

---

## How to Continue

1. **Auth system** — Most blocking, start here
   - Implement multi-step registration with session storage
   - Add OTP generation/verification logic
   - Wire up email sending
   - Test end-to-end

2. **Core controllers** — Implement in this order:
   - `ProductsController` — simplest CRUD
   - `AffiliateLinksController.trackClick` — critical public endpoint
   - `OrdersController.processOrder` — most complex business logic
   - Remaining controllers (Reviews, Newsletter, Admin)

3. **Routes** — Once controllers done, wire them up

4. **Pages** — Port from `plenty-value-hub/src/pages/` or rewrite Inertia components, prioritized above

5. **Testing** — E2E test each user journey (vendor signup → product listing, affiliate signup → generate link → track click → purchase)

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
