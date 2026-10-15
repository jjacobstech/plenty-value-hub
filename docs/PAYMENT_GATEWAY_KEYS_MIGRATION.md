# Payment Gateway Keys Migration to Database

## Overview

Payment gateway credentials (API keys, secrets, webhook secrets) have been migrated from `.env` file to encrypted database storage. This provides better security, easier management, and dynamic configuration without application restarts.

## What Changed

### ✅ Completed Tasks

1. **Database Migration** (`payment_gateway_keys` table)
   - Stores gateway configurations with encrypted fields
   - Columns: gateway (unique), public_key, secret_key, merchant_id, is_active, webhook_secret
   - All sensitive fields are encrypted using AdonisJS encryption

2. **PaymentGatewayKey Model**
   - Auto-encrypts/decrypts credentials on get/set
   - Methods: `findByGateway()`, `getActiveGateways()`, `getConfig()`, `updateCredentials()`, `toggleActive()`

3. **PaymentGatewayService**
   - Retrieves and caches gateway configurations
   - Caches for 1 hour to minimize database queries
   - Methods: `getConfig()`, `getAllConfigs()`, `getCredential()`, `updateConfig()`, `toggleGateway()`, `clearCache()`, `isConfigured()`, `getConfiguredGateways()`

4. **Admin API Endpoints** (`/api/admin/payment-settings`)
   - `GET /api/admin/payment-settings` - List all gateways
   - `GET /api/admin/payment-settings/:gateway` - Get single gateway config
   - `POST /api/admin/payment-settings` - Create/update gateway config
   - `PUT /api/admin/payment-settings/:gateway` - Update specific gateway
   - `PATCH /api/admin/payment-settings/:gateway/toggle` - Toggle active status
   - `DELETE /api/admin/payment-settings/:gateway` - Delete gateway config
   - `GET /api/admin/payment-settings/status/list` - Get gateway status list

5. **Admin UI Page** (`/admin/payment-settings`)
   - Dashboard with gateway cards showing status
   - Edit/create dialog with password visibility toggle
   - Credentials table with status management
   - Support for Stripe, Paystack, Flutterwave, PayPal

6. **Payment Provider Updates**
   - Paystack provider updated to use database keys
   - Lazy-loads secrets from PaymentGatewayService
   - Same pattern can be applied to Stripe, Flutterwave, PayPal providers

7. **Removed .env Keys**
   - All payment gateway credentials removed from `.env`
   - `.env.example` updated with instructions

## How to Use

### For Admins: Setting Up Payment Gateways

1. **Log in as Admin**
2. **Navigate to** `/admin/payment-settings`
3. **Choose a gateway** (Stripe, Paystack, Flutterwave, PayPal)
4. **Enter credentials:**
   - Public Key (required)
   - Secret Key (required)
   - Merchant ID (optional)
   - Webhook Secret (optional)
5. **Toggle to enable** the gateway
6. **Save** - Keys are automatically encrypted

### For Developers: Using Gateway Configuration

```typescript
import { PaymentGatewayService } from '#services/payment_gateway_service'

// Get configuration for a specific gateway
const paystackConfig = await PaymentGatewayService.getConfig('paystack')
// Returns: { gateway, publicKey, secretKey, merchantId, webhookSecret, isActive }

// Get all active gateways
const allConfigs = await PaymentGatewayService.getAllConfigs()

// Get specific credential
const secretKey = await PaymentGatewayService.getCredential('paystack', 'secretKey')

// Check if gateway is configured and active
const isConfigured = await PaymentGatewayService.isConfigured('paystack')

// Update gateway configuration
await PaymentGatewayService.updateConfig(
  'paystack',
  'pk_live_xxx',
  'sk_live_xxx',
  merchantId,
  webhookSecret,
  true // isActive
)

// Toggle gateway active status
const newStatus = await PaymentGatewayService.toggleGateway('paystack')

// Clear cache (useful after manual DB updates)
await PaymentGatewayService.clearCache('paystack')
```

## Security Features

### Encryption

