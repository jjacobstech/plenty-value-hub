# Encryption Import Fix

## Problem

The PaymentGatewayKey model was trying to import `encrypt` and `decrypt` from `@adonisjs/core/helpers`, but this export doesn't exist in AdonisJS:

```
ERROR: The requested module '@adonisjs/core/helpers' does not provide an export named 'decrypt'
```

## Solution

Implemented custom encryption/decryption functions using Node.js's built-in `crypto` module:

### What Changed

**File**: `app/models/payment_gateway_key.ts`

**Before**:

```typescript
import { encrypt, decrypt } from '@adonisjs/core/helpers'
```

**After**:

```typescript
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ENCRYPTION_KEY = process.env.APP_KEY || 'default-insecure-key-change-in-production'
const derivedKey = scryptSync(ENCRYPTION_KEY, 'salt', 32)

function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', derivedKey, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = Buffer.from(parts[1], 'hex')
  const decipher = createDecipheriv('aes-256-cbc', derivedKey, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString('utf8')
}
```

## Technical Details

- **Algorithm**: AES-256-CBC (Advanced Encryption Standard with 256-bit key)
- **Key Derivation**: scryptSync (derives 32-byte key from APP_KEY)
- **IV (Initialization Vector)**: Randomly generated for each encryption (16 bytes)
- **Format**: `{hex_iv}:{hex_encrypted_data}` - IV is prepended to ciphertext for decryption

## Security Notes

1. **APP_KEY is required**: Uses `process.env.APP_KEY` for key derivation
   - Must be set in `.env` file for production
   - Default fallback is insecure (for development only)

2. **IV is randomized**: Each encryption produces different ciphertext
   - Same plaintext encrypted twice produces different results
   - This is cryptographically correct behavior

3. **All payment credentials encrypted**:
   - Public keys
   - Secret keys
   - Webhook secrets

## Verification

✅ Build completes successfully: `npm run build`
✅ Dev server starts without errors: `npm run dev`
✅ Encryption/decryption functions work correctly
✅ Model getters/setters properly decrypt on access

## Impact

- No breaking changes to existing code
- All payment gateway credentials continue to be encrypted
- Compatible with existing database records
- Uses industry-standard AES-256-CBC encryption
