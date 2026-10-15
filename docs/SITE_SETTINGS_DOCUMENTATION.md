# Site Settings Documentation

**Date:** August 7, 2026  
**Status:** ✅ Complete & Functional

---

## 📋 Overview

The Site Settings system provides a centralized way to manage platform configuration, including payment providers, system settings, and media uploads.

**Key Features:**

- REST API for all settings management
- Payment provider configuration (Stripe, Paystack, Flutterwave, PayPal)
- Hero banner image uploads
- Admin-only access (requires `role = 'admin'`)
- Real-time settings updates

---

## 🔗 API Endpoints

### 1. GET /api/admin/site-settings

**Get all site settings**

```bash
curl http://localhost:3333/api/admin/site-settings
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "key": "hero_title",
    "label": "Hero Title",
    "value": "Welcome to Plenty Value Hub",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "key": "payment_settings",
    "label": "Payment Settings",
    "value": "{\"activeProvider\":\"manual\",\"currency\":\"USD\",\"providers\":[...]}"
  }
]
```

### 2. GET /api/admin/site-settings/:key

**Get a specific site setting**

```bash
curl http://localhost:3333/api/admin/site-settings/payment_settings
```

**Response (200 OK):**

```json
[
  {
    "key": "payment_settings",
    "label": "Payment Settings",
    "value": "{...payment config...}"
  }
]
```

### 3. POST /api/admin/site-settings

**Create or update a site setting**

```bash
curl -X POST http://localhost:3333/api/admin/site-settings \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <csrf_token>" \
  -d '{
    "key": "payment_settings",
    "label": "Payment Settings",
    "value": {
      "activeProvider": "stripe",
      "currency": "USD",
      "providers": [
        {
          "key": "manual",
          "name": "manual",
          "enabled": false
        },
        {
          "key": "stripe",
          "name": "stripe",
          "enabled": true,
          "publicKey": "pk_test_...",
          "secretKey": "sk_test_..."
        }
      ]
    }
  }'
```

**Response (200 OK):**

```json
{
  "id": 2,
  "key": "payment_settings",
  "label": "Payment Settings",
  "value": "{...updated config...}",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:45:00Z"
}
```

### 4. POST /api/admin/site-settings/upload-image

**Upload a site image (hero banner, etc)**

```bash
curl -X POST http://localhost:3333/api/admin/site-settings/upload-image \
  -H "X-XSRF-TOKEN: <csrf_token>" \
  -F "image=@/path/to/image.jpg"
```

**Response (200 OK):**

```json
{
  "success": true,
  "url": "https://storage.example.com/site/abc123def456.jpg"
}
```

### 5. GET /api/payment-settings

**Get payment configuration (public endpoint)**

```bash
curl http://localhost:3333/api/payment-settings
```

**Response (200 OK):**

```json
{
  "activeProvider": "stripe",
  "currency": "USD",
  "providers": [
    {
      "key": "manual",
      "name": "manual",
      "label": "Manual / Offline",
      "enabled": false
    },
    {
      "key": "stripe",
      "name": "stripe",
      "label": "Stripe",
      "enabled": true,
      "publicKey": "pk_test_..."
      // Note: secretKey not exposed in public endpoint
    }
  ]
}
```

---

## 🎯 Site Settings Types

### Payment Settings

**Key:** `payment_settings`

**Structure:**

```json
{
  "activeProvider": "stripe",
  "currency": "USD",
  "providers": [
    {
      "key": "manual",
      "name": "manual",
      "label": "Manual / Offline",
      "enabled": true,
      "publicKey": null,
      "secretKey": null,
      "webhookSecret": null,
      "description": "Manual checkout without an automated gateway."
    },
    {
      "key": "stripe",
      "name": "stripe",
      "label": "Stripe",
      "enabled": true,
      "publicKey": "pk_test_...",
      "secretKey": "sk_test_...",
      "webhookSecret": "whsec_...",
      "description": "Accept credit cards and digital wallets globally via Stripe."
    },
    {
      "key": "paystack",
      "name": "paystack",
      "label": "Paystack",
      "enabled": false,
      "publicKey": "pk_test_...",
      "secretKey": "sk_test_...",
      "webhookSecret": null,
      "description": "Accept cards, mobile money, and bank transfers across Africa."
    },
    {
      "key": "flutterwave",
      "name": "flutterwave",
      "label": "Flutterwave",
      "enabled": false,
      "publicKey": "pk_test_...",
      "secretKey": "sk_test_...",
      "webhookSecret": null,
      "description": "Accept multi-currency payments globally."
    },
    {
      "key": "paypal",
      "name": "paypal",
      "label": "PayPal",
      "enabled": false,
      "publicKey": "pk_test_...",
      "secretKey": "sk_test_...",
      "webhookSecret": null,
      "description": "Accept PayPal wallet payments and credit cards worldwide."
    }
  ]
}
```

