import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_commissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.integer('event_id').unsigned().notNullable().unique().references('id').inTable('partner_events').onDelete('CASCADE')
      table.integer('affiliate_id').unsigned().notNullable().references('id').inTable('partner_affiliates').onDelete('CASCADE')
      table.string('affiliate_external_user_id', 191).notNullable()
      table.integer('amount').notNullable()
      table.specificType('currency', 'char(3)').notNullable()
      table.enum('status', ['pending', 'approved', 'rejected', 'reversed']).notNullable().defaultTo('pending')
      table.timestamp('hold_until', { useTz: true }).notNullable()
      table.timestamp('approved_at', { useTz: true }).nullable()
      table.timestamp('rejected_at', { useTz: true }).nullable()
      table.timestamp('reversed_at', { useTz: true }).nullable()
      table.timestamp('paid_at', { useTz: true }).nullable()
      table.string('payout_reference', 191).nullable()
      table.string('reason', 255).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.index(['partner_id', 'livemode', 'status', 'hold_until'])
      table.index(['partner_id', 'livemode', 'affiliate_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
