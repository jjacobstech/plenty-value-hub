import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import AffiliateCampaign from '#models/affiliate_campaign'

export default class Campaign extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare vendorId: number

  @column()
  declare name: string

  @column()
  declare productServiceName: string

  @column()
  declare description: string

  @column()
  declare imageUrl: string | null

  @column()
  declare category: string

  @column()
  declare status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected'

  @column()
  declare commissionType: 'percentage' | 'fixed_amount' | 'lead' | 'hybrid'

  @column()
  declare commissionAmount: number

  @column()
  declare purchaseDestination: string

  @column({ columnName: 'purchase_destination_url' })
  declare purchaseDestinationUrl: string | null

  @column({ columnName: 'purchase_destination_type' })
  declare purchaseDestinationType: string | null

  @column({ columnName: 'webhook_url' })
  declare webhookUrl: string | null

  @column({ columnName: 'webhook_secret' })
  declare webhookSecret: string | null

  @column({ columnName: 'external_integration_config' })
  declare externalIntegrationConfig: Record<string, any> | null

  @column({ columnName: 'commission_value' })
  declare commissionValue: number | null

  @column({ columnName: 'fixed_fee' })
  declare fixedFee: number | null

  @column({ columnName: 'tiered_commission_structure' })
  declare tieredCommissionStructure: any[] | null

  @column()
  declare attributionWindowDays: number

  @column()
  declare campaignTerms: string | null

  @column()
  declare promotionalGuidelines: string | null

  @column.dateTime()
  declare startDate: DateTime

  @column.dateTime()
  declare endDate: DateTime | null

  @column()
  declare targetAudience: string | null

  @column()
  declare minimumRequirementsForAffiliates: string | null

  @column()
  declare approvalRequirements: string | null

  @column()
  declare totalClicks: number

  @column()
  declare totalConversions: number

  @column({ columnName: 'total_redirects' })
  declare totalRedirects: number

  @column({ columnName: 'total_external_conversions' })
  declare totalExternalConversions: number

  @column()
  declare conversionRate: number | null

  @column()
  declare totalRevenue: number

  @column()
  declare totalCommission: number

  @column({ columnName: 'total_commission_paid' })
  declare totalCommissionPaid: number | null

  @column()
  declare activeAffiliates: number

  @column()
  declare averageConversionRate: number

  @column()
  declare rejectionReason: string | null

  @column()
  declare rejectedByAdminId: number | null

  @column.dateTime()
  declare rejectedAt: DateTime | null

  @column()
  declare approvedByAdminId: number | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: BelongsTo<typeof User>

  @hasMany(() => AffiliateCampaign)
  declare affiliates: HasMany<typeof AffiliateCampaign>
}
