# Payment Integration Guide

**Date:** August 8, 2026  
**Status:** ✅ Complete & Production Ready

---

## 📋 Overview

The Plenty Value Hub platform now supports 4 major payment providers:

- **Stripe** — Global cards, Apple Pay, Google Pay
- **Paystack** — Africa-focused (NGN, KES, GHS, USD)
- **Flutterwave** — Multi-currency global coverage
- **PayPal** — PayPal wallet & credit cards worldwide
- **Manual** — Offline/manual payment processing (always available)

This guide explains the architecture, configuration, and usage of the payment system.

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Payment Gateway                        │
│  (Orchestrator - routes to correct provider)             │
└──────────────┬──────────────────────────────────────────┘
               │
     ┌─────────┼─────────┬──────────────┬──────────────┐
     ▼         ▼         ▼              ▼              ▼
┌─────────┐┌────────┐┌──────────┐┌──────────┐┌────────┐
│ Stripe  ││Paystack││Flutterwave││PayPal   ││Manual  │
│Provider ││Provider││Provider   ││Provider ││Provider│
└─────────┘└────────┘└──────────┘└──────────┘└────────┘
     │         │         │              │              │
     └─────────┴─────────┴──────────────┴──────────────┘
               │
       ┌───────▼────────┐
       │ Validation &   │
       │ Error Handling │
       └────────────────┘
```

### Data Flow

**Payment Initiation:**

```
User Checkout
    ↓
POST /api/payments/initialize
    ↓
PaymentController.initialize()
    ↓
PaymentGateway.initiatePayment()
    ↓
ProviderService.initiatePayment() [Stripe/Paystack/etc]
    ↓
Return payment URL + transaction ID
    ↓
User redirected to provider's payment form
```

**Payment Verification:**

```
User completes payment at provider
    ↓
Provider redirects to callback URL
    ↓
POST /api/payments/verify
    ↓
PaymentController.verify()
    ↓
PaymentGateway.verifyPayment()
    ↓
Order status updated to "completed"
    ↓
Wallet updated, commissions calculated
```

**Webhook Processing:**

```
Provider sends webhook event
    ↓
POST /api/payments/webhook/:provider
    ↓
WebhookController.handleWebhook()
    ↓
PaymentGateway.handleWebhook()
    ↓
Provider-specific signature verification
    ↓
Event processed (payment confirmed, etc)
```

---

## 🔧 Configuration

### Environment Variables

Add to `.env`:

```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Paystack
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE_your_public_key
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE_your_secret_key
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=live
PAYPAL_WEBHOOK_ID=your_webhook_id

