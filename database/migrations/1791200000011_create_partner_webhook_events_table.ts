import { BaseSchema } from '@adonisjs/lucid/schema'

/** Outbox: one row per event, written in the same transaction as the state change. */
export default class extends BaseSchema {
  protected tableName = 'partner_webhook_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.string('type', 64).notNullable()
      table.jsonb('payload').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.index(['partner_id', 'livemode', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