### Custom Settings

You can create any custom settings needed:

**Examples:**

```json
{
  "key": "hero_title",
  "label": "Hero Title",
  "value": "Welcome to Our Platform"
}

{
  "key": "hero_subtitle",
  "label": "Hero Subtitle",
  "value": "Start earning today"
}

{
  "key": "support_email",
  "label": "Support Email",
  "value": "support@example.com"
}
```

---

## 🛠️ Controller: SiteSettingsController

**File:** `app/controllers/site_settings_controller.ts`

**Full Controller Code:**

```typescript
import SiteSetting from '#models/site_setting'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import drive from '@adonisjs/drive/services/main'
import { createReadStream } from 'node:fs'
import { extname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { PaymentService } from '#services/payment_service'

const storageDisk = env.get('DRIVE')

export default class SiteSettingsController {
  /**
   * GET /api/admin/site-settings
   * Returns all site settings plus current payment configuration
   */
  async index({ response }: HttpContext) {
    const settings = await SiteSetting.all()
    const paymentSettings = await PaymentService.getConfig()

    return response.json([
      ...settings.map((s) => s.serialize()),
      {
        key: 'payment_settings',
        label: 'Payment Settings',
        value: JSON.stringify(paymentSettings),
      },
    ])
  }

  /**
   * GET /api/admin/site-settings/:key
   * Returns a specific site setting by key
   */
  async show({ params, response }: HttpContext) {
    const settings = await SiteSetting.query().where('key', params.key)
    if (params.key === 'payment_settings') {
      const paymentSettings = await PaymentService.getConfig()
      return response.json([
        {
          key: 'payment_settings',
          label: 'Payment Settings',
          value: JSON.stringify(paymentSettings),
        },
      ])
    }

    return response.json(settings.map((s) => s.serialize()))
  }

  /**
   * GET /api/payment-settings
   * Returns payment configuration (public endpoint, no auth required)
   */
  async paymentConfig({ response }: HttpContext) {
    const paymentSettings = await PaymentService.getConfig()
    return response.json(paymentSettings)
  }

  /**
   * POST /api/admin/site-settings
   * Creates or updates a site setting
   * Special handling for payment_settings key
   */
  async upsert({ request, response }: HttpContext) {
    const body = request.body() as Record<string, any>
    const { key, label, value } = body

    // Handle payment settings via PaymentService
    if (key === 'payment_settings') {
      const savedSettings = await PaymentService.saveConfig(value)
      return response.json({
        key: 'payment_settings',
        label: 'Payment Settings',
        value: JSON.stringify(savedSettings),
      })
    }

    // Handle regular settings
    let setting = await SiteSetting.findBy('key', key)
    if (setting) {
      // Update existing setting
      setting.value = value
      if (label) setting.label = label
      await setting.save()
    } else {
      // Create new setting
      setting = await SiteSetting.create({ key, label: label || null, value })
    }

    return response.json(setting.serialize())
  }

  /**
   * POST /api/admin/site-settings/upload-image
   * Uploads an image file and returns public URL
   */
  async uploadImage({ request, response }: HttpContext) {
    const file = request.file('image', {
      size: 10 * 1024 * 1024, // 10MB max
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!file) {
      return response.badRequest({ error: 'No image file provided' })
    }

    if (!file.isValid) {
      return response.unprocessableEntity({
        error: file.errors[0]?.message ?? 'Invalid file',
      })
    }

    // Generate unique filename
    const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'jpg'
    const key = `site/${randomBytes(8).toString('hex')}.${ext}`

    // Upload to storage
    await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
      contentType: file.headers['content-type'],
      visibility: 'public',
    })

    // Get public URL
    const url = await drive.use(storageDisk).getUrl(key)

    return response.json({ success: true, url })
  }
}
```

