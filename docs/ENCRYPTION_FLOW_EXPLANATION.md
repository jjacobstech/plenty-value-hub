# Payment Gateway Key Encryption/Decryption Flow

## How Original Key Values Are Retrieved

The encryption system works through **Lucid model getters and setters** that automatically handle encryption/decryption.

### The Flow

#### 1. **Storing Keys (Encryption)**

When you SET a key value:

```typescript
const key = new PaymentGatewayKey()
key.publicKey = 'pk_live_123456789' // ← You assign the ORIGINAL value
key.secretKey = 'sk_live_987654321'
await key.save()
```

What happens internally:

```typescript
set publicKey(value: string) {
  this._publicKey = encrypt(value)  // Encrypts BEFORE storing
}
```

**In Database**: The encrypted value is stored (e.g., `a1b2c3:d4e5f6g7...`)

---

#### 2. **Retrieving Keys (Decryption)**

When you GET a key value:

```typescript
const key = await PaymentGatewayKey.findByGateway('stripe')
console.log(key.publicKey) // ← Returns DECRYPTED original value
```

What happens internally:

```typescript
get publicKey(): string {
  try {
    return decrypt(this._publicKey)  // Decrypts from database
  } catch (err) {
    console.error('[PaymentGatewayKey] Failed to decrypt public key:', err)
    return this._publicKey  // Fallback if decryption fails
  }
}
```

**Result**: You get back the original `'pk_live_123456789'`

---

### 3. **Real-World Examples**

#### Example A: In a Controller

```typescript
// app/controllers/payment_settings_controller.ts

async show({ params }: HttpContext) {
  const key = await PaymentGatewayKey.findByGateway(params.gateway)

  // When you access .publicKey, getter automatically decrypts
  const originalPublicKey = key.publicKey  // ✅ DECRYPTED
  const originalSecretKey = key.secretKey  // ✅ DECRYPTED

  return {
    gateway: key.gateway,
    publicKey: originalPublicKey,
    secretKey: originalSecretKey,
    isActive: key.isActive
  }
}
```

#### Example B: In Payment Provider

```typescript
// app/services/payment_providers/paystack_provider.ts

async initiatePayment(amount: number, email: string) {
  const key = await PaymentGatewayKey.findByGateway('paystack')

  // When you access .publicKey, getter automatically decrypts
  const publicKey = key.publicKey        // ✅ DECRYPTED: sk_live_...
  const secretKey = key.secretKey        // ✅ DECRYPTED: pk_live_...

  // Use decrypted keys with payment gateway API
  const response = await paystack.initiate({
    authorization: `Bearer ${publicKey}`,
    amount: amount * 100,
    email: email
  })

  return response
}
```

#### Example C: Getting All Configs

```typescript
// app/services/payment_gateway_service.ts

async getConfig(gateway: string) {
  const key = await PaymentGatewayKey.findByGateway(gateway)

  // Call getConfig() method which accesses getters
  return key.getConfig()  // Returns object with DECRYPTED values
}

// Inside getConfig():
getConfig() {
  return {
    gateway: this.gateway,
    publicKey: this.publicKey,      // ✅ Getter called → DECRYPTED
    secretKey: this.secretKey,      // ✅ Getter called → DECRYPTED
    merchantId: this.merchantId,
    webhookSecret: this.webhookSecret,  // ✅ Getter called → DECRYPTED
    isActive: this.isActive,
  }
}
```

---

## Database vs Memory

### What's Stored in Database

```sql
-- payment_gateway_keys table
id | gateway | _publicKey           | _secretKey           | isActive | createdAt | updatedAt
1  | stripe  | a1b2c3:d4e5f6g7h... | b2c3d4:e5f6g7h8i... | true     | 2024-... | 2024-...
2  | paystack| c3d4e5:f6g7h8i9j... | d4e5f6:g7h8i9j0k... | true     | 2024-... | 2024-...
```

These are **encrypted hex strings** - not readable without the decryption key.

### What You Access in Code

```typescript
const key = await PaymentGatewayKey.findByGateway('stripe')

// key._publicKey = 'a1b2c3:d4e5f6g7h...' (encrypted in DB)
// key.publicKey  = 'pk_live_123456789' (decrypted by getter)
```

---

## Security Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORING A NEW KEY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  key.publicKey = 'pk_live_123456789'  (Plain text you provide)  │
│           │                                                       │
│           ↓                                                       │
│  [SETTER: publicKey] triggers automatic encryption               │
│           │                                                       │
│           ↓                                                       │
│  encrypt(value) {                                                │
│    - Generate random IV (16 bytes)                              │
│    - Encrypt with AES-256-CBC using APP_KEY                     │
│    - Return: 'a1b2c3:d4e5f6g7h...' (IV:Ciphertext)             │
│  }                                                               │
│           │                                                       │
│           ↓                                                       │
│  this._publicKey = 'a1b2c3:d4e5f6g7h...' (Encrypted)           │
│           │                                                       │
│           ↓                                                       │
│  await key.save()                                                │
│           │                                                       │
│           ↓                                                       │
│  [DATABASE] Stores: _publicKey = 'a1b2c3:d4e5f6g7h...'         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   RETRIEVING A STORED KEY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  const key = await PaymentGatewayKey.findByGateway('stripe')   │
│           │                                                       │
│           ↓                                                       │
│  [DATABASE LOAD] this._publicKey = 'a1b2c3:d4e5f6g7h...'       │
│                  (Encrypted, as stored)                          │
│           │                                                       │
│           ↓                                                       │
│  const original = key.publicKey                                  │
│           │                                                       │
│           ↓                                                       │
│  [GETTER: publicKey] triggers automatic decryption               │
│           │                                                       │
│           ↓                                                       │
│  decrypt(this._publicKey) {                                      │
│    - Split: 'a1b2c3:d4e5f6g7h...' → IV & Ciphertext            │
│    - Decrypt with AES-256-CBC using APP_KEY                     │
│    - Return: 'pk_live_123456789' (Plain text)                  │
│  }                                                               │
│           │                                                       │
│           ↓                                                       │
│  original = 'pk_live_123456789'  ✅ READY TO USE               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Points

1. **Getters do the work**: Every access to `key.publicKey` automatically decrypts
2. **Setters do the work**: Every assignment to `key.publicKey = value` automatically encrypts
3. **Transparent to your code**: You don't need to call encrypt/decrypt manually
4. **APP_KEY is the master key**: All encryption uses `process.env.APP_KEY`
5. **IV is unique**: Each encryption has a random IV for security
6. **Error handling**: Falls back to encrypted value if decryption fails

---

## Critical: APP_KEY Must Match

The same `APP_KEY` used for encryption MUST be used for decryption:

```
Encryption:   APP_KEY = 'my-secret' ➜ Encrypted value stored
Decryption:   APP_KEY = 'my-secret' ➜ ✅ Works! Original value returned
Decryption:   APP_KEY = 'wrong-key' ➜ ❌ Failed! Can't decrypt
```

If you change `APP_KEY` in `.env`, ALL existing encrypted keys become unreadable.

---

## Where Keys Are Used

1. **Payment Controllers**: Use `key.publicKey` and `key.secretKey` directly
2. **Payment Providers**: Call `key.getConfig()` which returns decrypted values
3. **Admin UI**: Display decrypted values (with masking for security)
4. **Webhooks**: Use `key.webhookSecret` to verify signature

All automatically decrypted via getters ✅
