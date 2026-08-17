# Payment Gateway Callback URLs

**Date:** August 12, 2026  
**Status:** ✅ Complete & Production Ready

This document lists all callback URLs and webhook endpoints for each payment provider integrated into Plenty Value Hub.

---

## 📋 Overview

| Gateway         | Webhook URL | Return URL | Callback Type        |
| --------------- | ----------- | ---------- | -------------------- |
| **Stripe**      | ✅          | ✅         | Event-based webhooks |
| **Paystack**    | ✅          | ✅         | Event-based webhooks |
| **Flutterwave** | ✅          | ✅         | Event-based webhooks |
| **PayPal**      | ✅          | ✅         | Event-based webhooks |
| **Manual**      | -           | -          | Admin approval       |

---

## 🔗 Webhook Endpoints (For Provider Configuration)

Configure these URLs in each payment provider's dashboard.

### Stripe Webhook

**Endpoint:** `POST /api/payments/webhook/stripe`

**Full URL:**

```
Development:  http://localhost:3000/api/payments/webhook/stripe
Staging:      https://staging.plentyvalue.com/api/payments/webhook/stripe
Production:   https://plentyvalue.com/api/payments/webhook/stripe
```

**Configuration:**

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add an endpoint"
3. Enter endpoint URL above
4. Select events to receive:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`

**Webhook Header:**

```
stripe-signature: <signature_value>
```

**Secret Key Variable:**

```
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

---

### Paystack Webhook

**Endpoint:** `POST /api/payments/webhook/paystack`

**Full URL:**

```
Development:  http://localhost:3000/api/payments/webhook/paystack
Staging:      https://staging.plentyvalue.com/api/payments/webhook/paystack
Production:   https://plentyvalue.com/api/payments/webhook/paystack
```

**Configuration:**

1. Go to https://dashboard.paystack.com/settings/developers
2. Scroll to "Webhook"
3. Enter endpoint URL above
4. Click "Save"
5. Events automatically enabled:
   - `charge.success`
   - `charge.failed`
   - `transfer.success`
   - `transfer.failed`

**Webhook Header:**

```
x-paystack-signature: <signature_value>
```

**Secret Key Variable:**

```
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
```

---

### Flutterwave Webhook

**Endpoint:** `POST /api/payments/webhook/flutterwave`

**Full URL:**

```
Development:  http://localhost:3000/api/payments/webhook/flutterwave
Staging:      https://staging.plentyvalue.com/api/payments/webhook/flutterwave
Production:   https://plentyvalue.com/api/payments/webhook/flutterwave
```

**Configuration:**

1. Go to https://dashboard.flutterwave.com/settings/webhooks
2. Enter endpoint URL above
3. Select events:
   - `payment.completed`
   - `payment.failed`
   - `refund.created`

**Webhook Header:**

```
verif-hash: <hash_value>
```

**Secret Key Variable:**

```
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret_here
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key_here
```

---

### PayPal Webhook

**Endpoint:** `POST /api/payments/webhook/paypal`

**Full URL:**

```
Development:  http://localhost:3000/api/payments/webhook/paypal
Staging:      https://staging.plentyvalue.com/api/payments/webhook/paypal
Production:   https://plentyvalue.com/api/payments/webhook/paypal
```

**Configuration:**

1. Go to https://developer.paypal.com/dashboard/webhooks
2. Click "Create webhook"
3. Enter endpoint URL above
4. Select event types:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `BILLING.PLAN.UPDATED`

**Webhook Header:**

```
paypal-transmission-sig: <signature_value>
```

**Secret Key Variable:**

```
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

---

## ↩️ Return/Callback URLs (For User Redirect)

After payment completion, users are redirected back to your application.

### Generic Return URL

**Endpoint:** `GET /checkout/success`

**Full URL:**

```
Development:  http://localhost:3000/checkout/success
Staging:      https://staging.plentyvalue.com/checkout/success
Production:   https://plentyvalue.com/checkout/success
```

**Query Parameters:**

```
?reference=<order_reference>
&provider=<payment_provider>
&status=<success|failed>
```

**Example:**

```
https://plentyvalue.com/checkout/success?reference=ORD-2024-123456&provider=stripe&status=success
```

---

### Stripe Return URL

**Redirect After Payment:**

```
GET /checkout/success?reference=<stripe_session_id>&provider=stripe&status=success
```

**Session Parameter:**

```
session_id=cs_test_... (passed in Checkout Session)
```

**Frontend Implementation:**

```typescript
const stripe = await loadStripe(STRIPE_PUBLIC_KEY)
const { sessionId } = response.data.payment