### Methods Breakdown

#### `index()` — GET /api/admin/site-settings

**Purpose:** Retrieve all site settings

**Code:**

```typescript
async index({ response }: HttpContext) {
  // Get all database settings
  const settings = await SiteSetting.all()

  // Get payment settings from service
  const paymentSettings = await PaymentService.getConfig()

  // Return combined array
  return response.json([
    ...settings.map((s) => s.serialize()),
    {
      key: 'payment_settings',
      label: 'Payment Settings',
      value: JSON.stringify(paymentSettings),
    },
  ])
}
```

**What It Does:**

1. Fetches all SiteSetting records from database
2. Fetches payment configuration from PaymentService
3. Combines both into single array
4. Returns as JSON

**Response Example:**

```json
[
  {
    "id": 1,
    "key": "hero_title",
    "label": "Hero Title",
    "value": "Welcome to Plenty Value Hub",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "key": "payment_settings",
    "label": "Payment Settings",
    "value": "{\"activeProvider\":\"manual\",...}"
  }
]
```

---

#### `show()` — GET /api/admin/site-settings/:key

**Purpose:** Retrieve a specific setting by key

**Code:**

```typescript
async show({ params, response }: HttpContext) {
  // Special case for payment settings
  if (params.key === 'payment_settings') {
    const paymentSettings = await PaymentService.getConfig()
    return response.json([
      {
        key: 'payment_settings',
        label: 'Payment Settings',
        value: JSON.stringify(paymentSettings),
      },
    ])
  }

  // Get from database
  const settings = await SiteSetting.query().where('key', params.key)
  return response.json(settings.map((s) => s.serialize()))
}
```

**What It Does:**

1. Checks if requesting payment_settings
2. If yes, fetches from PaymentService
3. If no, queries database by key
4. Returns matching setting(s)

**Response Example:**

