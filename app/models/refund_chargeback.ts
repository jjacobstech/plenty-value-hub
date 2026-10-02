import { belongsTo, column, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel } from '@adonisjs/lucid/orm'
import User from '#models/user'
import Order from '#models/order'
import VendorConversion from '#models/vendor_conversion'
import CommissionLedger from '#models/commission_ledger'
import crypto from 'node:crypto'

export default class RefundChargeback extends BaseModel {
  static table = 'refunds_chargebacks'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare vendorId: number

  @column()
  declare orderId: number | null

  @column()
  declare vendorConversionId: number | null

  @column()
  declare commissionLedgerId: number | null

  @column()
  declare type: 'refund' | 'chargeback' | 'partial_refund'

  @column()
  declare externalId: string

  @column()
  declare externalReference: string | null

  @column()
  declare originalAmount: number

  @column()
  declare refundAmount: number

  @column()
  declare commissionToReverse: number | null

  @column()
  declare currency: string

  @column()
  declare status: 'pending' | 'verified' | 'approved' | 'rejected' | 'completed'

  @column.dateTime()
  declare initiatedAt: DateTime

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime()
  declare rejectedAt: DateTime | null

  @column()
  declare reason: string | null

  @column()
  declare customerReason: string | null

  @column()
  declare internalNotes: string | null

  @column()
  declare commissionReversed: boolean

  @column.dateTime()
  declare commissionReversedAt: DateTime | null

  @column()
  declare commissionAmountReversed: number | null

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async generateUuid(refund: RefundChargeback) {
    if (!refund.uuid) {
      refund.uuid = crypto.randomUUID()
    }
  }

  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: BelongsTo<typeof User>

  @belongsTo(() => Order, { foreignKey: 'orderId' })
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => VendorConversion, { foreignKey: 'vendorConversionId' })
  declare vendorConversion: BelongsTo<typeof VendorConversion>

  @belongsTo(() => CommissionLedger, { foreignKey: 'commissionLedgerId' })
  declare commissionLedger: BelongsTo<typeof CommissionLedger>

  // Helper methods
  isChargeback(): boolean {
    return this.type === 'chargeback'
  }

  isRefund(): boolean {
    return this.type === 'refund'
  }

  isPartialRefund(): boolean {
    return this.type === 'partial_refund'
  }

  isPending(): boolean {
    return this.status === 'pending'
  }

  isApproved(): boolean {
    return this.status === 'approved'
  }

  isCompleted(): boolean {
    return this.status === 'completed'
  }

  markAsVerified(): void {
    this.status = 'verified'
    this.verifiedAt = DateTime.now()
  }

  markAsApproved(approvedBy: number, notes?: string): void {
    this.status = 'approved'
    this.approvedAt = DateTime.now()
    this.approvedBy = approvedBy
    if (notes) {
      this.approvalNotes = notes
    }
  }

  markAsCompleted(): void {
    this.status = 'completed'
    this.completedAt = DateTime.now()
  }

  markAsRejected(reason: string): void {
    this.status = 'rejected'
    this.rejectedAt = DateTime.now()
    this.reason = reason
  }

  markCommissionReversed(amount: number): void {
    this.commissionReversed = true
    this.commissionReversedAt = DateTime.now()
    this.commissionAmountReversed = amount
  }
}
