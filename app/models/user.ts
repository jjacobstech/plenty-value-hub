import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
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
