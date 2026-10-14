import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_webhook_endpoints'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.text('url').notNullable()
      table.text('secret_encrypted').notNullable()
      table.text('previous_secret_encrypted').nullable()
      table.timestamp('previous_secret_expires_at', { useTz: true }).nullable()
      table.jsonb('enabled_events').notNullable().defaultTo('["*"]')
      table.enum('status', ['enabled', 'disabled']).notNullable().defaultTo('enabled')
      table.string('description').nullable()
      table.timestamp('failing_since', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