- All sensitive fields (public_key, secret_key, webhook_secret) are encrypted using AdonisJS `encrypt()` helper
- Encryption key is managed by AdonisJS (APP_KEY in .env)
- Keys are decrypted on-the-fly when accessed

### Database Protection

- Only admin users can access `/api/admin/payment-settings` endpoints
- All endpoints verify admin role before processing
- Keys are never returned in API responses (only indicators that they exist)

### Access Control

- Payment gateway settings UI is admin-only
- No endpoint exposes actual key values
- Configuration changes logged automatically

## Migration Path

### For Existing Deployments

1. **Run database migration**

   ```bash
   node ace migration:run
   ```

2. **Manually add credentials** via Admin Panel at `/admin/payment-settings`
   - Copy keys from your existing .env or gateway provider dashboard
   - Save through the UI (they'll be encrypted automatically)

3. **Update payment provider files** (if using specific gateways)
   - Apply the same pattern from Paystack provider to Stripe, Flutterwave, PayPal
   - Providers will load secrets from database on first use

4. **Remove keys from .env**
   - Already done in this migration
   - .env no longer contains sensitive payment credentials

5. **Redeploy application**
   - No application restart needed (caching handles new configs)
   - Clear cache via API if needed: `POST /api/admin/payment-settings/:gateway/clear-cache`

## Environment Variables (No Longer Needed)

The following variables have been **removed** from `.env` and are now managed via database:

```
STRIPE_PUBLIC_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
PAYSTACK_WEBHOOK_SECRET

FLUTTERWAVE_PUBLIC_KEY
FLUTTERWAVE_SECRET_KEY
FLUTTERWAVE_WEBHOOK_SECRET
FLUTTERWAVE_ENCRYPTION_KEY

PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_WEBHOOK_ID
```

Remaining .env settings for payment:

```
PAYMENT_CURRENCY=NGN
PAYMENT_DEFAULT_PROVIDER=stripe
PAYMENT_WEBHOOK_URL_BASE=http://localhost:3000/api/payments/webhook
```

## Caching Strategy

- Configurations are cached for **1 hour** after retrieval
- Cache is automatically cleared when:
  - Gateway configuration is updated
  - Gateway is toggled active/inactive
  - Gateway is deleted
- Manual cache clear available via service method

## Troubleshooting

### Gateway not loading

- Verify gateway is marked as active in Admin Panel
- Check database has payment_gateway_keys table (run migrations)
- Clear cache: `await PaymentGatewayService.clearCache('gateway_name')`

### Encryption errors

- Ensure APP_KEY is set correctly in .env
- Check database encryption column values aren't corrupted
- Verify AdonisJS version is compatible

### Keys showing as "incomplete"

- Ensure both public_key and secret_key are filled in
- Optional fields (merchant_id, webhook_secret) can be left blank

## Files Modified/Created

### Created

- `database/migrations/1786662815038_create_payment_gateway_keys_table.ts`
- `app/models/payment_gateway_key.ts`
- `app/services/payment_gateway_service.ts`
- `app/controllers/payment_settings_controller.ts`
- `inertia/pages/admin/AdminPaymentSettings.tsx`
- `PAYMENT_GATEWAY_KEYS_MIGRATION.md` (this file)

### Modified

- `app/services/payment_providers/paystack_provider.ts` - Updated to use PaymentGatewayService
- `start/routes.ts` - Added admin payment-settings routes
- `.env` - Removed payment gateway keys
- `.env.example` - Updated with new instructions

### Pending (Same pattern to apply)

- `app/services/payment_providers/stripe_provider.ts`
- `app/services/payment_providers/flutterwave_provider.ts`
- `app/services/payment_providers/paypal_provider.ts`

## Next Steps

1. **Run migrations** to create payment_gateway_keys table
2. **Configure payment gateways** via `/admin/payment-settings`
3. **Update remaining payment providers** to use PaymentGatewayService
4. **Test payment flows** to ensure all gateways work correctly
5. **Deploy** to production

## Support

For issues or questions about this migration:

1. Check the Admin Panel UI for configuration errors
2. Review service logs for error messages
3. Verify database has correct encryption key in APP_KEY
4. Test individual gateway configurations via the admin interface
