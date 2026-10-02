import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vendor_conversions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid').unique().notNullable()

      // Relationships
      table.integer('vendor_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns').notNullable()
      table.integer('affiliate_link_id').unsigned().nullable().references('id').inTable('affiliate_links')
      table.integer('affiliate_id').unsigned().nullable().references('id').inTable('users')

      // Conversion details
      table.string('external_order_id').notNullable().unique()
      table.string('external_reference').nullable()
      table.decimal('amount', 12, 2).notNullable()
      table.string('currency').defaultTo('NGN')

      // Customer information (non-sensitive)
      table.string('customer_email').nullable()
      table.string('customer_phone').nullable()
      table.string('customer_identifier').nullable()

      // Affiliate link info (denormalized for quick lookup)
      table.string('affiliate_link_code').nullable()

      // Status tracking
      table.enum('status', [
        'pending',
        'approved',
        'rejected',
        'reversed',
        'disputed'
      ]).defaultTo('pending')

      // Commission calculation
      table.decimal('commission_amount', 12, 2).nullable()
      table.enum('commission_status', [
        'pending',
        'calculated',
        'held',
        'approved',
        'reversed'
      ]).defaultTo('pending')

      // Holding period
      table.dateTime('hold_until').nullable()
      table.integer('holding_days').defaultTo(30)

      // Validation & fraud detection
      table.boolean('flagged_for_review').defaultTo(false)
      table.string('fraud_flags').nullable()
      table.text('rejection_reason').nullable()
      table.text('dispute_reason').nullable()

      // Metadata
      table.json('metadata').nullable()
      table.json('validation_errors').nullable()

      // Approval tracking
      table.integer('approved_by').unsigned().nullable().references('id').inTable('users')
      table.dateTime('approved_at').nullable()

      // Reversal tracking
      table.dateTime('reversed_at').nullable()
      table.string('reversal_reason').nullable()

      // Source tracking
      table.enum('source', ['api', 'webhook', 'manual', 'import']).defaultTo('api')
      table.string('source_reference').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // Index for common queries
    this.schema.table(this.tableName, (table) => {
      table.index('vendor_id')
      table.index('campaign_id')
      table.index('affiliate_id')
      table.index('affiliate_link_id')
      table.index('status')
      table.index('external_order_id')
      table.index('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
