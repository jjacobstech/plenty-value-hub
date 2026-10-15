import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_api_keys'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.string('name').notNullable()
      table.specificType('key_hash', 'char(64)').notNullable().unique()
      table.string('prefix', 32).notNullable()
      table.specificType('last4', 'char(4)').notNullable()
      table.timestamp('last_used_at', { useTz: true }).nullable()
      table.timestamp('revoked_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
