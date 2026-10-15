# Payment Gateway System Architecture

## Overview

The Plenty Value Hub payment system is a comprehensive, multi-provider payment processing architecture implementing several design patterns for flexibility, security, and maintainability. The system supports Stripe, PayPal, Flutterwave, Paystack, and manual payments.

## Architecture Patterns

### 1. Strategy Pattern
**Implementation**: Payment Provider Interface
```typescript
// app/interfaces/payment_provider.ts
interface PaymentProvider {
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>
  verifyPayment(transactionId: string, reference?: string): Promise<PaymentResponse>
  verifyWebhookSignature(payload: string, signature: string): boolean
  handleWebhookEvent(payload: WebhookPayload): Promise<WebhookResponse>
  refundPayment(transactionId: string, amount?: number): Promise<RefundResponse>
  getConfig(): Record<string, any>
  isAvailable(): boolean | Promise<boolean>
}
```

**Purpose**: Defines a common interface allowing different payment providers to be used interchangeably.

**Implementations**:
- `StripeProvider` - Stripe Checkout integration
- `PaystackProvider` - African payment gateway
- `FlutterwaveProvider` - Multi-currency African payments
- `PayPalProvider` - Global PayPal integration
- `ManualProvider` - Offline/manual payments

### 2. Factory Pattern
**Implementation**: PaymentGateway Service
```typescript
// app/services/payment_gateway.ts
export class PaymentGateway implements PaymentProviderFactory {
  private providers: Map<string, PaymentProvider> = new Map()
  
  create(provider: string): PaymentProvider | null {
    return this.getProvider(provider)
  }
  
  getProvider(provider: string): PaymentProvider | null {
    // Lazy instantiation of providers
    if (this.providers.has(provider)) {
      return this.providers.get(provider)!
    }
    
    switch (provider) {
      case 'stripe': return new StripeProvider()
      case 'paystack': return new PaystackProvider()
      case 'flutterwave': return new FlutterwaveProvider()
      case 'paypal': return new PayPalProvider()
      default: return null
    }
  }
}
```

**Purpose**: 
- Lazy loading of payment providers (only instantiated when needed)
- Centralized provider creation and management
- Singleton pattern for factory instance

### 3. Adapter Pattern
**Implementation**: Provider-Specific Adapters
Each payment provider adapter converts the external API to our internal interface:

```typescript
// Example: PaystackProvider adapter
export class PaystackProvider implements PaymentProvider {
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Adapts internal PaymentRequest to Paystack API format
    const response = await this.client.post('/transaction/initialize', {
      email: request.email,
      amount: request.amount, // Convert cents to kobo
      currency: this.getCurrency(request.currency),
      reference: request.orderId,
      // ... Paystack-specific fields
    })
    
    // Adapts Paystack response to internal PaymentResponse format
    return {
      success: data.status === true,
      provider: 'paystack',
      transactionId: data.data.reference,
      // ... standardized response
    }
  }
}
```

**Purpose**: 
- Isolates external API differences
- Normalizes responses across providers
- Handles provider-specific data transformations

### 4. Service Layer Pattern
**Implementation**: Multiple Service Layers

**PaymentService** (High-level business logic):
```typescript
// app/services/payment_service.ts
export class PaymentService {
  static async initializePayment(opts): Promise<PaymentInitResult>
  static async verifyPayment(provider, reference): Promise<PaymentVerifyResult>
  static async getConfig(): Promise<PaymentSettingsConfig>
}
```

**PaymentGatewayService** (Configuration management):
```typescript
// app/services/payment_gateway_service.ts
export class PaymentGatewayService {
  static async getConfig(gateway: string)
  static async updateConfig(gateway, publicKey, secretKey, ...)
  static async clearCache(gateway?: string)
}
```

### 5. Repository Pattern
**Implementation**: PaymentGatewayKey Model with Encryption
```typescript
// app/models/payment_gateway_key.ts
export default class PaymentGatewayKey extends BaseModel {
  // Encrypted storage with automatic encryption/decryption
  get publicKey(): string {
    return decrypt(this._publicKey)
  }
  
  set publicKey(value: string) {
    this._publicKey = encrypt(value)
  }
}
```