# Payment Settings
PAYMENT_CURRENCY=USD
PAYMENT_DEFAULT_PROVIDER=stripe
PAYMENT_WEBHOOK_URL_BASE=https://yourdomain.com/api/payments/webhook
```

### Configuration File

**File:** `config/payment.ts`

```typescript
export const paymentConfig = {
  defaultProvider: 'stripe',        // Default payment provider
  currency: 'USD',                  // Default currency
  webhookUrl: '...',               // Base URL for webhooks

  providers: {
    manual: { ... },
    stripe: { ... },
    paystack: { ... },
    flutterwave: { ... },
    paypal: { ... }
  },

  webhookEndpoints: {
    stripe: '/api/payments/webhook/stripe',
    paystack: '/api/payments/webhook/paystack',
    flutterwave: '/api/payments/webhook/flutterwave',
    paypal: '/api/payments/webhook/paypal'
  },

  limits: {
    minAmount: 100,              // Minimum in cents
    maxAmount: 10000000,         // Maximum in cents
    dailyLimit: 500000000        // Daily limit in cents
  },

  supportedCurrencies: {
    stripe: ['USD', 'EUR', 'GBP', ...],
    paystack: ['NGN', 'USD', ...],
    // ... per provider
  }
}
```

---

## 💰 Provider Details

### 1. Stripe

**Setup:**

1. Create Stripe account at https://dashboard.stripe.com
2. Go to API Keys section
3. Copy Public Key and Secret Key
4. Create webhook endpoint pointing to `/api/payments/webhook/stripe`
5. Copy webhook signing secret

**Key Features:**

- Global coverage (150+ currencies)
- Cards, Apple Pay, Google Pay, Alipay
- Low fees (~2.9% + $0.30)
- Excellent documentation

**Payment Flow:**

1. Create Checkout Session
2. Redirect user to payment form
3. User completes payment
4. Redirect back to callback URL
5. Verify payment via PaymentIntent

**Currencies Supported:**
USD, EUR, GBP, CAD, AUD, JPY, NGN, KES, GHS

---

### 2. Paystack

**Setup:**

1. Create Paystack account at https://dashboard.paystack.com
2. Get Public & Secret keys from Settings
3. Create webhook pointing to `/api/payments/webhook/paystack`
4. Enable required webhook events

**Key Features:**

- Africa-focused platform
- Cards, Mobile Money, Bank Transfer
- Best rates for African markets
- 1.5% + ₦10 in Nigeria

**Payment Flow:**

1. Initialize transaction endpoint
2. Get authorization URL
3. Redirect to payment form
4. Callback with payment reference
5. Verify transaction

**Currencies Supported:**
NGN (Nigeria), USD, KES (Kenya), GHS (Ghana)

---

### 3. Flutterwave

**Setup:**

1. Create Flutterwave account at https://dashboard.flutterwave.com
2. Get Public & Secret keys
3. Set webhook URL in dashboard
4. Get encryption key for API

**Key Features:**

- Multi-currency support
- 100+ payment methods
- Real-time settlements
- Global coverage

**Payment Flow:**

1. Create payment via `/v3/payments`
2. Generate payment link
3. User completes payment
4. Webhook confirms payment
5. Settlement to account

**Currencies Supported:**
USD, EUR, GBP, KES, NGN, GHS, ZAR, CAD, AUD

---

### 4. PayPal

**Setup:**

1. Create PayPal developer account
2. Create App in Sandbox/Live
3. Get Client ID & Secret
4. Set webhook listener
5. Enable required webhook events

**Key Features:**

- Massive user base
- PayPal wallet + cards
- Buyer protection
- 2.9% + $0.30 (standard)

**Payment Flow:**

1. Create Order with `/v2/checkout/orders`
2. Redirect to PayPal approval page
3. User logs in & approves
4. Capture payment
5. Settlement to account

**Currencies Supported:**
USD, EUR, GBP, CAD, AUD, JPY, CNY, NGN, KES

---

### 5. Manual (Offline)

**Setup:**

- No configuration required
- Always available

**Key Features:**

- Offline/manual processing
- Admin approval required
- For bank transfers, wire, checks
- Useful for B2B sales

**Payment Flow:**

1. Order created as "pending"
2. Admin notified to process payment offline
3. Admin marks order as "completed"
4. Fulfillment proceeds

---

## 🚀 API Endpoints

### Payment Endpoints

#### 1. GET /api/payment-providers

**Get available payment providers**

```bash
curl https://yourdomain.com/api/payment-providers
```

**Response:**

```json
{
  "success": true,
  "activeProvider": "stripe",
  "providers": [
    {
      "name": "stripe",
      "config": {
        "publicKey": "pk_live_...",
        "name": "stripe",
        "label": "Stripe"
      }
    }
    // ... more providers
  ]
}
```

#### 2. POST /api/payments/initialize

**Start a payment session**

```bash
curl -X POST https://yourdomain.com/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "productId": 123,
    "paymentProvider": "stripe",
    "affiliateLinkCode": "ref123",
    "callbackUrl": "https://yourdomain.com/checkout/success"
  }'
