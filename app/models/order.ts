import { OrderSchema } from '#database/schema'
import { belongsTo, column, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Product from '#models/product'
import AffiliateLink from '#models/affiliate_link'
import Campaign from '#models/campaign'
import crypto from 'node:crypto'

export default class Order extends OrderSchema {
  @column()
  declare uuid: string

  @column()
  declare campaignId: number | null

  @column()
  declare conversionStatus: 'pending' | 'approved' | 'rejected' | 'reversed' | 'disputed'

  @column()
  declare conversionVerified: boolean

  @column()
  declare conversionVerifiedAt: Date | null

  @column()
  declare conversionVerificationMethod: string | null

  @column()
  declare isReversed: boolean

  @column()
  declare reversedAt: Date | null

  @column()
  declare reversalReason: string | null

  @column()
  declare isDisputed: boolean

  @column()
  declare disputedAt: Date | null

  @column()
  declare disputeReason: string | null

  @column()
  declare attributionWindowDays: number

  @column()
  declare attributionExpiresAt: Date | null

  @column({
    prepare: (v: any) => (v == null ? null : JSON.stringify(v)),
    consume: (v: any) => {
      if (v == null) return null
      if (typeof v === 'string') {
        try { return JSON.parse(v) } catch { return v }
      }
      return v
    },
  })
  declare conversionValidationMetadata: any | null

  @beforeSave()
  static async generateUuid(order: Order) {
    if (!order.uuid) {
      order.uuid = crypto.randomUUID()
    }
  }

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => User, { foreignKey: 'buyerId' })
  declare buyer: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof User>

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>

  @belongsTo(() => Campaign, { foreignKey: 'campaignId' })
  declare campaign: BelongsTo<typeof Campaign>
}