## System Components

### Core Interfaces

#### PaymentProvider Interface
- **Location**: `app/interfaces/payment_provider.ts`
- **Purpose**: Defines contract for all payment providers
- **Methods**:
  - `initiatePayment()` - Start payment process
  - `verifyPayment()` - Verify transaction status
  - `verifyWebhookSignature()` - Validate webhook authenticity
  - `handleWebhookEvent()` - Process webhook events
  - `refundPayment()` - Process refunds
  - `getConfig()` - Provider configuration
  - `isAvailable()` - Check provider availability

#### PaymentRequest/Response Types
```typescript
interface PaymentRequest {
  id: string
  amount: number // in cents
  currency: string
  email: string
  orderId: string
  description: string
  metadata?: Record<string, any>
  returnUrl?: string
  webhookUrl?: string
}

interface PaymentResponse {
  success: boolean
  provider: string
  transactionId: string
  status: PaymentStatus
  amount: number
  currency: string
  paymentUrl?: string
  reference?: string
  timestamp: Date
}
```

### Factory Implementation

#### PaymentGateway (Factory)
- **Location**: `app/services/payment_gateway.ts`
- **Features**:
  - Lazy provider instantiation
  - Provider availability checking
  - Unified payment operations
  - Error handling and logging
  - Currency validation
  - Amount limits validation

#### Provider Registration
```typescript
getProvider(provider: string): PaymentProvider | null {
  switch (provider) {
    case 'stripe': return new StripeProvider()
    case 'paystack': return new PaystackProvider()
    case 'flutterwave': return new FlutterwaveProvider()
    case 'paypal': return new PayPalProvider()
    case 'manual': return new ManualProvider()
    default: return null
  }
}
```

### Adapter Implementations

#### StripeProvider
- **Location**: `app/services/payment_providers/stripe_provider.ts`
- **Features**:
  - Stripe Checkout Sessions
  - Payment Intent handling
  - Webhook signature verification
  - Refund processing
  - Database credential loading

#### PaystackProvider
- **Location**: `app/services/payment_providers/paystack_provider.ts`
- **Features**:
  - Transaction initialization
  - Payment verification
  - Webhook processing
  - Currency conversion (NGN, USD, KES, GHS)
  - Lazy credential loading from database

#### FlutterwaveProvider
- **Location**: `app/services/payment_providers/flutterwave_provider.ts**
- **Features**:
  - Multi-currency support
  - Card, mobile money, USSD payments
  - Transaction verification
  - Webhook signature validation

#### PayPalProvider
- **Location**: `app/services/payment_providers/paypal_provider.ts`
- **Features**:
  - OAuth token management
  - Order-based payment flow
  - Capture and refund operations
  - Sandbox/live environment switching

### Service Layer

#### PaymentGatewayService (Configuration Management)
- **Location**: `app/services/payment_gateway_service.ts`
- **Responsibilities**:
  - Encrypted credential storage/retrieval
  - Configuration caching (1-hour TTL)
  - Gateway availability checking
  - Cache invalidation

#### PaymentService (Business Logic)
- **Location**: `app/services/payment_service.ts`
- **Responsibilities**:
  - High-level payment operations
  - Provider configuration normalization
  - Currency and provider validation
  - Public API for frontend

#### PaymentValidator (Validation Layer)
- **Location**: `app/services/payment_validator.ts`
- **Features**:
  - Request validation
  - Security sanitization
  - Custom error classes
  - Webhook signature validation

## Security Architecture

### Encryption Layer
```typescript
// AES-256-CBC encryption using Node.js crypto
const ENCRYPTION_KEY = process.env.APP_KEY
const derivedKey = scryptSync(ENCRYPTION_KEY, 'salt', 32)