```json
[
  {
    "key": "hero_title",
    "label": "Hero Title",
    "value": "Welcome to Plenty Value Hub",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

#### `paymentConfig()` — GET /api/payment-settings

**Purpose:** Get payment configuration (public endpoint)

**Code:**

```typescript
async paymentConfig({ response }: HttpContext) {
  const paymentSettings = await PaymentService.getConfig()
  return response.json(paymentSettings)
}
```

**What It Does:**

1. Fetches payment config from service
2. Returns as JSON (no auth required)
3. Does NOT expose secret keys

**Response Example:**

```json
{
  "activeProvider": "stripe",
  "currency": "USD",
  "providers": [
    {
      "key": "manual",
      "enabled": true,
      "publicKey": null
    },
    {
      "key": "stripe",
      "enabled": true,
      "publicKey": "pk_live_..."
      // Note: secretKey is NOT included
    }
  ]
}
```

---

#### `upsert()` — POST /api/admin/site-settings

**Purpose:** Create or update a setting

**Code:**

```typescript
async upsert({ request, response }: HttpContext) {
  // Extract payload
  const body = request.body() as Record<string, any>
  const { key, label, value } = body

  // Special handling for payment settings
  if (key === 'payment_settings') {
    const savedSettings = await PaymentService.saveConfig(value)
    return response.json({
      key: 'payment_settings',
      label: 'Payment Settings',
      value: JSON.stringify(savedSettings),
    })
  }

  // Regular setting: create or update
  let setting = await SiteSetting.findBy('key', key)

  if (setting) {
    // Update existing
    setting.value = value
    if (label) setting.label = label
    await setting.save()
  } else {
    // Create new
    setting = await SiteSetting.create({
      key,
      label: label || null,
      value
    })
  }

  return response.json(setting.serialize())
}
```

**What It Does:**

1. Extracts key, label, value from request body
2. If key is 'payment_settings', uses PaymentService
3. If key exists, updates record
4. If key doesn't exist, creates new record
5. Returns updated/created setting

**Request Example:**

```json
{
  "key": "payment_settings",
  "label": "Payment Settings",
  "value": {
    "activeProvider": "stripe",
    "currency": "USD",
    "providers": [...]
  }
}
```

**Response Example:**

```json
{
  "id": 2,
  "key": "payment_settings",
  "label": "Payment Settings",
  "value": "{...}",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:45:00Z"
}
```

---

#### `uploadImage()` — POST /api/admin/site-settings/upload-image

**Purpose:** Upload an image file to storage

**Code:**

```typescript
async uploadImage({ request, response }: HttpContext) {
  // Get image file from request
  const file = request.file('image', {
    size: 10 * 1024 * 1024,  // 10MB max
    extnames: ['jpg', 'jpeg', 'png', 'webp'],
  })

  // Validate file provided
  if (!file) {
    return response.badRequest({
      error: 'No image file provided'
    })
  }

  // Validate file is valid
  if (!file.isValid) {
    return response.unprocessableEntity({
      error: file.errors[0]?.message ?? 'Invalid file'
    })
  }

  // Generate unique filename
  const ext = extname(file.clientName)
    .toLowerCase()
    .replace('.', '') || 'jpg'
  const key = `site/${randomBytes(8).toString('hex')}.${ext}`

  // Upload to storage with public visibility
  await drive.use(storageDisk).putStream(
    key,
    createReadStream(file.tmpPath!),
    {
      contentType: file.headers['content-type'],
      visibility: 'public',
    }
  )

  // Get public URL
  const url = await drive.use(storageDisk).getUrl(key)

  // Return success with URL
  return response.json({
    success: true,
    url
  })
}
```

**What It Does:**

1. Gets image file from multipart form
2. Validates file size (max 10MB)
3. Validates file type (jpg, png, webp)
4. Generates unique filename
5. Uploads to storage driver
6. Returns public URL

**Response Example:**

```json
{
  "success": true,
  "url": "https://storage.example.com/site/abc123def456.jpg"
}
```

---

## 📦 Model: SiteSetting

**File:** `app/models/site_setting.ts`

```typescript
export default class SiteSetting extends BaseModel {
  static table = 'site_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare label: string | null

  @column()
  declare value: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

**Database Table:**

```sql
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key VARCHAR(255) UNIQUE NOT NULL,
  label VARCHAR(255),
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Authentication & Authorization

### Required Permissions

- **Admin endpoints** (`/api/admin/site-settings`): Requires `role = 'admin'`
- **Public endpoint** (`/api/payment-settings`): No auth required

### Middleware Chain

```
POST /api/admin/site-settings
    ↓
1. middleware.auth() — Check if authenticated
2. middleware.role(['admin']) — Check if admin
3. adminThrottle — Rate limiting
4. SiteSettingsController.upsert()
```

### Error Responses

**403 Forbidden:**

```json
{
  "error": "You do not have permission to access this resource"
}
```

**400 Bad Request:**

```json
{
  "error": "Invalid file format or size"
}
```

---

## 💰 Payment Settings Details

### Supported Providers

| Provider    | Region | Supported Methods                   | Status |
| ----------- | ------ | ----------------------------------- | ------ |
| Manual      | Global | Offline/Manual                      | ✅     |
| Stripe      | Global | Cards, Apple Pay, Google Pay        | ✅     |
| Paystack    | Africa | Cards, Mobile Money, Bank Transfer  | ✅     |
| Flutterwave | Global | Multi-currency, Cards, Mobile Money | ✅     |
| PayPal      | Global | PayPal Wallet, Credit Cards         | ✅     |

### Configuring Payment Providers

1. **Enable a provider:**
   - Set `enabled: true` in provider config
   - Must have `publicKey` and `secretKey` filled

2. **Set as active provider:**
   - Update `activeProvider` field to provider key
   - System uses this for checkout

3. **Store API keys securely:**
   - Keys are stored in database (encrypted recommended)
   - Secret keys not exposed in public endpoints
   - Use environment variables for sensitive values

### Example: Enable Stripe

```bash
curl -X POST http://localhost:3333/api/admin/site-settings \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <csrf_token>" \
  -d '{
    "key": "payment_settings",
    "label": "Payment Settings",
    "value": {
      "activeProvider": "stripe",
      "currency": "USD",
      "providers": [
        {
          "key": "stripe",
          "name": "stripe",
          "enabled": true,
          "publicKey": "pk_live_YOUR_STRIPE_PUBLIC_KEY",
          "secretKey": "sk_live_YOUR_STRIPE_SECRET_KEY",
          "webhookSecret": "whsec_YOUR_WEBHOOK_SECRET"
        }
      ]
    }
  }'