```

**Request:**

```typescript
{
  productId: number (required)              // Product to purchase
  paymentProvider?: string                  // 'stripe'|'paystack'|'flutterwave'|'paypal'|'manual'
  affiliateLinkCode?: string               // Affiliate link code
  callbackUrl?: string                     // Return URL after payment
}
```

**Response:**

```json
{
  "success": true,
  "provider": "stripe",
  "payment": {
    "transactionId": "cs_test_...",
    "paymentUrl": "https://checkout.stripe.com/...",
    "reference": "ORD-2024-123456"
  },
  "order": {
    "id": 456,
    "orderNumber": "ORD-2024-123456",
    "amount": "99.99",
    "status": "pending"
  }
}
```

#### 3. POST /api/payments/verify

**Verify a payment transaction**

```bash
curl -X POST https://yourdomain.com/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "stripe",
    "reference": "ORD-2024-123456"
  }'
```

**Response:**

```json
{
  "success": true,
  "verified": true,
  "order": {
    "id": 456,
    "orderNumber": "ORD-2024-123456",
    "status": "completed"
  }
}
```

### Webhook Endpoints

#### Stripe Webhook

**POST /api/payments/webhook/stripe**

Header: `stripe-signature`

#### Paystack Webhook

**POST /api/payments/webhook/paystack**

Header: `x-paystack-signature`

#### Flutterwave Webhook

**POST /api/payments/webhook/flutterwave**

Header: `verif-hash`

#### PayPal Webhook

**POST /api/payments/webhook/paypal**

Header: `paypal-transmission-sig`

#### Generic Webhook

**POST /api/payments/webhook/:provider**

Automatically routes to the correct provider handler.

### Admin Endpoints

#### Get Webhook Endpoints

**GET /api/admin/payments/webhook-endpoints** (Admin only)

Returns all configured webhook URLs for each provider.

#### Test Webhook

**POST /api/admin/payments/webhook-test/:provider** (Admin only)

Sends a test webhook from the specified provider.

```bash
curl -X POST https://yourdomain.com/api/admin/payments/webhook-test/stripe \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🔐 Security

### Best Practices

1. **Secret Keys**
   - Store in `.env` file (never commit)
   - Use separate keys for sandbox and live
   - Rotate keys periodically

2. **Webhook Verification**
   - Always verify webhook signature
   - Use provider's verification method
   - Reject unverified events

3. **HTTPS Only**
   - Use HTTPS for all payment URLs
   - Enforce HTTPS redirects
   - Use secure cookies

4. **PCI Compliance**
   - Never log card numbers
   - Use provider's hosted forms
   - Don't store card data

5. **Validation**
   - Validate all payment data
   - Check order amounts match
   - Verify user identity

### Rate Limiting

Payment endpoints are rate-limited:

- Public endpoints: 100 req/min per IP
- Authenticated endpoints: 1000 req/min per user
- Admin endpoints: 500 req/min per admin

---

## 🧪 Testing

### Test Mode

Set environment to use sandbox/test keys:

```bash
# .env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_MODE=sandbox
```

### Test Cards

**Stripe:**

- Visa: 4242 4242 4242 4242
- Mastercard: 5555 5555 5555 4444
- Amex: 3782 822463 10005

**Paystack (NGN):**

- Visa: 4084084084084081
- MasterCard: 5078500000000000

**Flutterwave:**

- Test cards available in dashboard

**PayPal:**

- Create sandbox business account in developer panel

### Testing Webhooks

Use the admin test endpoint:

```bash
curl -X POST http://localhost:3333/api/admin/payments/webhook-test/stripe \
  -H "Authorization: Bearer <token>"
```

Or use provider's webhook testing tools (Stripe Dashboard, Postman, etc.)

---

## 📊 Integration Example

### React Component

