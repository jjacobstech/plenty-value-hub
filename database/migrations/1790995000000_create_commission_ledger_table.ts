import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commission_ledger'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid').unique().notNullable()

      // Relationships
      table.integer('vendor_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('affiliate_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns').notNullable()
      table.integer('product_id').unsigned().nullable().references('id').inTable('products')
      table.integer('order_id').unsigned().nullable().references('id').inTable('orders')
      table.integer('vendor_conversion_id').unsigned().nullable().references('id').inTable('vendor_conversions')
      table.integer('affiliate_link_id').unsigned().nullable().references('id').inTable('affiliate_links')

      // Commission details
      table.decimal('amount', 12, 2).notNullable()
      table.decimal('sale_amount', 12, 2).notNullable()
      table.decimal('rate', 5, 2).nullable()
      table.enum('commission_type', [
        'percentage',
        'fixed_amount',
        'lead_commission',
        'cost_per_acquisition',
        'tiered',
        'hybrid'
      ]).notNullable()

      // Status workflow
      table.enum('status', [
        'pending',
        'approved',
        'held',
        'paid',
        'reversed',
        'disputed',
        'voided'
      ]).defaultTo('pending')

      // Holding period
      table.integer('holding_days').defaultTo(30)
      table.dateTime('hold_until').nullable()
      table.boolean('on_hold').defaultTo(true)

      // Payment tracking
      table.dateTime('approved_at').nullable()
      table.dateTime('paid_at').nullable()
      table.string('payout_id').nullable()
      table.string('payment_reference').nullable()

      // Reversal tracking
      table.dateTime('reversed_at').nullable()
      table.string('reversal_reason').nullable()
      table.enum('reversal_type', [
        'refund',
        'chargeback',
        'fraud',
        'manual'
      ]).nullable()

      // Dispute tracking
      table.dateTime('disputed_at').nullable()
      table.text('dispute_reason').nullable()
      table.boolean('dispute_resolved').defaultTo(false)
      table.dateTime('dispute_resolved_at').nullable()

      // Approval tracking
      table.integer('approved_by').unsigned().nullable().references('id').inTable('users')
      table.text('approval_notes').nullable()

      // Metadata
      table.json('metadata').nullable()
      table.text('notes').nullable()

      // Indices for quick lookups
      table.index('vendor_id')
      table.index('affiliate_id')
      table.index('campaign_id')
      table.index('status')
      table.index('on_hold')
      table.index('created_at')
      table.index(['affiliate_id', 'status'])
      table.index(['vendor_id', 'status'])
      table.index(['campaign_id', 'status'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