function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', derivedKey, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}
```

### Credential Storage
- **Model**: `PaymentGatewayKey`
- **Features**:
  - Automatic encryption on write
  - Automatic decryption on read
  - Secure credential management
  - Gateway-specific configurations

### Webhook Security
- **Signature Verification**: Each provider implements signature validation
- **IP Whitelisting**: Optional (configurable)
- **Replay Attack Prevention**: Timestamp validation
- **Error Handling**: Consistent error responses

## API Architecture

### Controllers

#### PaymentController
- **Location**: `app/controllers/payment_controller.ts`
- **Endpoints**:
  - `GET /api/payment-providers` - List available providers
  - `POST /api/payments/initialize` - Start payment
  - `POST /api/payments/verify` - Verify payment

#### WebhookController
- **Location**: `app/controllers/webhook_controller.ts`
- **Endpoints**:
  - `POST /api/payments/webhook/:provider` - Generic webhook
  - `POST /api/payments/webhook/stripe` - Stripe-specific
  - `POST /api/payments/webhook/paystack` - Paystack-specific
  - `POST /api/payments/webhook/flutterwave` - Flutterwave-specific
  - `POST /api/payments/webhook/paypal` - PayPal-specific

#### PaymentSettingsController (Admin)
- **Location**: `app/controllers/payment_settings_controller.ts`
- **Endpoints**:
  - `GET /api/admin/payment-gateway-settings` - List configurations
  - `POST /api/admin/payment-gateway-settings` - Create/update
  - `PATCH /api/admin/payment-gateway-settings/:gateway/toggle` - Toggle status
  - `DELETE /api/admin/payment-gateway-settings/:gateway` - Delete

### Routing Configuration
```typescript
// start/routes.ts
// Webhook endpoints (no auth - secured by signature verification)
router.post('/payments/webhook/stripe', [controllers.Webhook, 'stripeWebhook'])
router.post('/payments/webhook/paystack', [controllers.Webhook, 'paystackWebhook'])
router.post('/payments/webhook/flutterwave', [controllers.Webhook, 'flutterwaveWebhook'])
router.post('/payments/webhook/paypal', [controllers.Webhook, 'paypalWebhook'])

// Authenticated payment endpoints
router.post('/payments/initialize', [controllers.Payment, 'initialize'])
router.post('/payments/verify', [controllers.Payment, 'verify'])
```

## Configuration Management

### Payment Configuration
- **Location**: `config/payment.ts`
- **Features**:
  - Provider-specific settings
  - Currency support per provider
  - Webhook endpoint mapping
  - Payment limits and validation rules

### Environment Variables
```env
# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_WEBHOOK_SECRET=...

# Global settings
PAYMENT_DEFAULT_PROVIDER=stripe
PAYMENT_CURRENCY=USD
PAYMENT_WEBHOOK_URL_BASE=https://yourdomain.com/api/payments/webhook
```

## Frontend Integration

### Admin Interface
- **Location**: `inertia/pages/admin/AdminPaymentSettings.tsx`
- **Features**:
  - Gateway configuration management
  - Credential input with masking
  - Status toggling
  - Currency settings
  - Provider testing interface

### Payment Components
- **PaymentProviderSelector**: Choose payment method
- **CheckoutForm**: Handle payment initiation
- **PaymentStatus**: Display transaction status

## Error Handling

### Custom Error Classes
```typescript
export class PaymentValidationError extends Error {
  constructor(message: string, public code: string, public details?: Record<string, any>)
}

