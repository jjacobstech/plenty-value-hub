import { belongsTo, column, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel } from '@adonisjs/lucid/orm'
import Campaign from '#models/campaign'
import Product from '#models/product'
import User from '#models/user'
import AffiliateLink from '#models/affiliate_link'
import crypto from 'node:crypto'

export default class PurchaseDestination extends BaseModel {
  static table = 'purchase_destinations'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare campaignId: number | null

  @column()
  declare productId: number | null

  @column()
  declare affiliateId: number | null

  @column()
  declare affiliateLinkId: number | null

  @column()
  declare destinationUrl: string

  @column()
  declare redirectToken: string

  @column.dateTime()
  declare redirectedAt: DateTime | null

  @column()
  declare customerEmail: string | null

  @column()
  declare customerIdentifier: string | null

  @column()
  declare status: 'pending' | 'redirected' | 'conversion_pending' | 'converted' | 'failed' | 'expired'

  @column()
  declare externalOrderId: string | null

  @column()
  declare externalReference: string | null

  @column()
  declare externalAmount: number | null

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
  declare metadata: any | null

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async generateUuid(destination: PurchaseDestination) {
    if (!destination.uuid) {
      destination.uuid = crypto.randomUUID()
    }
    if (!destination.redirectToken) {
      destination.redirectToken = crypto.randomBytes(32).toString('hex')
    }
    if (!destination.expiresAt) {
      destination.expiresAt = DateTime.now().plus({ days: 30 })
    }
  }

  @belongsTo(() => Campaign, { foreignKey: 'campaignId' })
  declare campaign: BelongsTo<typeof Campaign>

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof User>

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>

  isExpired(): boolean {
    return DateTime.now() > this.expiresAt
  }

  isConverted(): boolean {
    return this.status === 'converted'
  }

  markAsRedirected(): void {
    this.status = 'redirected'
    this.redirectedAt = DateTime.now()
  }

  markAsConverted(externalOrderId: string, amount: number): void {
    this.status = 'converted'
    this.externalOrderId = externalOrderId
    this.externalAmount = amount
  }
}