```typescript
// components/CheckoutButton.tsx
import { apiClient } from '@/api/http-client'
import { useState } from 'react'

export function CheckoutButton({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await apiClient.post('/api/payments/initialize', {
        productId,
        paymentProvider: 'stripe',
        callbackUrl: window.location.origin + '/order/success',
      })

      if (response.data.success) {
        // Redirect to payment gateway
        window.location.href = response.data.payment.paymentUrl
      }
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing...' : 'Checkout with Stripe'}
    </button>
  )
}
```

### Success Handler

```typescript
// pages/order/success.tsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiClient } from '@/api/http-client'

export function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id')
      const reference = searchParams.get('reference')

      if (!reference) {
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.post('/api/payments/verify', {
          provider: 'stripe',
          reference,
        })

        setVerified(response.data.verified)
      } catch (error) {
        console.error('Verification failed:', error)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  if (loading) return <div>Verifying payment...</div>
  if (!verified) return <div>Payment verification failed</div>

  return <div>✓ Payment successful! Your order has been confirmed.</div>
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Provider Not Available

**Error:** `Payment provider 'stripe' is not available`

**Solution:**

- Check environment variables are set
- Verify API keys are correct
- Restart application

#### 2. Webhook Signature Invalid

**Error:** `Invalid webhook signature`

**Solution:**

- Verify webhook secret matches provider dashboard
- Check request payload isn't modified
- Ensure HTTPS is used
- Verify timestamp isn't too old

#### 3. Payment Initialization Fails

**Error:** `Payment initialization failed`

**Solutions:**

- Verify product exists and is approved
- Check payment amount is valid
- Ensure currency is supported by provider
- Verify user is authenticated

#### 4. Order Not Found

**Error:** `Order not found`

**Solution:**

- Ensure order was created during initialization
- Check order reference is correct
- Verify database connection

---

## 📈 Monitoring

### Key Metrics

Track these metrics for each provider:

- **Success Rate:** Successful payments / total initiated
- **Average Transaction Time:** From init to completion
- **Webhook Delivery Time:** Average delay
- **Refund Success Rate:** Refunds / total requests
- **Error Rate:** Errors / total transactions

### Logging

Check logs for payment operations:

```bash
# View payment logs
tail -f storage/logs/payment.log

# Filter by provider
grep "stripe" storage/logs/payment.log
grep "paystack" storage/logs/payment.log
```

### Alerts

Set up alerts for:

- High error rate (>5%)
- Failed webhooks
- Unusual transaction amounts
- Multiple failed attempts from same IP

---

## 📚 Provider Documentation

### Official Docs

- **Stripe:** https://stripe.com/docs
- **Paystack:** https://paystack.com/docs
- **Flutterwave:** https://developer.flutterwave.com/docs
- **PayPal:** https://developer.paypal.com/docs

### Testing Tools

- **Stripe:** https://stripe.com/docs/testing
- **Paystack:** Sandbox mode in dashboard
- **Flutterwave:** Test mode in dashboard
- **PayPal:** Developer sandbox

---

## 🔄 Migration Guide

### From Single Provider to Multi-Provider

If migrating from single provider:

1. **Add new provider credentials** to `.env`
2. **Update configuration** in `config/payment.ts`
3. **Test** with test mode credentials
4. **Run migrations** if schema changes
5. **Update frontend** to show provider options
6. **Gradual rollout** - start with 10% traffic
7. **Monitor** closely for issues

---

## ✅ Deployment Checklist

- [ ] All provider credentials set in production `.env`
- [ ] Webhooks configured at each provider's dashboard
- [ ] SSL certificates valid and HTTPS enforced
- [ ] Logging and monitoring configured
- [ ] Backup payment provider configured
- [ ] Test payment completed with each provider
- [ ] Error handling and alerts working
- [ ] Team trained on payment system
- [ ] Documentation shared with support team
- [ ] Business continuity plan in place

---

**Status:** ✅ Production Ready  
**Last Updated:** August 8, 2026  
**Support:** See payment-related documentation files
