import { belongsTo, hasMany, column, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel } from '@adonisjs/lucid/orm'
import User from '#models/user'
import Product from '#models/product'
import Order from '#models/order'
import AffiliateLink from '#models/affiliate_link'
import crypto from 'node:crypto'

export default class Campaign extends BaseModel {
  static table = 'campaigns'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare name: string

  @column()
  declare slug: string | null

  @column()
  declare description: string | null

  @column()
  declare termsAndConditions: string | null

  @column()
  declare promotionGuidelines: string | null

  @column()
  declare vendorId: number

  @column()
  declare vendorName: string | null

  @column.dateTime()
  declare startDate: DateTime | null

  @column.dateTime()
  declare endDate: DateTime | null

  @column()
  declare commissionType: 'percentage' | 'fixed_amount' | 'lead_commission' | 'cost_per_acquisition' | 'tiered' | 'hybrid'

  @column()
  declare commissionValue: number

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
  declare tieredCommissionStructure: any | null

  @column()
  declare fixedFee: number | null

  @column()
  declare attributionWindowDays: number

  @column()
  declare status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'expired' | 'rejected' | 'archived'

  @column()
  declare totalClicks: number

  @column()
  declare totalConversions: number

  @column()
  declare totalCommissionPaid: number

  @column()
  declare conversionRate: number | null

  @column()
  declare averageCommissionPerSale: number | null

  @column()
  declare isFeatured: boolean

  @column()
  declare visibilityRank: number | null

  @column()
  declare featuredImageUrl: string | null

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
  declare galleryUrls: string[] | null

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
  declare tags: string[] | null

  @column()
  declare category: string

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
  declare affiliateResources: any | null

  @column()
  declare approvalNotes: string | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare suspendedAt: DateTime | null

  @column()
  declare suspensionReason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async generateUuid(campaign: Campaign) {
    if (!campaign.uuid) {
      campaign.uuid = crypto.randomUUID()
    }
  }

  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: BelongsTo<typeof User>

  @hasMany(() => Product, { foreignKey: 'campaignId' })
  declare products: HasMany<typeof Product>

  @hasMany(() => Order, { foreignKey: 'campaignId' })
  declare orders: HasMany<typeof Order>

  @hasMany(() => AffiliateLink, { foreignKey: 'campaignId' })
  declare affiliateLinks: HasMany<typeof AffiliateLink>

  // Helper methods
  isActive(): boolean {
    const now = DateTime.now()
    if (this.status !== 'active') return false
    if (this.startDate && now < this.startDate) return false
    if (this.endDate && now > this.endDate) return false
    return true
  }

  isExpired(): boolean {
    if (this.status === 'expired') return true
    if (this.endDate && DateTime.now() > this.endDate) return true
    return false
  }

  canAffiliate(): boolean {
    return this.isActive() && !this.suspendedAt
  }
}
