import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ShopifyStore from '#models/shopify_store'

export default class ShopifyOrder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare shopifyStoreId: number

  @column()
  declare shopifyOrderId: string

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
  declare fulfillmentStatus: 'pending' | 'partial' | 'fulfilled' | 'voided' | 'cancelled'

  @column()
  declare paymentStatus: 'pending' | 'authorized' | 'paid' | 'refunded' | 'voided'

  @column()
  declare financialStatus: 'pending' | 'paid' | 'refunded' | 'voided' | 'partially_paid' | 'partially_refunded'

  @column()
  declare lineItems: string // JSON array of {product_id, variant_id, quantity, price}

  @column()
  declare shippingAddress: string | null // JSON

  @column()
  declare billingAddress: string | null // JSON

  @column()
  declare notes: string | null

  @column()
  declare tags: string | null // JSON array

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
  declare rawData: string | null // JSON with full Shopify response

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

  @belongsTo(() => ShopifyStore, {
    foreignKey: 'shopifyStoreId',
  })
  declare store: BelongsTo<typeof ShopifyStore>
}