const result = await stripe.redirectToCheckout({ sessionId })
// After payment, redirects to:
// https://yourdomain.com/checkout/success?session_id=cs_test_...
```

---

### Paystack Return URL

**Redirect After Payment:**

```
GET /checkout/success?reference=<paystack_reference>&provider=paystack&status=success
```

**Reference Parameter:**

```
reference=<authorization_key> (from Paystack API)
```

**Frontend Implementation:**

```typescript
const handler = PaystackPop.setup({
  key: PAYSTACK_PUBLIC_KEY,
  email: user.email,
  amount: amount * 100,
  ref: generateReference(),
  onClose: () => redirectTo('/checkout/failed'),
  onSuccess: (response) => {
    redirectTo(`/checkout/success?reference=${response.reference}`)
  },
})
handler.openIframe()
```

---

### Flutterwave Return URL

**Redirect After Payment:**

```
GET /checkout/success?reference=<flutterwave_reference>&provider=flutterwave&status=success
```

**Reference Parameter:**

```
reference=<transaction_id> (from Flutterwave API)
```

**Frontend Implementation:**

```typescript
const handleFlutterPayment = useFlutterwave({
  public_key: FLUTTERWAVE_PUBLIC_KEY,
  tx_ref: generateReference(),
  amount: amount,
  currency: 'NGN',
  customer: {
    email: user.email,
    name: user.name,
  },
  onComplete: (response) => {
    redirectTo(`/checkout/success?reference=${response.transaction_id}`)
  },
  onClose: () => redirectTo('/checkout/failed'),
})
```

---

### PayPal Return URL

**Redirect After Payment:**

```
GET /checkout/success?orderID=<paypal_order_id>&provider=paypal&status=success
```

**Order Parameter:**

```
orderID=<PayPal Order ID> (from PayPal Checkout.js)
```

**Frontend Implementation:**

```typescript
paypal
  .Buttons({
    createOrder: (data, actions) => {
      return fetch('/api/payments/initialize', {
        method: 'post',
        body: JSON.stringify({ productId, paymentProvider: 'paypal' }),
      })
        .then((res) => res.json())
        .then((data) => data.payment.transactionId)
    },
    onApprove: (data, actions) => {
      return fetch('/api/payments/verify', {
        method: 'post',
        body: JSON.stringify({
          provider: 'paypal',
          reference: data.orderID,
        }),
      }).then(() => {
        redirectTo(`/checkout/success?orderID=${data.orderID}&provider=paypal`)
      })
    },
    onError: () => redirectTo('/checkout/failed'),
  })
  .render('#paypal-button-container')
```

---

## 🔐 Webhook Verification

Each provider uses different signature verification methods.

### Stripe Signature Verification

**Header:** `stripe-signature`  
**Format:** `t=<timestamp>,v1=<signature>`

**Verification Method:**

```bash
signature = HMAC-SHA256(timestamp + . + body, webhook_secret)
```

**Implementation:**

```typescript
import crypto from 'crypto'

const verifyStripeSignature = (request: Request, secret: string): boolean => {
  const signature = request.headers['stripe-signature'] as string
  const body = request.rawBody

  const [timestamp, signedContent] = signature.split(',').map((part) => part.split('=')[1])

  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex')

  return computedSignature === signedContent
}
```

---

### Paystack Signature Verification

**Header:** `x-paystack-signature`

**Verification Method:**

```bash
signature = HMAC-SHA512(body, webhook_secret)
```

**Implementation:**

```typescript
import crypto from 'crypto'

const verifyPaystackSignature = (request: Request, secret: string): boolean => {
  const signature = request.headers['x-paystack-signature'] as string
  const body = request.rawBody

  const computedSignature = crypto.createHmac('sha512', secret).update(body).digest('hex')

  return computedSignature === signature
}
```

---

### Flutterwave Signature Verification

**Header:** `verif-hash`

**Verification Method:**

```bash
hash = SHA256(request.body + flutterwave_secret_key)
```

**Implementation:**

```typescript
import crypto from 'crypto'

const verifyFlutterwaveSignature = (request: Request, secretKey: string): boolean => {
  const hash = request.headers['verif-hash'] as string
  const body = request.rawBody

  const computedHash = crypto
    .createHash('sha256')
    .update(body + secretKey)
    .digest('hex')

  return computedHash === hash
}
```

---

### PayPal Signature Verification

**Header:** `paypal-transmission-sig`  
**Other Headers:** `paypal-transmission-id`, `paypal-transmission-time`, `paypal-cert-url`

**Verification Method:**

- Download certificate from `paypal-cert-url`
- Verify RSA signature using certificate
- Verify webhook ID and timestamp

**Implementation:**

```typescript
import crypto from 'crypto'
import https from 'https'

const verifyPayPalSignature = async (request: Request, webhookId: string): Promise<boolean> => {
  const transmissionId = request.headers['paypal-transmission-id']
  const transmissionTime = request.headers['paypal-transmission-time']
  const certUrl = request.headers['paypal-cert-url']
  const signature = request.headers['paypal-transmission-sig']
  const body = request.rawBody

  // Download and verify certificate
  const cert = await downloadCertificate(certUrl)

  // Create verification string
  const verificationString = `${transmissionId}|${transmissionTime}|${webhookId}|${body}`

  // Verify signature
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(verificationString)

  return verifier.verify(cert, Buffer.from(signature, 'base64'))
}
```

---

## 📊 Callback Flow Diagrams

### Stripe Flow

```
User Checkout
     ↓
