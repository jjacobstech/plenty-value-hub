import crypto from 'node:crypto'
import app from '@adonisjs/core/services/app'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || app.cliArgs.includes('serve') ? crypto.randomBytes(32).toString('hex') : process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY environment variable must be set and at least 32 characters')
}

const IV_LENGTH = 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    )
    let decrypted = decipher.update(parts[1], 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('[EncryptionService] Decryption failed:', error)
    throw new Error('Failed to decrypt credential')
  }
}
