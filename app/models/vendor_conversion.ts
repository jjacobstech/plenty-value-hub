import { belongsTo, column, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel } from '@adonisjs/lucid/orm'
import User from '#models/user'
import Campaign from '#models/campaign'
import AffiliateLink from '#models/affiliate_link'
import crypto from 'node:crypto'

export default class VendorConversion extends BaseModel {
  static table = 'vendor_conversions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare vendorId: number

  @column()
  declare campaignId: number

  @column()
  declare affiliateLinkId: number | null

  @column()
  declare affiliateId: number | null

  @column()
  declare externalOrderId: string

  @column()
  declare externalReference: string | null

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare customerEmail: string | null

  @column()
  declare customerPhone: string | null

  @column()
  declare customerIdentifier: string | null

  @column()
  declare affiliateLinkCode: string | null

  @column()
  declare status: 'pending' | 'approved' | 'rejected' | 'reversed' | 'disputed'

  @column()
  declare commissionAmount: number | null

  @column()
  declare commissionStatus: 'pending' | 'calculated' | 'held' | 'approved' | 'reversed'

  @column.dateTime()
  declare holdUntil: DateTime | null

  @column()
  declare holdingDays: number

  @column()
  declare flaggedForReview: boolean

  @column()
  declare fraudFlags: string | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare disputeReason: string | null

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
  declare validationErrors: any | null

  @column()
  declare approvedBy: number | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare reversedAt: DateTime | null

  @column()
  declare reversalReason: string | null

  @column()
  declare source: 'api' | 'webhook' | 'manual' | 'import'

  @column()
  declare sourceReference: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async generateUuid(conversion: VendorConversion) {
    if (!conversion.uuid) {
      conversion.uuid = crypto.randomUUID()
    }
    if (!conversion.holdUntil && conversion.status === 'pending') {
      conversion.holdUntil = DateTime.now().plus({ days: conversion.holdingDays })
    }
  }

  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: BelongsTo<typeof User>

  @belongsTo(() => Campaign, { foreignKey: 'campaignId' })
  declare campaign: BelongsTo<typeof Campaign>

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof User>

  isHoldExpired(): boolean {
    if (!this.holdUntil) return false
    return DateTime.now() > this.holdUntil
  }

  canBeApproved(): boolean {
    return this.status === 'pending' && (this.isHoldExpired() || !this.flaggedForReview)
  }

  markAsApproved(approvedBy: number, commissionAmount: number): void {
    this.status = 'approved'
    this.commissionStatus = 'calculated'
    this.commissionAmount = commissionAmount
    this.approvedBy = approvedBy
    this.approvedAt = DateTime.now()
  }

  markAsRejected(reason: string): void {
    this.status = 'rejected'
    this.rejectionReason = reason
  }

  markAsReversed(reason: string): void {
    this.status = 'reversed'
    this.commissionStatus = 'reversed'
    this.reversalReason = reason
    this.reversedAt = DateTime.now()
  }
}