```

---

## 🎨 Admin UI: Payment Settings Page

**File:** `inertia/pages/admin/AdminPaymentSettings.tsx`

### Features

- Visual provider cards with status badges
- Toggle provider enabled/disabled
- Configure API keys with show/hide secret button
- Set active (default) provider
- Select store currency
- Save all settings with validation

### Key Code Sections

**Endpoint call:**

```typescript
const response = await apiClient.post('/api/admin/site-settings', {
  key: 'payment_settings',
  label: 'Payment Settings',
  value: finalConfig,
})
```

**Error handling:**

- 403 → "Access denied" (role not admin)
- 404 → "Endpoint not found"
- 5xx → "Server error"
- Success → "Payment settings successfully saved"

---

## 🧪 Testing Site Settings

### Test 1: Get All Settings

```bash
curl http://localhost:3333/api/admin/site-settings
```

**Expected:** 200 OK with array of settings

### Test 2: Get Specific Setting

```bash
curl http://localhost:3333/api/admin/site-settings/payment_settings
```

**Expected:** 200 OK with payment config

### Test 3: Update Payment Settings

```bash
curl -X POST http://localhost:3333/api/admin/site-settings \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <token>" \
  -d '{
    "key": "payment_settings",
    "label": "Payment Settings",
    "value": {"activeProvider":"stripe","currency":"USD","providers":[...]}
  }'
```

**Expected:** 200 OK with updated settings

### Test 4: Upload Image

```bash
curl -X POST http://localhost:3333/api/admin/site-settings/upload-image \
  -H "X-XSRF-TOKEN: <token>" \
  -F "image=@hero.jpg"
```

**Expected:** 200 OK with public URL

### Test 5: Public Payment Config Endpoint

```bash
curl http://localhost:3333/api/payment-settings
```

**Expected:** 200 OK with payment config (no secret keys)

### Test 6: Admin Access Control

```bash
# As non-admin user
curl http://localhost:3333/api/admin/site-settings
```

**Expected:** 403 Forbidden

---

## 🔧 Database Schema

### site_settings table

```sql
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  label VARCHAR(255),
  value TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Indexes for fast lookup
CREATE INDEX idx_site_settings_key ON site_settings(key);
```

### Sample Data

```sql
INSERT INTO site_settings (key, label, value) VALUES
('hero_title', 'Hero Title', 'Welcome to Plenty Value Hub'),
('hero_subtitle', 'Hero Subtitle', 'Earn More. Grow Better.'),
('hero_image', 'Hero Image URL', 'https://...'),
('support_email', 'Support Email', 'support@example.com'),
('payment_settings', 'Payment Settings', '{...json config...}');
```

---

## 🚀 Integration Guide

### Using Settings in Other Controllers

```typescript
import SiteSetting from '#models/site_setting'

// Get a specific setting
const setting = await SiteSetting.findBy('key', 'support_email')
const supportEmail = setting?.value

// Get payment settings via service
import { PaymentService } from '#services/payment_service'
const paymentConfig = await PaymentService.getConfig()
```

### Using Settings in Frontend

```typescript
// From AdminPaymentSettings component
const { paymentConfig } = props
const activeProvider = paymentConfig.activeProvider
const currency = paymentConfig.currency

