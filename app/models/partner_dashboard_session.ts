import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PartnerAffiliate from '#models/partner_affiliate'

export default class PartnerDashboardSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'partner_id' })
  declare partnerId: number

  @column()
  declare livemode: boolean

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column({ columnName: 'token_hash' })
  declare tokenHash: string

  @column.dateTime({ columnName: 'expires_at' })
  declare expiresAt: DateTime

  @column.dateTime({ columnName: 'redeemed_at' })
  declare redeemedAt: DateTime | null

  @column({ columnName: 'return_url' })
  declare returnUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PartnerAffiliate, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof PartnerAffiliate>
}
