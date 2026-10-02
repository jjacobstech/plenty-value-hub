import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refunds_chargebacks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid').unique().notNullable()

      // Relationships
      table.integer('vendor_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('order_id').unsigned().nullable().references('id').inTable('orders')
      table.integer('vendor_conversion_id').unsigned().nullable().references('id').inTable('vendor_conversions')
      table.integer('commission_ledger_id').unsigned().nullable().references('id').inTable('commission_ledger')

      // Refund/Chargeback details
      table.enum('type', ['refund', 'chargeback', 'partial_refund']).notNullable()
      table.string('external_id').unique().notNullable()
      table.string('external_reference').nullable()

      // Amount information
      table.decimal('original_amount', 12, 2).notNullable()
      table.decimal('refund_amount', 12, 2).notNullable()
      table.decimal('commission_to_reverse', 12, 2).nullable()
      table.string('currency').defaultTo('NGN')

      // Status
      table.enum('status', [
        'pending',
        'verified',
        'approved',
        'rejected',
        'completed'
      ]).defaultTo('pending')

      // Refund processing
      table.dateTime('initiated_at').notNullable()
      table.dateTime('verified_at').nullable()
      table.dateTime('approved_at').nullable()
      table.dateTime('completed_at').nullable()
      table.dateTime('rejected_at').nullable()

      // Reason information
      table.text('reason').nullable()
      table.text('customer_reason').nullable()
      table.text('internal_notes').nullable()

      // Commission handling
      table.boolean('commission_reversed').defaultTo(false)
      table.dateTime('commission_reversed_at').nullable()
      table.decimal('commission_amount_reversed', 12, 2).nullable()

      // Approval tracking
      table.integer('approved_by').unsigned().nullable().references('id').inTable('users')
      table.string('approval_notes').nullable()

      // Metadata
      table.json('metadata').nullable()

      // Indices
      table.index('vendor_id')
      table.index('order_id')
      table.index('vendor_conversion_id')
      table.index('status')
      table.index('type')
      table.index('external_id')
      table.index('commission_reversed')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