export class PaymentProcessingError extends Error {
  constructor(message: string, public code: string, public provider: string, public details?: Record<string, any>)
}
```

### Error Response Format
```typescript
{
  success: false,
  error: "Payment validation failed",
  code: "VALIDATION_ERROR",
  details: {
    amount: "Amount must be greater than 0",
    currency: "Currency USD is not supported"
  }
}
```

## Data Flow

### Payment Initialization Flow
1. **Frontend** → `POST /api/payments/initialize`
2. **PaymentController** → Validates request using `PaymentValidator`
3. **PaymentController** → Creates `Order` record
4. **PaymentController** → Calls `PaymentGateway.initiatePayment()`
5. **PaymentGateway** → Routes to appropriate `Provider` (Factory Pattern)
6. **Provider** → Calls external API (Adapter Pattern)
7. **Provider** → Returns standardized `PaymentResponse`
8. **PaymentController** → Returns response to frontend

### Webhook Processing Flow
1. **Payment Gateway** → Sends webhook to `/api/payments/webhook/{provider}`
2. **WebhookController** → Validates signature
3. **WebhookController** → Calls `PaymentGateway.handleWebhook()`
4. **PaymentGateway** → Routes to appropriate `Provider`
5. **Provider** → Processes webhook event
6. **WebhookController** → Updates `Order` status
7. **WebhookController** → Triggers post-completion logic

## Caching Strategy

### Gateway Configuration Cache
- **Implementation**: In-memory Map with TTL
- **Cache Key**: `payment_gateway:{gateway}`
- **TTL**: 1 hour (3600 seconds)
- **Invalidation**: Manual via `PaymentGatewayService.clearCache()`

### Provider Instance Cache
- **Implementation**: Map in `PaymentGateway`
- **Purpose**: Lazy loading and instance reuse
- **Lifecycle**: Application lifetime

## Testing & Validation

### Request Validation
- **Library**: VineJS
- **Validators**: 
  - `initializePaymentValidator`
  - `verifyPaymentValidator`
  - `paymentSettingsValidator`

### Provider Testing
- **Test Webhooks**: Admin can trigger test webhooks
- **Sandbox Mode**: All providers support sandbox/test modes
- **Credential Validation**: Real-time validation on configuration

## Monitoring & Logging

### Structured Logging
```typescript
logger.info('Payment initiated successfully', {
  provider: 'stripe',
  orderId: order.id,
  orderNumber: order.orderNumber,
  transactionId: result.transactionId,
})
```

### Error Tracking
- All payment errors logged with context
- Provider-specific error codes preserved
- Request/response payloads logged (sanitized)

## Extensibility

### Adding New Payment Provider
1. Implement `PaymentProvider` interface
2. Add to `PaymentGateway.getProvider()` switch
3. Add configuration to `config/payment.ts`
4. Create webhook endpoint in `WebhookController`
5. Add admin UI configuration

### Provider-Specific Features
- Each provider can implement additional methods
- Configuration flexibility via `getConfig()`
- Custom error handling per provider

## Database Schema

### PaymentGatewayKey Table
```sql
CREATE TABLE payment_gateway_keys (
  id INTEGER PRIMARY KEY,
  uuid VARCHAR(32) UNIQUE,
  gateway VARCHAR(50) UNIQUE,
  _public_key TEXT, -- encrypted
  _secret_key TEXT, -- encrypted
  merchant_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  _webhook_secret TEXT, -- encrypted
  created_at DATETIME,
  updated_at DATETIME
);
```

### Orders Table Integration
- Links to `Product`, `User` (buyer/vendor/affiliate)
- Stores payment metadata and status
- Tracks revenue splits and commissions

## Performance Considerations

### Lazy Loading
- Providers only instantiated when needed
- Database credentials loaded on first use
- HTTP clients created per-provider

### Connection Pooling
- Axios clients with connection reuse
- Timeout configurations per provider
- Retry logic for failed requests

### Async Operations
- All payment operations are async
- Webhook processing doesn't block responses
- Background order completion tasks

## Security Best Practices

### Credential Management
- All sensitive data encrypted at rest
- Keys never logged or exposed in responses
- Database access through encrypted getters/setters

### Webhook Security
- Signature verification for all webhooks
- Provider-specific signature algorithms
- Replay attack prevention

### Input Validation
- Strict type checking
- Sanitization of metadata
- Amount and currency validation

### Error Information
- Generic error messages to prevent information leakage
- Detailed logging for internal debugging
- Rate limiting on payment endpoints

## Deployment Considerations

### Environment Configuration
- Separate credentials for staging/production
- Provider sandbox/live mode switching
- Webhook URL configuration per environment

### SSL/TLS Requirements
- HTTPS required for all payment endpoints
- Valid SSL certificates for webhook endpoints
- Secure header transmission

### Monitoring
- Payment success/failure rates
- Provider availability monitoring
- Response time tracking
- Error rate alerting

---

This architecture provides a robust, secure, and extensible payment processing system that can handle multiple payment providers while maintaining consistency, security, and performance across the entire platform.