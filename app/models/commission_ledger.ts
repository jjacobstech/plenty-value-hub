import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Conversion from '#models/conversion'
import AffiliateLink from '#models/affiliate_link'

export default class CommissionLedger extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'ledger_id' })
  declare ledgerId: string

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column({ columnName: 'campaign_id' })
  declare campaignId: number

  @column({ columnName: 'conversion_id' })
  declare conversionId: number

  @column({ columnName: 'affiliate_link_id' })
  declare affiliateLinkId: number

  @column({ columnName: 'status' })
  declare status: 'pending' | 'approved' | 'paid' | 'rejected' | 'disputed'

  @column({ columnName: 'order_value' })
  declare orderValue: number

  @column({ columnName: 'commission_type' })
  declare commissionType: 'percentage' | 'fixed_amount' | 'lead' | 'hybrid'

  @column({ columnName: 'commission_rate' })
  declare commissionRate: number | null

  @column({ columnName: 'commission_amount' })
  declare commissionAmount: number

  @column({ columnName: 'currency' })
  declare currency: string

  @column({ columnName: 'platform_fee_amount' })
  declare platformFeeAmount: number

  @column({ columnName: 'net_commission' })
  declare netCommission: number

  @column({ columnName: 'amount' })
  declare amount: number

  @column({ columnName: 'description' })
  declare description: string | null

  @column({ columnName: 'rejection_reason' })
  declare rejectionReason: string | null

  @column.dateTime({ columnName: 'approved_at' })
  declare approvedAt: DateTime | null

  @column.dateTime({ columnName: 'paid_at' })
  declare paidAt: DateTime | null

  @column.dateTime({ columnName: 'released_at' })
  declare releasedAt: DateTime | null

  @column.dateTime({ columnName: 'rejected_at' })
  declare rejectedAt: DateTime | null

  @column({ columnName: 'approved_by_admin_id' })
  declare approvedByAdminId: number | null

  @column({ columnName: 'paid_by_admin_id' })
  declare paidByAdminId: number | null

  @column({ columnName: 'disputed_by_user_id' })
  declare disputedByUserId: number | null

  @column.dateTime({ columnName: 'disputed_at' })
  declare disputedAt: DateTime | null

  @column({ columnName: 'dispute_reason' })
  declare disputeReason: string | null

  @column({ columnName: 'metadata' })
  declare metadata: any

  @column.dateTime({ columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Conversion, { foreignKey: 'conversionId' })
  declare conversion: BelongsTo<typeof Conversion>

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>

  isReversed(): boolean {
    return this.status === 'disputed'
  }

  markAsReversed(reason: string, type: string): void {
    this.status = 'disputed'
    this.disputeReason = reason
  }
}
