import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

/**
 * Simple encryption/decryption utilities using Node's crypto module
 * Uses AES-256-CBC for consistent encryption
 */
const ENCRYPTION_KEY = process.env.APP_KEY || 'default-insecure-key-change-in-production'

// Derive a proper 32-byte key from APP_KEY
const derivedKey = scryptSync(ENCRYPTION_KEY, 'salt', 32)

function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', derivedKey, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  // Return IV + encrypted data as hex string
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

export default class PaymentGatewayKey extends BaseModel {
  static table = 'payment_gateway_keys'

  @column({ isPrimary: true })
  declare id: number

  /**
   * Gateway identifier (unique): 'paystack', 'flutterwave', 'paypal', 'stripe'
   */
  @column()
  declare gateway: string

  /**
   * Encrypted public key/API key
   */
  @column()
  private _publicKey!: string

  /**
   * Encrypted secret key
   */
  @column()
  private _secretKey!: string

  /**
   * Optional merchant ID (not always encrypted since it's often public)
   */
  @column()
  declare merchantId: string | null

  /**
   * Whether this gateway is active/enabled
   */
  @column()
  declare isActive: boolean

  /**
   * Encrypted webhook secret (for webhook signature verification)
   */
  @column()
  private _webhookSecret!: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Getter for public key - decrypts on access
   */
  get publicKey(): string {
    try {
      return decrypt(this._publicKey)
    } catch (err) {
      console.error('[PaymentGatewayKey] Failed to decrypt public key:', err)
      return this._publicKey // Fallback to encrypted value if decryption fails
    }
  }

  /**
   * Setter for public key - encrypts on set
   */
  set publicKey(value: string) {
    this._publicKey = encrypt(value)
  }

  /**
   * Getter for secret key - decrypts on access
   */
  get secretKey(): string {
    try {
      return decrypt(this._secretKey)
    } catch (err) {
      console.error('[PaymentGatewayKey] Failed to decrypt secret key:', err)
      return this._secretKey // Fallback to encrypted value if decryption fails
    }
  }

  /**
   * Setter for secret key - encrypts on set
   */
  set secretKey(value: string) {
    this._secretKey = encrypt(value)
  }

  /**
   * Getter for webhook secret - decrypts on access
   */
  get webhookSecret(): string | null {
    if (!this._webhookSecret) return null
    try {
      return decrypt(this._webhookSecret)
    } catch (err) {
      console.error('[PaymentGatewayKey] Failed to decrypt webhook secret:', err)
      return this._webhookSecret // Fallback to encrypted value if decryption fails
    }
  }

  /**
   * Setter for webhook secret - encrypts on set
   */
  set webhookSecret(value: string | null) {
    this._webhookSecret = value ? encrypt(value) : null
  }

  /**
   * Get gateway by name
   */
  static async findByGateway(gateway: string) {
    return this.query().where('gateway', gateway).first()
  }

  /**
   * Get all active gateways
   */
  static async getActiveGateways() {
    return this.query().where('is_active', true)
  }

  /**
   * Get gateway configuration as object (for API clients)
   */
  getConfig() {
    return {
      gateway: this.gateway,
      publicKey: this.publicKey,
      secretKey: this.secretKey,
      merchantId: this.merchantId,
      webhookSecret: this.webhookSecret,
      isActive: this.isActive,
    }
  }

  /**
   * Update gateway credentials
   */
  async updateCredentials(
    publicKey: string,
    secretKey: string,
    webhookSecret?: string,
    merchantId?: string
  ) {
    this.publicKey = publicKey
    this.secretKey = secretKey
    if (webhookSecret) {
      this.webhookSecret = webhookSecret
    }
    if (merchantId) {
      this.merchantId = merchantId
    }
    await this.save()
  }

  /**
   * Toggle gateway active status
   */
  async toggleActive() {
    this.isActive = !this.isActive
    await this.save()
    return this.isActive
  }
}