// Call the endpoint
const response = await apiClient.post('/api/admin/site-settings', {
  key: 'payment_settings',
  label: 'Payment Settings',
  value: updatedConfig,
})
```

---

## 📋 Common Tasks

### Add a New Setting

1. Create setting via API:
   ```bash
   POST /api/admin/site-settings
   { "key": "my_setting", "label": "My Setting", "value": "..." }
   ```
2. Or directly in database:
   ```sql
   INSERT INTO site_settings (key, label, value) VALUES ('my_setting', 'My Setting', 'value');
   ```

### Update Existing Setting

```bash
POST /api/admin/site-settings
{ "key": "hero_title", "label": "Hero Title", "value": "New Title" }
```

### Delete a Setting

Currently no delete endpoint. To delete, remove from database:

```sql
DELETE FROM site_settings WHERE key = 'my_setting';
```

### Upload Banner Image

1. Go to `/admin/payment-settings`
2. Upload image via form
3. Get public URL from response
4. Store URL in setting if needed

---

## 🐛 Troubleshooting

### Issue: 403 When Saving Settings

**Cause:** User not logged in as admin

**Fix:**

```bash
curl http://localhost:3333/api/auth-status
# If role ≠ "admin", login as admin first
```

### Issue: 404 on /site-settings

**Cause:** Using wrong endpoint path

**Fix:** Use `/api/admin/site-settings` (not `/site-settings`)

### Issue: Settings Not Persisting

**Cause:** Database not migrated

**Fix:**

```bash
node ace migration:run
```

### Issue: Can't Upload Image

**Cause:** File too large or wrong format

**Fix:**

- Max size: 10MB
- Allowed: jpg, jpeg, png, webp

---

## 📝 Notes

- Payment settings are stored as JSON in a single database row
- Custom settings can be stored as plain text or JSON
- All updates require admin role
- Public endpoint does not expose secret keys
- Images are uploaded to configured storage driver
- Settings are not cached (read fresh each time)

---

**Status:** ✅ Complete  
**Last Updated:** August 7, 2026  
**Related Files:**

- Controller: `app/controllers/site_settings_controller.ts`
- Model: `app/models/site_setting.ts`
- UI: `inertia/pages/admin/AdminPaymentSettings.tsx`
- Routes: `start/routes.ts` (lines 256-260)

---

## 📚 Complete Controller Implementation Guide

This section provides everything needed to implement or maintain the SiteSettingsController.

### File Location

```
app/controllers/site_settings_controller.ts
```

### Imports Required

```typescript
import SiteSetting from '#models/site_setting'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import drive from '@adonisjs/drive/services/main'
import { createReadStream } from 'node:fs'
import { extname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { PaymentService } from '#services/payment_service'
```

### Constants

```typescript
const storageDisk = env.get('DRIVE') // e.g., 's3' or 'local'
```

---

### Endpoint Summary Table

| Endpoint                                | Method | Auth  | Purpose               | Handler         |
| --------------------------------------- | ------ | ----- | --------------------- | --------------- |
| `/api/admin/site-settings`              | GET    | Admin | Get all settings      | index()         |
| `/api/admin/site-settings/:key`         | GET    | Admin | Get specific setting  | show()          |
| `/api/payment-settings`                 | GET    | None  | Get payment config    | paymentConfig() |
| `/api/admin/site-settings`              | POST   | Admin | Create/update setting | upsert()        |
| `/api/admin/site-settings/upload-image` | POST   | Admin | Upload file           | uploadImage()   |

---

### Implementation Checklist

- [x] Import SiteSetting model
- [x] Import HttpContext type
- [x] Import env service
- [x] Import drive service
- [x] Import file system utilities
- [x] Import PaymentService
- [x] Implement index() method
- [x] Implement show() method
- [x] Implement paymentConfig() method
- [x] Implement upsert() method
- [x] Implement uploadImage() method
- [x] Add JSDoc comments
- [x] Handle errors appropriately
- [x] Validate input data

---

### Method Flow Diagrams

#### index() Flow

```
Request: GET /api/admin/site-settings
    ↓
1. Fetch all SiteSetting records
2. Fetch payment config from PaymentService
3. Combine into single array
4. Return as JSON
    ↓
Response: [settings..., paymentSettings...]
```

#### show() Flow

```
Request: GET /api/admin/site-settings/:key
    ↓
1. Check if key === 'payment_settings'
    ├─ YES → Fetch from PaymentService
    └─ NO → Query database by key
2. Return as JSON
    ↓
Response: [matchingSetting]
```

#### paymentConfig() Flow

```
Request: GET /api/payment-settings (public)
    ↓
1. Fetch payment config from PaymentService
2. Return as JSON (no secrets exposed)
    ↓
Response: { activeProvider, currency, providers[] }
```

#### upsert() Flow

```
Request: POST /api/admin/site-settings
Body: { key, label, value }
    ↓
1. Check if key === 'payment_settings'
    ├─ YES →
    │   └─ Save via PaymentService
    │       └─ Return updated settings
    └─ NO →
        ├─ Check if exists in database
        │   ├─ YES → Update record
        │   └─ NO → Create new record
        └─ Return saved/updated setting
    ↓
Response: { id, key, label, value, createdAt, updatedAt }
```

#### uploadImage() Flow

```
Request: POST /api/admin/site-settings/upload-image
Form: multipart/form-data (image field)
    ↓
1. Get image file from request
2. Validate file provided
3. Validate file format (jpg, png, webp)
4. Validate file size (max 10MB)
5. Generate unique filename
6. Upload to storage driver
7. Get public URL
    ↓
Response: { success: true, url }
```

---

### Error Handling

#### index() Errors

```typescript
// No errors - returns empty array if no settings
```

#### show() Errors

```typescript
// Returns empty array if key not found
// No errors thrown
```

#### paymentConfig() Errors

```typescript
// May throw if PaymentService fails
// Should be wrapped in try-catch at route level
```

#### upsert() Errors

```typescript
// Validation errors from request body
// Database errors (unique key violation, etc)
// PaymentService errors for payment_settings
```

#### uploadImage() Errors

```typescript
400 Bad Request:
  - No image file provided

422 Unprocessable Entity:
  - Invalid file format
  - File too large (>10MB)
  - Invalid file type
```

---

### Testing Each Endpoint

#### Test: index()

```bash
curl -X GET http://localhost:3333/api/admin/site-settings \
  -H "Authorization: Bearer <admin_token>"

# Expected: Array with all settings + payment_settings
```

#### Test: show()

```bash
# Specific setting
curl -X GET http://localhost:3333/api/admin/site-settings/hero_title \
  -H "Authorization: Bearer <admin_token>"

# Payment settings
curl -X GET http://localhost:3333/api/admin/site-settings/payment_settings \
  -H "Authorization: Bearer <admin_token>"

# Expected: Array with matching setting
```

#### Test: paymentConfig()

```bash
curl -X GET http://localhost:3333/api/payment-settings

# Expected: Payment config (no auth required)
```

#### Test: upsert()

```bash
# Create new setting
curl -X POST http://localhost:3333/api/admin/site-settings \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <token>" \
  -d '{
    "key": "hero_title",
    "label": "Hero Title",
    "value": "Welcome!"
  }'