Initialize Payment (POST /api/payments/initialize)
     ↓
Stripe Session Created
     ↓
User Redirected to Stripe Checkout Form
     ↓
User Completes Payment
     ↓
Stripe sends Webhook Event
     ↓
Webhook Received (POST /api/payments/webhook/stripe)
     ↓
Signature Verified
     ↓
Order Status Updated to "completed"
     ↓
User Redirected to Success Page
```

### Paystack Flow

```
User Checkout
     ↓
Initialize Payment (POST /api/payments/initialize)
     ↓
Paystack Authorization URL Generated
     ↓
User Redirected to Paystack Payment Page
     ↓
User Completes Payment
     ↓
User Redirected Back (GET /checkout/success?reference=...)
     ↓
Verify Payment (POST /api/payments/verify)
     ↓
Paystack API Called to Confirm
     ↓
Order Status Updated to "completed"
     ↓
Webhook Event Also Received (POST /api/payments/webhook/paystack)
     ↓
Additional Confirmation
```

### PayPal Flow

```
User Checkout
     ↓
Initialize Payment (POST /api/payments/initialize)
     ↓
PayPal Order Created
     ↓
User Redirected to PayPal Approval
     ↓
User Logs In & Approves Payment
     ↓
User Redirected Back to App
     ↓
Verify Payment (POST /api/payments/verify)
     ↓
Payment Captured
     ↓
Order Status Updated to "completed"
     ↓
Webhook Event Received (POST /api/payments/webhook/paypal)
     ↓
Additional Confirmation
```

---

## 🧪 Testing Webhook Callbacks

### Using cURL

**Test Stripe Webhook:**

```bash
curl -X POST http://localhost:3000/api/payments/webhook/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1692892800,v1=test_signature" \
  -d '{
    "id": "evt_test",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test",
        "amount": 9999,
        "currency": "usd",
        "status": "succeeded"
      }
    }
  }'
```

**Test Paystack Webhook:**

```bash
curl -X POST http://localhost:3000/api/payments/webhook/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test_signature" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "ORD-2024-123456",
      "amount": 999900,
      "status": "success"
    }
  }'
```

### Using Admin Test Endpoint

**Trigger Test Webhook:**

```bash
curl -X POST http://localhost:3000/api/admin/payments/webhook-test/stripe \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

---

## 🔄 Environment-Specific URLs

### Development

```
Webhook Base:    http://localhost:3000/api/payments/webhook
Return Base:     http://localhost:3000/checkout
Admin Endpoint:  http://localhost:3000/api/admin/payments
```

### Staging

```
Webhook Base:    https://staging.plentyvalue.com/api/payments/webhook
Return Base:     https://staging.plentyvalue.com/checkout
Admin Endpoint:  https://staging.plentyvalue.com/api/admin/payments
```

### Production

```
Webhook Base:    https://plentyvalue.com/api/payments/webhook
Return Base:     https://plentyvalue.com/checkout
Admin Endpoint:  https://plentyvalue.com/api/admin/payments
```

---

## ✅ Configuration Checklist

- [ ] **Stripe**
  - [ ] Webhook endpoint configured at https://dashboard.stripe.com/webhooks
  - [ ] Secret key saved to `STRIPE_WEBHOOK_SECRET`
  - [ ] Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

- [ ] **Paystack**
  - [ ] Webhook endpoint configured at https://dashboard.paystack.com/settings/developers
  - [ ] Secret key saved to `PAYSTACK_WEBHOOK_SECRET`
  - [ ] Events enabled in dashboard

- [ ] **Flutterwave**
  - [ ] Webhook endpoint configured at https://dashboard.flutterwave.com/settings/webhooks
  - [ ] Secret key saved to `FLUTTERWAVE_WEBHOOK_SECRET`
  - [ ] Encryption key saved to `FLUTTERWAVE_ENCRYPTION_KEY`

- [ ] **PayPal**
  - [ ] Webhook listener created at https://developer.paypal.com/dashboard/webhooks
  - [ ] Webhook ID saved to `PAYPAL_WEBHOOK_ID`
  - [ ] Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

- [ ] **All Providers**
  - [ ] URLs updated for current environment (dev/staging/prod)
  - [ ] HTTPS enforced in production
  - [ ] Test webhooks working
  - [ ] Monitoring and alerts configured

---

## 📞 Support

For issues with callbacks:

1. Check webhook logs: `storage/logs/webhook.log`
2. Verify signature in provider dashboard
3. Test with admin endpoint: `/api/admin/payments/webhook-test/:provider`
4. Check provider's webhook delivery history
5. Ensure environment variables are correct

---

**Status:** ✅ Complete  
**Last Updated:** August 12, 2026
