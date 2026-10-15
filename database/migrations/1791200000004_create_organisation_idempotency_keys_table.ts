import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_idempotency_keys'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.string('key', 255).notNullable()
      table.string('request_method', 10).notNullable()
      table.string('request_path', 255).notNullable()
      table.specificType('request_hash', 'char(64)').notNullable()
      table.integer('response_status').nullable()
      table.jsonb('response_body').nullable()
      table.timestamp('locked_at', { useTz: true }).nullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.unique(['partner_id', 'livemode', 'key'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