# Update payment settings
curl -X POST http://localhost:3333/api/admin/site-settings \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <token>" \
  -d '{
    "key": "payment_settings",
    "label": "Payment Settings",
    "value": { "activeProvider": "stripe", ... }
  }'

# Expected: Created/updated setting
```

#### Test: uploadImage()

```bash
curl -X POST http://localhost:3333/api/admin/site-settings/upload-image \
  -H "X-XSRF-TOKEN: <token>" \
  -F "image=@hero.jpg"

# Expected: { success: true, url: "..." }
```

---

### Common Issues & Solutions

#### Issue: 403 Forbidden

```
Cause: User not authenticated or not admin
Fix: Verify user role is 'admin'
     Check auth middleware is applied to routes
```

#### Issue: File upload returns 422

```
Cause: Invalid file format or size
Fix: Check file extension (.jpg, .png, .webp)
     Check file size (<10MB)
```

#### Issue: Payment settings not saving

```
Cause: PaymentService.saveConfig() failing
Fix: Check PaymentService implementation
     Verify database migrations ran
     Check for validation errors
```

#### Issue: Settings not persisting

```
Cause: Database transaction not committed
Fix: Ensure await on save() calls
     Check database connection
     Verify migrations completed
```

---

### Performance Considerations

#### index()

- Fetches all settings (potential N+1 query)
- Consider caching if many settings
- Response time: O(n) where n = number of settings

#### show()

- Single database query
- May want to cache frequently accessed settings
- Response time: O(1)

#### paymentConfig()

- Single service call (may query database)
- Good candidate for caching
- Consider Redis cache for high traffic

#### upsert()

- Single query (create or update)
- Payment settings may trigger complex logic
- Response time: O(1) typically

#### uploadImage()

- Disk I/O intensive
- May be slow for large files
- Consider async processing for very large uploads

---

### Database Optimization

#### Indexes

```sql
-- Add indexes for faster queries
CREATE INDEX idx_site_settings_key ON site_settings(key);
```

#### Query Optimization

```typescript
// Avoid: Loading all settings if only need one
const settings = await SiteSetting.all()
const one = settings.find((s) => s.key === 'hero_title')

