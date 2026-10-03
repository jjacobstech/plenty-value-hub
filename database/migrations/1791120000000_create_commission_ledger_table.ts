import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('commission_ledgers', (table) => {
      table.increments('id')
      table.string('ledger_id').unique().notNullable()
      table.integer('affiliate_id').unsigned().notNullable()
      table.integer('campaign_id').unsigned().notNullable()
      table.integer('conversion_id').unsigned().notNullable()
      table.integer('affiliate_link_id').unsigned().notNullable()
      table.enum('status', ['pending', 'approved', 'paid', 'rejected', 'disputed']).defaultTo('pending')
      table.decimal('order_value', 15, 2).notNullable()
      table.enum('commission_type', ['percentage', 'fixed_amount', 'lead', 'hybrid']).notNullable()
      table.decimal('commission_rate', 5, 2).nullable()
      table.decimal('commission_amount', 12, 2).notNullable()
      table.enum('currency', ['USD', 'GBP', 'EUR', 'NGN', 'KES', 'ZAR']).defaultTo('USD')
      table.decimal('platform_fee_amount', 12, 2).defaultTo(0)
      table.decimal('net_commission', 12, 2).notNullable()
      table.text('description').nullable()
      table.text('rejection_reason').nullable()
      table.datetime('approved_at').nullable()
      table.datetime('paid_at').nullable()
      table.datetime('rejected_at').nullable()
      table.integer('approved_by_admin_id').unsigned().nullable()
      table.integer('paid_by_admin_id').unsigned().nullable()
      table.integer('disputed_by_user_id').unsigned().nullable()
      table.datetime('disputed_at').nullable()
      table.text('dispute_reason').nullable()
      table.json('metadata').nullable()
      table.datetime('created_at').notNullable()
      table.datetime('updated_at').notNullable()
      table.index('ledger_id')
      table.index('affiliate_id')
      table.index('campaign_id')
      table.index('conversion_id')
      table.index('affiliate_link_id')
      table.index('status')
      table.index(['affiliate_id', 'status'])
      table.index(['affiliate_id', 'campaign_id'])
      table.index('created_at')
      table.index('approved_at')
      table.index('paid_at')
    })
  }

  async down() {
    this.schema.dropTable('commission_ledgers')
  }
}
