import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import InfluencerProfile from '#models/influencer_profile'
import Campaign from '#models/campaign'

export default class CollaborationAgreement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare influencerId: number

  @column()
  declare campaignId: number

  @column()
  declare vendorId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare status: 'draft' | 'proposed' | 'accepted' | 'active' | 'completed' | 'cancelled'

  @column()
  declare commissionStructure: string // JSON: { type: 'percentage' | 'flat', value: number, bonus?: {...} }

  @column()
  declare baseCommissionRate: number // percentage

  @column()
  declare bonusStructure: string | null // JSON: milestone bonuses, performance targets

  @column()
  declare performanceTargets: string | null // JSON: minimum conversions, revenue, etc.

  @column()
  declare exclusivityClause: boolean

  @column()
  declare exclusiveCategories: string | null // JSON array of excluded product categories

  @column()
  declare contentRequirements: string | null // JSON: posts per month, formats required, etc.

  @column()
  declare paymentTerms: string // weekly, bi-weekly, monthly

  @column()
  declare minimumPayout: number

  @column()
  declare startDate: DateTime

  @column()
  declare endDate: DateTime | null

  @column()
  declare autoRenewal: boolean

  @column()
  declare renewalTermDays: number | null

  @column()
  declare totalEarnings: number

  @column()
  declare totalConversions: number

  @column()
  declare totalClicks: number

  @column()
  declare avgOrderValue: number

  @column()
  declare conversionRate: number

  @column()
  declare agreementDocument: string | null // URL to signed agreement

  @column()
  declare notes: string | null

  @column()
  declare proposedBy: number // influencer or vendor

  @column()
  declare proposedAt: DateTime

  @column()
  declare acceptedAt: DateTime | null

  @column()
  declare acceptedBy: number | null

  @column()
  declare completedAt: DateTime | null

  @column()
  declare cancelledAt: DateTime | null

  @column()
  declare cancellationReason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => InfluencerProfile, {
    foreignKey: 'influencerId',
  })
  declare influencer: BelongsTo<typeof InfluencerProfile>

  @belongsTo(() => Campaign, {
    foreignKey: 'campaignId',
  })
  declare campaign: BelongsTo<typeof Campaign>
}