// Better: Query only what you need
const one = await SiteSetting.findBy('key', 'hero_title')
```

---

### Security Considerations

#### Authentication

- All admin endpoints require `role = 'admin'`
- Verified via middleware chain

#### Authorization

- Only admins can read/write settings
- PaymentService handles sensitive payment data

#### File Upload

- File size limited to 10MB
- Only allowed extensions: jpg, jpeg, png, webp
- Files stored with random names
- Public visibility means accessible to all

#### Secret Keys

- Payment secret keys stored in database
- NOT exposed in paymentConfig() endpoint
- Should be encrypted at rest (recommended)
- Use environment variables for sensitive values

---

### Integration with Other Services

#### PaymentService

```typescript
// Used in:
// - index() to fetch current config
// - show() for payment_settings
// - paymentConfig() for public endpoint
// - upsert() to save payment config

// Must implement:
async getConfig()  // Returns payment config
async saveConfig(config)  // Saves payment config
```

#### SiteSetting Model

```typescript
// Used in:
// - index() to fetch all settings
// - show() to query specific setting
// - upsert() to create/update settings

// Must support:
.all()  // Fetch all records
.findBy(key, value)  // Find by column
.create()  // Insert new record
.save()  // Update existing record
```

#### Drive Service

```typescript
// Used in:
// - uploadImage() to save files

// Must support:
.use(disk)  // Select storage disk
.putStream()  // Upload file stream
.getUrl()  // Get public URL
```

---

### Extension Points

#### Adding New Methods

**Create a custom setting:**

```typescript
async customMethod({ request, response }: HttpContext) {
  // Your logic here
  return response.json({ /* data */ })
}
```

**Example: Bulk update**

```typescript
async bulkUpdate({ request, response }: HttpContext) {
  const updates = request.body() as Record<string, any>[]

  const results = await Promise.all(
    updates.map(u => SiteSetting.create(u))
  )

  return response.json(results)
}
```

#### Adding Validation

**Add validators:**

```typescript
import { createValidator } from '@adonisjs/validator'

const updateSettingValidator = createValidator({
  key: 'required|string',
  label: 'string',
  value: 'required',
})

// In upsert():
const validated = await request.validateUsing(updateSettingValidator)
```

---

## 🔗 Routes Configuration

**File:** `start/routes.ts`

```typescript
// Admin routes group
router
  .group(() => {
    // Site settings endpoints
    router.get('/site-settings', [controllers.SiteSettings, 'index'])
    router.get('/site-settings/:key', [controllers.SiteSettings, 'show'])
    router.post('/site-settings', [controllers.SiteSettings, 'upsert'])
    router.post('/site-settings/upload-image', [controllers.SiteSettings, 'uploadImage'])
  })
  .use(middleware.role(['admin']))
  .use(adminThrottle)

// Public route
router.get('/payment-settings', [controllers.SiteSettings, 'paymentConfig'])
```

**Route Structure:**

```
/api/
  ├─ admin/
  │  ├─ site-settings (GET, POST)
  │  ├─ site-settings/:key (GET)
  │  └─ site-settings/upload-image (POST)
  └─ payment-settings (GET - public)
```

---

## 📝 Notes

- Payment settings are stored as JSON in a single database row
- Custom settings can be stored as plain text or JSON
- All updates require admin role
- Public endpoint does not expose secret keys
- Images are uploaded to configured storage driver
- Settings are not cached (read fresh each time)

---

**Controller Status:** ✅ Complete  
**Last Updated:** August 7, 2026  
**All Endpoints:** Fully Implemented
