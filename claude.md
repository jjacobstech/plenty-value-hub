# Plenty Value — Full System Architecture & Backend Rebuild Guide

> **Purpose:** This document gives a 100% complete breakdown of the Plenty Value platform so you can rebuild the backend in any framework (AdonisJS, NestJS, Express, Fastify, Laravel, Django, etc.).

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Tech Stack (Current)](#2-tech-stack-current)
3. [Database Schema — All Entities](#3-database-schema--all-entities)
4. [Authentication System](#4-authentication-system)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Revenue & Financial Model](#6-revenue--financial-model)
7. [API Endpoints — Full Specification](#7-api-endpoints--full-specification)
8. [Business Logic — Detailed Rules](#8-business-logic--detailed-rules)
9. [Email Templates](#9-email-templates)
10. [Frontend Routes & Pages](#10-frontend-routes--pages)
11. [Environment Variables](#11-environment-variables)
12. [AdonisJS Rebuild Checklist](#12-adonisjs-rebuild-checklist)

---

## 1. Platform Overview

**Plenty Value** is a dual-purpose platform:

1. **Affiliate Marketplace** — Vendors list digital/physical/service products. Affiliates promote them via unique tracking links. Buyers purchase products.
2. **Expert Newsletter** — Curated product review newsletter for subscribers.

### Core User Journeys

#### Vendor
1. Register → Select "Vendor" account type → Complete KYC form → Verify email (OTP)
2. Submit products for admin approval
3. View dashboard: revenue, orders, product performance
4. Earnings split: `sale_price - platform_fee(10%) - affiliate_commission`

#### Affiliate
1. Register → Select "Affiliate" account type → Verify email (OTP)
2. Browse approved products in the marketplace
3. Generate unique tracking links per product
4. Share links — earn commission on every conversion
5. View dashboard: clicks, conversions, commission earned

#### Buyer / Consumer
1. Visit marketplace → Browse products
2. Click affiliate link (`/ref/:link_code`) → tracked, stored in sessionStorage
3. Purchase product → order created, revenue split applied

#### Admin
1. Approve/reject vendor products
2. Manage orders (update status, trigger refunds)
3. View platform-wide KPIs (GMV, revenue, user counts, top products)
4. Manage users

---

## 2. Tech Stack (Current)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack React Query v5 |
| Routing | React Router DOM v6 |
| Backend Functions | Deno Deploy (serverless) |
| Database | Base44 managed NoSQL (MongoDB-like) |
| Auth | Base44 JWT (email/password + OTP verification + Google OAuth) |
| Email | Base44 Core.SendEmail integration (Resend-backed) |
| Currency | USD throughout |

### Rebuild Target
You can replace the backend with any Node.js framework. The frontend remains React and only the API call URLs change (swap `base44.functions.invoke('name', payload)` for `fetch('/api/endpoint', ...)`).

---

## 3. Database Schema — All Entities

> All entities automatically have: `id` (string UUID), `created_date` (ISO string), `updated_date` (ISO string), `created_by_id` (user ID string).

---

### 3.1 User (built-in)

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated |
| `email` | string | Unique, required |
| `full_name` | string | Display name |
| `role` | enum | `admin`, `vendor`, `affiliate`, `consumer` |
| `created_date` | ISO datetime | Auto |

> **Security rule:** Regular users can only read/update their own record. Admins can list/update/delete all users.

---

### 3.2 Product

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Product title |
| `slug` | string | | URL-friendly identifier |
| `description` | string | | Full HTML/markdown description |
| `short_description` | string | | 1–2 sentence summary |
| `category` | enum | ✅ | See categories below |
| `product_type` | enum | ✅ | `digital`, `physical`, `service` |
| `price` | number | ✅ | Base price in USD |
| `sale_price` | number | | Discounted price (if < price, used for sale) |
| `commission_rate` | number | ✅ | Affiliate commission % (e.g., 30 = 30%) |
| `vendor_id` | string | | FK → User.id |
| `vendor_name` | string | | Denormalized vendor display name |
| `image_url` | string | | Main product image |
| `gallery_urls` | string[] | | Additional images |
| `status` | enum | | `pending` (default), `approved`, `rejected`, `archived` |
| `gravity_score` | number | | Popularity score, incremented +1 per sale (max 100) |
| `avg_earnings_per_sale` | number | | Calculated average affiliate earnings |
| `conversion_rate` | number | | % of visitors who convert |
| `refund_rate` | number | | % of orders refunded |
| `total_sales` | number | | Incremented on each order (default 0) |
| `total_revenue` | number | | Sum of all sale amounts (default 0) |
| `rating` | number | | Average rating 1–5 |
| `review_count` | number | | Count of approved reviews (default 0) |
| `is_featured` | boolean | | Featured in homepage/marketplace (default false) |
| `tags` | string[] | | Searchable tags |
| `affiliate_resources` | object | | `{ swipe_emails: string[], banner_urls: string[], landing_page_url: string }` |
| `recurring_billing` | boolean | | Subscription product (default false) |
| `billing_cycle` | enum | | `one_time`, `monthly`, `yearly` |

**Categories enum:**
`health_fitness`, `business_investing`, `software_saas`, `ecommerce`, `education`, `fashion`, `beauty`, `home_garden`, `technology`, `finance`, `digital_services`, `ai_tools`, `productivity`, `lifestyle`

---

### 3.3 Order

| Field | Type | Required | Notes |
|---|---|---|---|
| `order_number` | string | | Format: `PV-<base36timestamp>-<4char random>` e.g. `PV-LX3K9-AB4D` |
| `product_id` | string | ✅ | FK → Product.id |
| `product_name` | string | | Denormalized |
| `buyer_id` | string | | FK → User.id |
| `buyer_email` | string | | Denormalized for email notifications |
| `vendor_id` | string | | FK → User.id |
| `affiliate_id` | string | | FK → User.id (nullable) |
| `affiliate_link_id` | string | | FK → AffiliateLink.id (nullable) |
| `amount` | number | ✅ | Final sale amount in USD |
| `commission_amount` | number | | Affiliate's cut in USD |
| `platform_fee` | number | | Platform's 10% cut in USD |
| `vendor_payout` | number | | `amount - platform_fee - commission_amount` |
| `status` | enum | | `pending`, `completed` (default), `refunded`, `cancelled` |
| `payment_method` | string | | e.g. `stripe`, `paystack`, `manual` |
| `currency` | string | | Always `USD` |

---

### 3.4 AffiliateLink

| Field | Type | Required | Notes |
|---|---|---|---|
| `affiliate_id` | string | ✅ | FK → User.id |
| `product_id` | string | ✅ | FK → Product.id |
| `product_name` | string | | Denormalized |
| `link_code` | string | | Unique tracking code (UUID or nanoid) |
| `clicks` | number | | Incremented on each `/ref/:link_code` visit (default 0) |
| `conversions` | number | | Incremented on each successful purchase (default 0) |
| `revenue` | number | | Total sale amount generated (default 0) |
| `commission_earned` | number | | Total commission earned in USD (default 0) |
| `status` | enum | | `active` (default), `paused`, `expired` |
| `sub_id` | string | | Optional sub-tracking ID for campaigns |
| `campaign_name` | string | | Optional campaign label |

---

### 3.5 Review

| Field | Type | Required | Notes |
|---|---|---|---|
| `product_id` | string | ✅ | FK → Product.id |
| `product_name` | string | | Denormalized |
| `reviewer_name` | string | | Display name |
| `rating` | number | ✅ | 1–5 stars |
| `title` | string | | Review headline |
| `content` | string | ✅ | Full review text |
| `pros` | string[] | | List of pros |
| `cons` | string[] | | List of cons |
| `is_verified_purchase` | boolean | | Whether buyer verified (default false) |
| `status` | enum | | `pending` (default), `approved`, `rejected` |
| `helpful_count` | number | | Upvotes (default 0) |

---

### 3.6 NewsletterSubscriber

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | ✅ | Must be valid email format |
| `name` | string | | Display name |
| `interests` | string[] | | Category interests |
| `status` | enum | | `active` (default), `unsubscribed` |
| `source` | string | | Where they subscribed: `website`, `footer`, `popup`, etc. |

---

## 4. Authentication System

### Flow

1. **Register** — User submits `{ email, password }` → account created in `unverified` state
2. **OTP Verification** — 6-digit code sent to email → user submits code → account activated → JWT issued
3. **Login** — `{ email, password }` → JWT issued on success
4. **Google OAuth** — Single-click OAuth → JWT issued
5. **Forgot Password** → reset token emailed → user submits new password with token

### Registration Steps (Multi-Step UI)

**Step 1:** Choose account type (`vendor` | `affiliate` | `consumer`)

**Step 2 (Vendor only):** KYC Form — business name, country, phone, business type (`individual` | `business`), how they heard about platform. Stored on User entity or separate KYC entity.

**Step 3:** Email + password form

**Step 4:** OTP verification (6 digits)

**After OTP success:**
- Set user role to chosen account type
- Call `sendWelcomeEmail` with `{ role }`

### JWT Strategy

All protected API endpoints require `Authorization: Bearer <token>` header.

Token payload contains at minimum:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "vendor",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 5. User Roles & Permissions

| Role | Can Do |
|---|---|
| `consumer` | Browse marketplace, purchase products, write reviews, subscribe to newsletter |
| `affiliate` | Everything consumer can do + generate affiliate links, view affiliate dashboard |
| `vendor` | Everything consumer can do + list products (pending approval), view vendor dashboard |
| `admin` | Everything + approve/reject products, manage all orders, view platform stats, manage users |

### Route Protection

| Route Pattern | Required Role |
|---|---|
| `/affiliate/*` | `affiliate` or `admin` |
| `/vendor/*` | `vendor` or `admin` |
| `/admin/*` | `admin` only |
| `/marketplace`, `/product/:id`, `/reviews`, `/` | Public (no auth) |
| `/ref/:link_code` | Public (no auth) |

---

## 6. Revenue & Financial Model

### Revenue Split Formula

For every completed order:

```
sale_price = product.sale_price if (sale_price && sale_price < price) else product.price

platform_fee     = round(sale_price × 0.10, 2)          // 10% always
commission_amount = round(sale_price × (commission_rate / 100), 2)  // only if affiliate link used
vendor_payout    = round(sale_price - platform_fee - commission_amount, 2)
```

### Example

| Product Price | Commission Rate | Platform Fee | Affiliate Commission | Vendor Payout |
|---|---|---|---|---|
| $100 | 40% | $10.00 | $40.00 | $50.00 |
| $50 | 25% | $5.00 | $12.50 | $32.50 |
| $200 | 0% (no affiliate) | $20.00 | $0.00 | $180.00 |

### Refund Reversal Logic

When an order is marked `refunded`:
1. Subtract `order.amount` from `AffiliateLink.revenue`
2. Subtract `order.commission_amount` from `AffiliateLink.commission_earned`
3. Decrement `AffiliateLink.conversions` by 1
4. Decrement `Product.total_sales` by 1
5. Subtract `order.amount` from `Product.total_revenue`
6. Send refund confirmation email to buyer

---

## 7. API Endpoints — Full Specification

### 7.1 `POST /api/processOrder`

**Auth:** Required (any role)

**Description:** Creates an order record, applies the revenue split, updates product counters and affiliate link stats.

**Request Body:**
```json
{
  "product_id": "string (required)",
  "affiliate_link_code": "string (optional)"
}
```

**Logic:**
1. Authenticate user
2. Fetch product by `product_id` — 404 if not found, 400 if not `approved`
3. Determine `salePrice` (use `sale_price` if it exists and is less than `price`)
4. Calculate `platformFee`, `commissionAmount`, `vendorPayout`
5. If `affiliate_link_code` provided: fetch AffiliateLink, validate it's `active`
6. Generate `orderNumber`: `PV-${Date.now().toString(36).toUpperCase()}-${random4chars}`
7. Create Order record
8. If affiliate link: update `conversions += 1`, `revenue += salePrice`, `commission_earned += commissionAmount`
9. Update Product: `total_sales += 1`, `total_revenue += salePrice`, `gravity_score = min(100, gravity_score + 1)`
10. Return order summary

**Success Response (200):**
```json
{
  "success": true,
  "order": {
    "id": "string",
    "order_number": "PV-LX3K9-AB4D",
    "amount": 99.99,
    "commission_amount": 39.99,
    "platform_fee": 10.00,
    "vendor_payout": 50.00,
    "status": "completed"
  }
}
```

**Error Responses:**
- `401` — Not authenticated
- `400` — Missing product_id or product not approved
- `404` — Product not found
- `500` — Internal error

---

### 7.2 `POST /api/trackAffiliateClick`

**Auth:** None (public endpoint)

**Description:** Records a click on an affiliate link. Called when a visitor lands on `/ref/:link_code`.

**Request Body:**
```json
{
  "link_code": "string (required)"
}
```

**Logic:**
1. Fetch AffiliateLink by `link_code`
2. 404 if not found
3. 400 if link status is not `active`
4. Increment `clicks += 1`
5. Return `product_id` and `affiliate_link_id` so frontend can redirect to product page

**Success Response (200):**
```json
{
  "success": true,
  "product_id": "string",
  "affiliate_link_id": "string"
}
```

**Error Responses:**
- `400` — Missing link_code or link not active
- `404` — Link not found
- `500` — Internal error

---

### 7.3 `POST /api/subscribeNewsletter`

**Auth:** None (public endpoint)

**Description:** Subscribes an email to the newsletter. Handles duplicate detection and re-activation of unsubscribed users. Sends a branded confirmation email.

**Request Body:**
```json
{
  "email": "string (required, valid email format)",
  "name": "string (optional)",
  "interests": ["string"] "(optional array of category strings)",
  "source": "string (optional, default: 'website')"
}
```

**Logic:**
1. Validate email format with regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
2. Check if email already exists in `NewsletterSubscriber`
   - If exists + `active`: return `{ success: true, already_subscribed: true }`
   - If exists + `unsubscribed`: update status to `active`
   - If not exists: create new record
3. Send HTML confirmation email (see Section 9.2)

**Success Response (200):**
```json
{
  "success": true,
  "already_subscribed": false
}
```

**Error Responses:**
- `400` — Invalid or missing email
- `500` — Internal error

---

### 7.4 `POST /api/sendWelcomeEmail`

**Auth:** Required (any role)

**Description:** Sends a role-specific welcome email to a newly registered user. Called from the frontend immediately after successful OTP verification.

**Request Body:**
```json
{
  "role": "vendor | affiliate | consumer"
}
```

**Logic:**
1. Authenticate user → get `user.email` and `user.full_name`
2. Select role-specific email copy (subject, CTA text, CTA link — see Section 9.1)
3. Send branded HTML email

**Role-to-Email Mapping:**

| Role | Subject | CTA Link |
|---|---|---|
| `vendor` | "Welcome to Plenty Value — Start Selling Today!" | `/vendor/products` |
| `affiliate` | "Welcome to Plenty Value — Your Affiliate Journey Starts Now!" | `/affiliate/products` |
| `consumer` | "Welcome to Plenty Value!" | `/marketplace` |

**Success Response (200):**
```json
{ "success": true }
```

**Error Responses:**
- `401` — Not authenticated
- `500` — Internal error

---

### 7.5 `POST /api/adminUpdateOrder`

**Auth:** Required — `role === 'admin'` only (403 otherwise)

**Description:** Updates an order's status. Handles refund reversal logic (affiliate stats, product counters) and sends buyer notification emails for `completed` and `refunded` status changes.

**Request Body:**
```json
{
  "order_id": "string (required)",
  "status": "completed | refunded | cancelled | pending (required)"
}
```

**Logic:**
1. Authenticate user → verify `role === 'admin'`
2. Fetch order by `order_id` — 404 if not found
3. If `old_status === new_status`: return `{ success: true, message: 'No change needed' }`
4. Update order status
5. If new status is `refunded`:
   - Reverse AffiliateLink stats (if `order.affiliate_link_id` exists)
   - Reverse Product counters (if `order.product_id` exists)
6. If new status is `completed` or `refunded`:
   - Send notification email to `order.buyer_email`

**Success Response (200):**
```json
{
  "success": true,
  "order_id": "string",
  "old_status": "pending",
  "new_status": "completed"
}
```

**Error Responses:**
- `401` — Not authenticated
- `403` — Not an admin
- `400` — Missing params or invalid status value
- `404` — Order not found
- `500` — Internal error

---

### 7.6 `POST /api/getPlatformStats`

**Auth:** Required — `role === 'admin'` only (403 otherwise)

**Description:** Returns aggregated platform KPIs for the admin analytics dashboard.

**Request Body:** `{}` (no params)

**Logic:**
1. Authenticate + verify admin
2. Fetch in parallel: all Orders (limit 500), Products (limit 500), Users (limit 500), AffiliateLinks (limit 500), NewsletterSubscribers (limit 500)
3. Compute aggregates (see below)

**Computations:**
- `completedOrders` = orders filtered by `status === 'completed'`
- `gmv` = sum of `amount` across completedOrders
- `platform_revenue` = sum of `platform_fee` across completedOrders
- `total_commissions` = sum of `commission_amount` across completedOrders
- `refund_rate` = `(refunded_count / total_orders) × 100`, rounded to 1 decimal
- User counts: filter by role
- `top_products` = top 5 by `total_revenue` (descending)
- `top_affiliates` = group completedOrders by `affiliate_id`, sum `commission_amount`, top 5
- `revenue_by_category` = join completedOrders with Products, group by `product.category`

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "orders": {
      "total": 1240,
      "completed": 1100,
      "refunded": 45,
      "refund_rate": 3.6
    },
    "financials": {
      "gmv": 125430.50,
      "platform_revenue": 12543.05,
      "total_commissions": 37629.15
    },
    "users": {
      "total": 890,
      "vendors": 120,
      "affiliates": 340,
      "consumers": 420,
      "admins": 4
    },
    "products": {
      "total": 85,
      "approved": 72,
      "pending": 8
    },
    "subscribers": {
      "total": 5600,
      "active": 5200
    },
    "affiliate_links": {
      "total": 1800,
      "active": 1600,
      "total_clicks": 234000,
      "total_conversions": 4100
    },
    "top_products": [
      {
        "id": "abc123",
        "name": "Ultimate Fitness Pro Guide",
        "total_sales": 1243,
        "total_revenue": 62150.00,
        "commission_rate": 50,
        "category": "health_fitness"
      }
    ],
    "top_affiliates": [
      { "affiliate_id": "user_xyz", "earned": 4820.50 }
    ],
    "revenue_by_category": {
      "health_fitness": 45000.00,
      "beauty": 22000.00
    }
  }
}
```

---

### Additional CRUD Endpoints Needed

These are handled by the Base44 SDK automatically but you'll need to implement them manually:

#### Products
- `GET /api/products` — List approved products (public). Query params: `category`, `product_type`, `search`, `sort` (`-created_date`, `-total_sales`, `-gravity_score`), `limit`, `skip`
- `GET /api/products/:id` — Single product (public)
- `POST /api/products` — Create product (vendor only, status defaults to `pending`)
- `PUT /api/products/:id` — Update product (vendor owns it, or admin)
- `DELETE /api/products/:id` — Delete product (vendor owns it, or admin)

#### Affiliate Links
- `GET /api/affiliate-links` — List current user's links (affiliate only)
- `POST /api/affiliate-links` — Create affiliate link for a product (affiliate only). Auto-generate `link_code` using UUID or nanoid.
- `PUT /api/affiliate-links/:id` — Update (pause/resume)
- `DELETE /api/affiliate-links/:id` — Delete link

#### Orders
- `GET /api/orders` — List orders. Vendor sees their product orders. Affiliate sees orders they attributed. Admin sees all.
- `GET /api/orders/:id` — Single order

#### Reviews
- `GET /api/reviews?product_id=:id` — List approved reviews for a product (public)
- `POST /api/reviews` — Submit a review (authenticated)
- `PUT /api/reviews/:id/approve` — Admin approve/reject

#### Users (Admin only)
- `GET /api/users` — List all users (admin)
- `PUT /api/users/:id` — Update user role (admin)
- `DELETE /api/users/:id` — Delete user (admin)

#### Newsletter
- `POST /api/newsletter/unsubscribe` — Set subscriber status to `unsubscribed`

---

## 8. Business Logic — Detailed Rules

### 8.1 Affiliate Link Generation

```javascript
// When an affiliate creates a link for a product:
const link_code = nanoid(10); // or uuid v4
// e.g. "Kx3pL8mQnT" or "a1b2c3d4-e5f6-..."

// Store: { affiliate_id, product_id, product_name, link_code, status: 'active', clicks: 0, conversions: 0 }
```

### 8.2 Affiliate Attribution Flow

1. Visitor hits `/ref/:link_code`
2. Frontend calls `POST /api/trackAffiliateClick { link_code }`
3. Backend returns `{ product_id, affiliate_link_id }`
4. Frontend stores `affiliate_link_code` in `sessionStorage`
5. Frontend redirects to `/product/:product_id`
6. When buyer purchases, frontend sends stored `affiliate_link_code` with the order

```javascript
// Frontend: store on click
sessionStorage.setItem('affiliate_code', link_code);

// Frontend: send on purchase
const affiliateCode = sessionStorage.getItem('affiliate_code');
await fetch('/api/processOrder', {
  body: JSON.stringify({ product_id, affiliate_link_code: affiliateCode })
});
```

### 8.3 Product Approval Workflow

```
Vendor submits product → status: 'pending'
Admin reviews → approve: status: 'approved' | reject: status: 'rejected'
Only 'approved' products are visible in the public marketplace
Vendor can archive their own products: status: 'archived'
```

### 8.4 Order Number Generation

```javascript
const orderNumber = `PV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
// Example: PV-LX3K9-AB4D
```

### 8.5 Gravity Score

Incremented by +1 for each completed sale. Capped at 100.
```javascript
gravity_score = Math.min(100, (current_gravity_score || 0) + 1)
```

### 8.6 Vendor KYC Fields

Collected at registration (before email/password step):
- `business_name` — string, required
- `country` — string, required
- `phone` — string, required
- `business_type` — enum: `individual` | `business`
- `heard_about` — string (optional, "How did you hear about us?")

Store these on the User record or a separate `VendorKYC` entity.

---

## 9. Email Templates

All emails use the brand colors:
- **Navy:** `#001845`
- **Green:** `#81C14B`
- **Font:** Segoe UI, Arial, sans-serif

### 9.1 Welcome Email (role-based)

**Vendor subject:** "Welcome to Plenty Value — Start Selling Today!"
**Affiliate subject:** "Welcome to Plenty Value — Your Affiliate Journey Starts Now!"
**Consumer subject:** "Welcome to Plenty Value!"

**HTML structure:**
- Dark navy header with "Plenty Value" in green
- Personalized greeting: `Hey {full_name}! 👋`
- Role-specific CTA paragraph
- Green CTA button linking to role's dashboard
- Footer with copyright

### 9.2 Newsletter Confirmation Email

**Subject:** "You're subscribed to Plenty Value Newsletter! 🎉"

**HTML structure:**
- Navy header with "Plenty Value" + tagline "Expert Product Reviews & Deals Newsletter"
- Greeting: `Welcome, {name}! 🎉`
- What to expect list (reviews, affiliate opportunities, tips, deals)
- Navy CTA button → marketplace
- Unsubscribe instructions in footer

### 9.3 Order Confirmation Email

**Subject:** `Order {order_number} Confirmed — Plenty Value`

**Body:** Minimal HTML with:
- Order number, product name, amount
- "Thank you for shopping with Plenty Value!"

### 9.4 Refund Notification Email

**Subject:** `Refund Processed for Order {order_number} — Plenty Value`

**Body:**
- Refund details (order number, product name, amount)
- "Please allow 5–10 business days for the refund to reflect."

---

## 10. Frontend Routes & Pages

### Public Routes (no auth)
| Path | Page | Notes |
|---|---|---|
| `/` | Home | Hero, categories, featured products, how it works, newsletter signup |
| `/marketplace` | Marketplace | Filterable product grid with left sidebar categories |
| `/product/:id` | ProductDetail | Full product page with purchase flow |
| `/reviews` | Reviews | Expert newsletter-style product reviews |
| `/for-partners` | ForPartners | Vendor + Affiliate info tabs |
| `/privacy-policy` | PrivacyPolicy | Legal page |
| `/ref/:link_code` | AffiliateRedirect | Tracks click, redirects to product |
| `/login` | Login | Email/password + Google OAuth |
| `/register` | Register | Multi-step: role select → KYC (vendor) → credentials → OTP |
| `/forgot-password` | ForgotPassword | Email reset request |
| `/reset-password` | ResetPassword | Token-based password reset |

### Affiliate Dashboard (requires `affiliate` role)
| Path | Page |
|---|---|
| `/affiliate` | Dashboard — KPIs, charts, recent activity |
| `/affiliate/products` | Browse & create affiliate links |
| `/affiliate/links` | Manage all affiliate links |
| `/affiliate/performance` | Detailed analytics charts |
| `/affiliate/earnings` | Commission history + payout methods |
| `/affiliate/profile` | Profile settings |

### Vendor Dashboard (requires `vendor` role)
| Path | Page |
|---|---|
| `/vendor` | Dashboard — revenue, orders, product stats |
| `/vendor/products` | CRUD products (submit for approval) |
| `/vendor/analytics` | Revenue charts, product performance |
| `/vendor/earnings` | Payout history + withdrawal options |
| `/vendor/profile` | Profile settings |

### Admin Dashboard (requires `admin` role)
| Path | Page |
|---|---|
| `/admin` | Dashboard — platform KPIs |
| `/admin/users` | User management |
| `/admin/products` | Product approval queue |
| `/admin/orders` | Order management + status updates |
| `/admin/analytics` | Full platform analytics |

---

## 11. Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL/MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret for signing JWT tokens | ✅ |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` | ✅ |
| `SMTP_HOST` | Email server host | ✅ |
| `SMTP_PORT` | Email server port (usually 587) | ✅ |
| `SMTP_USER` | Email username | ✅ |
| `SMTP_PASS` | Email password / API key | ✅ |
| `FROM_EMAIL` | Sender email address | ✅ |
| `FROM_NAME` | Sender display name e.g. `Plenty Value` | ✅ |
| `APP_URL` | Base URL e.g. `https://plentyvalue.com` | ✅ |
| `PLATFORM_FEE_RATE` | Platform fee as decimal e.g. `0.10` | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key (if using Stripe) | Optional |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Optional |

---

## 12. AdonisJS Rebuild Checklist

### Initial Setup
```bash
npm init adonis-ts-app@latest plenty-value-api
cd plenty-value-api
node ace configure @adonisjs/auth
node ace configure @adonisjs/lucid
node ace configure @adonisjs/mail
```

### Database Migrations to Create

```bash
node ace make:migration users
node ace make:migration products
node ace make:migration orders
node ace make:migration affiliate_links
node ace make:migration reviews
node ace make:migration newsletter_subscribers
```

### Models to Create

```bash
node ace make:model User
node ace make:model Product
node ace make:model Order
node ace make:model AffiliateLink
node ace make:model Review
node ace make:model NewsletterSubscriber
```

### Controllers to Create

```bash
node ace make:controller Auth           # register, login, verifyOtp, forgotPassword, resetPassword
node ace make:controller Products       # index, show, store, update, destroy
node ace make:controller Orders         # index, show, processOrder, adminUpdate
node ace make:controller AffiliateLinks # index, store, update, destroy, trackClick
node ace make:controller Reviews        # index, store, approve
node ace make:controller Newsletter     # subscribe, unsubscribe
node ace make:controller Admin          # getPlatformStats, updateOrder
node ace make:controller Emails         # sendWelcome
```

### Middleware to Create

```bash
node ace make:middleware Auth           # Verify JWT
node ace make:middleware AdminOnly      # Verify role === 'admin'
node ace make:middleware VendorOnly     # Verify role === 'vendor'
node ace make:middleware AffiliateOnly  # Verify role === 'affiliate'
```

### Routes Structure

```typescript
// routes.ts
import Route from '@ioc:Adonis/Core/Route'

// Public
Route.post('/api/auth/register', 'AuthController.register')
Route.post('/api/auth/verify-otp', 'AuthController.verifyOtp')
Route.post('/api/auth/login', 'AuthController.login')
Route.post('/api/auth/forgot-password', 'AuthController.forgotPassword')
Route.post('/api/auth/reset-password', 'AuthController.resetPassword')
Route.get('/api/products', 'ProductsController.index')
Route.get('/api/products/:id', 'ProductsController.show')
Route.post('/api/affiliate-links/track-click', 'AffiliateLinksController.trackClick')
Route.post('/api/newsletter/subscribe', 'NewsletterController.subscribe')

// Authenticated
Route.group(() => {
  Route.post('/api/orders', 'OrdersController.processOrder')
  Route.get('/api/orders', 'OrdersController.index')
  Route.post('/api/emails/welcome', 'EmailsController.sendWelcome')

  // Affiliate
  Route.group(() => {
    Route.get('/api/affiliate-links', 'AffiliateLinksController.index')
    Route.post('/api/affiliate-links', 'AffiliateLinksController.store')
    Route.put('/api/affiliate-links/:id', 'AffiliateLinksController.update')
    Route.delete('/api/affiliate-links/:id', 'AffiliateLinksController.destroy')
  }).middleware('affiliateOnly')

  // Vendor
  Route.group(() => {
    Route.post('/api/products', 'ProductsController.store')
    Route.put('/api/products/:id', 'ProductsController.update')
    Route.delete('/api/products/:id', 'ProductsController.destroy')
  }).middleware('vendorOnly')

  // Admin
  Route.group(() => {
    Route.post('/api/admin/stats', 'AdminController.getPlatformStats')
    Route.put('/api/admin/orders/:id', 'AdminController.updateOrder')
    Route.get('/api/admin/users', 'UsersController.index')
    Route.put('/api/admin/products/:id/approve', 'ProductsController.approve')
  }).middleware('adminOnly')

}).middleware('auth')
```

### Key Notes for AdonisJS Implementation

1. **OTP System** — Generate a 6-digit code, store it in a `otp_codes` table with expiry (10 min), verify on submit, delete after use.
2. **Affiliate link_code** — Use `nanoid` or `uuid` package: `npm install nanoid`
3. **Revenue split** — Implement as a service class `app/Services/RevenueService.ts`
4. **Email templates** — Use Edge templating (AdonisJS native) or inline HTML strings from Section 9
5. **Role-based auth** — Add `role` column to users table, create middleware that checks `auth.user.role`
6. **Refund reversal** — Implement as a database transaction to ensure atomicity
7. **CORS** — Configure for your React frontend origin in `config/cors.ts`
8. **Pagination** — All list endpoints should support `?page=1&limit=20`

---

## Appendix: Category Label Map

```javascript
const CATEGORY_LABELS = {
  health_fitness: "Health & Fitness",
  business_investing: "Business & Investing",
  software_saas: "Software & SaaS",
  ecommerce: "E-Commerce",
  education: "Education",
  fashion: "Fashion",
  beauty: "Beauty",
  home_garden: "Home & Garden",
  technology: "Technology",
  finance: "Finance",
  digital_services: "Digital Services",
  ai_tools: "AI Tools",
  productivity: "Productivity",
  lifestyle: "Lifestyle",
};
```

---

*Generated: 2026-06-14 | Plenty Value Platform v1.0*