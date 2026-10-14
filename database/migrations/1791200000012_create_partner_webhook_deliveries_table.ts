import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_webhook_deliveries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('webhook_event_id').unsigned().notNullable().references('id').inTable('partner_webhook_events').onDelete('CASCADE')
      table.integer('endpoint_id').unsigned().notNullable().references('id').inTable('partner_webhook_endpoints').onDelete('CASCADE')
      table.integer('attempt').unsigned().notNullable().defaultTo(0)
      table.enum('status', ['pending', 'succeeded', 'failed']).notNullable().defaultTo('pending')
      table.timestamp('next_attempt_at', { useTz: true }).nullable()
      table.integer('response_status').nullable()
      table.string('response_body_excerpt', 1000).nullable()
      table.integer('duration_ms').nullable()
      table.timestamp('delivered_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.index(['status', 'next_attempt_at'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
