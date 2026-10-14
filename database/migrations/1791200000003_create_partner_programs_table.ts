import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_programs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.integer('attribution_window_days').notNullable().defaultTo(30)
      table.enum('attribution_model', ['last_click', 'first_click']).notNullable().defaultTo('last_click')
      table.jsonb('allowed_event_types').notNullable().defaultTo('["registration"]')
      table.enum('commission_mode', ['none', 'flat', 'percent']).notNullable().defaultTo('none')
      table.integer('commission_flat_amount').nullable()
      table.integer('commission_percent_bps').nullable()
      table.specificType('commission_currency', 'char(3)').nullable()
      table.integer('commission_hold_days').notNullable().defaultTo(14)
      table.boolean('auto_approve_after_hold').notNullable().defaultTo(true)
      table.boolean('self_referral_blocked').notNullable().defaultTo(true)
      table.integer('dedupe_unique_click_minutes').notNullable().defaultTo(30)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.unique(['partner_id', 'livemode'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
