import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { column, beforeSave, computed } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(user: User) {
    if (!user.uuid) {
      user.uuid = crypto.randomUUID()
    }
  }

  @column()
  declare role: 'admin' | 'vendor' | 'affiliate' | 'consumer'

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column()
  declare otpCode: string | null

  @column.dateTime()
  declare otpExpiresAt: DateTime | null

  @column()
  declare resetToken: string | null

  @column.dateTime()
  declare resetTokenExpiresAt: DateTime | null

  @column()
  declare businessName: string | null

  @column()
  declare country: string | null

  @column()
  declare phone: string | null

  @column()
  declare businessType: 'individual' | 'business' | null

  @column()
  declare heardAbout: string | null

  // Shared profile fields
  @column()
  declare profilePicture: string | null

  @column()
  declare bio: string | null

  @column()
  declare website: string | null

  @column()
  declare instagram: string | null

  @column()
  declare twitter: string | null

  @column()
  declare youtube: string | null

  @column()
  declare location: string | null

  // Affiliate-specific
  @column()
  declare niche: string | null

  @column()
  declare marketingChannels: string | null

  // Vendor-specific
  @column()
  declare businessDescription: string | null

  @column()
  declare businessLogo: string | null

  @column()
  declare coverBanner: string | null

  @column()
  declare productCategories: string | null

  // Vendor and Affiliate Payout Configuration
  @column()
  declare payoutMethod: string | null

  @column()
  declare payoutBankName: string | null

  @column()
  declare payoutAccountNumber: string | null

  @column()
  declare payoutAccountName: string | null

  @column()
  declare payoutRoutingNumber: string | null

  @column()
  declare payoutSwiftCode: string | null

  @column()
  declare payoutMobileProvider: string | null

  @column()
  declare payoutMobileNumber: string | null

  @column()
  declare payoutEmail: string | null

  @column()
  declare payoutAccountId: string | null

  @column()
  declare payoutDetails: string | null

  /**
   * Resolve image URLs from storage keys
   */
  private async resolveImageUrl(imageKey: string | null): Promise<string | null> {
    if (!imageKey) return null
    
    // If it's already a full URL, return it
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      return imageKey
    }

    try {
      const storageDisk = env.get('DRIVE')
      const url = await drive.use(storageDisk).getUrl(imageKey)
      return url
    } catch {
      return null
    }
  }

  /**
   * Custom serializer to resolve image URLs
   */
  override serialize() {
    const serialized = super.serialize() as any
    
    // Sync version for basic profile loads - store keys as-is
    // URLs will be resolved on-demand by computed properties or getter
    return serialized
  }

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }

  get isEmailVerified() {
    return this.emailVerifiedAt !== null
  }
}
