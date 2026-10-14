import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.string('external_event_id', 191).notNullable()
      table.string('type', 64).notNullable()
      table.integer('click_id').unsigned().nullable().references('id').inTable('partner_clicks').onDelete('SET NULL')
      table.integer('affiliate_id').unsigned().nullable().references('id').inTable('partner_affiliates').onDelete('SET NULL')
      table.integer('link_id').unsigned().nullable().references('id').inTable('partner_links').onDelete('SET NULL')
      table.string('referred_external_user_id', 191).nullable()
      table.integer('amount').nullable()
      table.specificType('currency', 'char(3)').nullable()
      table.enum('status', ['attributed', 'unattributed', 'rejected', 'reversed']).notNullable()
      table.string('reason', 64).nullable()
      table.timestamp('occurred_at', { useTz: true }).notNullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.unique(['partner_id', 'livemode', 'external_event_id'])
      table.index(['partner_id', 'livemode', 'referred_external_user_id'])
      table.index(['partner_id', 'livemode', 'affiliate_id', 'occurred_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
