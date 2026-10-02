import { belongsTo, column, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel } from '@adonisjs/lucid/orm'
import User from '#models/user'
import Campaign from '#models/campaign'
import Product from '#models/product'
import Order from '#models/order'
import VendorConversion from '#models/vendor_conversion'
import AffiliateLink from '#models/affiliate_link'
import crypto from 'node:crypto'

export default class CommissionLedger extends BaseModel {
  static table = 'commission_ledger'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare vendorId: number

  @column()
  declare affiliateId: number

  @column()
  declare campaignId: number

  @column()
  declare productId: number | null

  @column()
  declare orderId: number | null

  @column()
  declare vendorConversionId: number | null

  @column()
  declare affiliateLinkId: number | null

  @column()
  declare amount: number

  @column()
  declare saleAmount: number

  @column()
  declare rate: number | null

  @column()
  declare commissionType: 'percentage' | 'fixed_amount' | 'lead_commission' | 'cost_per_acquisition' | 'tiered' | 'hybrid'

  @column()
  declare status: 'pending' | 'approved' | 'held' | 'paid' | 'reversed' | 'disputed' | 'voided'

  @column()
  declare holdingDays: number

  @column.dateTime()
  declare holdUntil: DateTime | null

  @column()
  declare onHold: boolean

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column()
  declare payoutId: string | null

  @column()
  declare paymentReference: string | null

  @column.dateTime()
  declare reversedAt: DateTime | null

  @column()
  declare reversalReason: string | null

  @column()
  declare reversalType: 'refund' | 'chargeback' | 'fraud' | 'manual' | null

  @column.dateTime()
  declare disputedAt: DateTime | null

  @column()
  declare disputeReason: string | null

  @column()
  declare disputeResolved: boolean

  @column.dateTime()
  declare disputeResolvedAt: DateTime | null

  @column()
  declare approvedBy: number | null

  @column()
  declare approvalNotes: string | null

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

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async generateUuid(commission: CommissionLedger) {
    if (!commission.uuid) {
      commission.uuid = crypto.randomUUID()
    }
    if (!commission.holdUntil && commission.status === 'pending') {
      commission.holdUntil = DateTime.now().plus({ days: commission.holdingDays })
    }
  }

  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof User>

  @belongsTo(() => Campaign, { foreignKey: 'campaignId' })
  declare campaign: BelongsTo<typeof Campaign>

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Order, { foreignKey: 'orderId' })
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => VendorConversion, { foreignKey: 'vendorConversionId' })
  declare vendorConversion: BelongsTo<typeof VendorConversion>

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>

  // Helper methods
  isHoldExpired(): boolean {
    if (!this.holdUntil) return true
    return DateTime.now() > this.holdUntil
  }

  canBeApproved(): boolean {
    return this.status === 'pending' && this.isHoldExpired()
  }

  isPending(): boolean {
    return this.status === 'pending'
  }

  isApproved(): boolean {
    return this.status === 'approved'
  }

  isPaid(): boolean {
    return this.status === 'paid'
  }

  isReversed(): boolean {
    return this.status === 'reversed'
  }

  isDisputed(): boolean {
    return this.status === 'disputed'
  }

  markAsApproved(approvedBy: number, notes?: string): void {
    this.status = 'approved'
    this.onHold = false
    this.approvedAt = DateTime.now()
    this.approvedBy = approvedBy
    if (notes) {
      this.approvalNotes = notes
    }
  }

  markAsPaid(payoutId: string, paymentReference?: string): void {
    this.status = 'paid'
    this.paidAt = DateTime.now()
    this.payoutId = payoutId
    if (paymentReference) {
      this.paymentReference = paymentReference
    }
  }

  markAsReversed(reason: string, type: 'refund' | 'chargeback' | 'fraud' | 'manual'): void {
    this.status = 'reversed'
    this.reversedAt = DateTime.now()
    this.reversalReason = reason
    this.reversalType = type
  }

  markAsDisputed(reason: string): void {
    this.status = 'disputed'
    this.disputedAt = DateTime.now()
    this.disputeReason = reason
    this.disputeResolved = false
  }

  resolveDispute(resolved: boolean): void {
    this.disputeResolved = resolved
    this.disputeResolvedAt = DateTime.now()
    if (resolved) {
      this.status = 'approved'
    }
  }

  void(): void {
    this.status = 'voided'
  }
}
