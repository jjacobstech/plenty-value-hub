import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_dashboard_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.integer('affiliate_id').unsigned().notNullable().references('id').inTable('partner_affiliates').onDelete('CASCADE')
      table.specificType('token_hash', 'char(64)').notNullable().unique()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('redeemed_at', { useTz: true }).nullable()
      table.text('return_url').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
