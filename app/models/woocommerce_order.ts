import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import WoocommerceStore from '#models/woocommerce_store'

export default class WoocommerceOrder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare woocommerceStoreId: number

  @column()
  declare wooOrderId: number

  @column()
  declare orderNumber: string

  @column()
  declare customerEmail: string | null

  @column()
  declare customerName: string | null

  @column()
  declare currency: string

  @column()
  declare totalPrice: number

  @column()
  declare subtotalPrice: number

  @column()
  declare taxPrice: number

  @column()
  declare shippingPrice: number

  @column()
  declare discountAmount: number

  @column()
  declare affiliateLinkUsed: boolean

  @column()
  declare affiliateId: number | null

  @column()
  declare campaignId: number | null

  @column()
  declare orderedAt: DateTime

  @column()
  declare status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded'

  @column()
  declare paymentMethod: string | null

  @column()
  declare paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'

  @column()
  declare lineItems: string // JSON array

  @column()
  declare shippingAddress: string | null // JSON

  @column()
  declare billingAddress: string | null // JSON

  @column()
  declare notes: string | null

  @column()
  declare commissionCalculated: boolean

  @column()
  declare commissionAmount: number

  @column()
  declare vendorCommissionAmount: number

  @column()
  declare affiliateCommissionAmount: number

  @column()
  declare commissionStatus: 'pending' | 'approved' | 'paid' | 'cancelled'

  @column()
  declare conversionId: number | null

  @column()
  declare isDisputed: boolean

  @column()
  declare disputeReason: string | null

  @column()
  declare syncedToHub: boolean

  @column()
  declare rawData: string | null // JSON

  @column()
  declare refundedAt: DateTime | null

  @column()
  declare refundAmount: number

  @column()
  declare webhookReceived: boolean

  @column()
  declare lastWebhookAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => WoocommerceStore, {
    foreignKey: 'woocommerceStoreId',
  })
  declare store: BelongsTo<typeof WoocommerceStore>
}
